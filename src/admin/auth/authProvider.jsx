import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  checkIsAdmin,
  readSession,
  signInWithEmailPassword,
  signOutSession,
  subscribeToAuthChanges,
} from "./session";

/** @type {import("react").Context<ReturnType<typeof buildAdminAuthValue> | null>} */
export const AdminAuthContext = createContext(null);

/**
 * @param {object} params
 * @param {import("@supabase/supabase-js").Session | null} params.session
 * @param {boolean} params.isAdmin
 * @param {boolean} params.loading
 * @param {string | null} params.error
 * @param {(email: string, password: string) => Promise<void>} params.signIn
 * @param {() => Promise<void>} params.signOut
 * @param {() => void} params.clearError
 */
function buildAdminAuthValue({
  session,
  isAdmin,
  loading,
  error,
  signIn,
  signOut,
  clearError,
}) {
  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.user),
    isAdmin,
    loading,
    error,
    signIn,
    signOut,
    clearError,
  };
}

/**
 * Provides centralized admin auth state for all /admin routes.
 * @param {object} props
 * @param {import("react").ReactNode} props.children
 */
export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(/** @type {import("@supabase/supabase-js").Session | null} */ (null));
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  const resolveMembership = useCallback(async (nextSession) => {
    if (!nextSession?.user?.id) {
      setSession(null);
      setIsAdmin(false);
      return;
    }

    const admin = await checkIsAdmin(nextSession.user.id);
    setSession(nextSession);
    setIsAdmin(admin);

    if (!admin) {
      // Authenticated but not an admin — clear the session so the public site
      // never inherits a non-admin auth cookie for privileged RLS paths.
      await signOutSession();
      setSession(null);
      setIsAdmin(false);
      const message =
        "This account is not authorized for the DGL admin dashboard.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const current = await readSession();
        if (!active) return;

        if (!current?.user?.id) {
          setSession(null);
          setIsAdmin(false);
          return;
        }

        const admin = await checkIsAdmin(current.user.id);
        if (!active) return;

        if (admin) {
          setSession(current);
          setIsAdmin(true);
        } else {
          await signOutSession();
          if (!active) return;
          setSession(null);
          setIsAdmin(false);
        }
      } catch (err) {
        if (!active) return;
        setSession(null);
        setIsAdmin(false);
        setError(err?.message ?? "Failed to restore admin session.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    const unsubscribe = subscribeToAuthChanges(async (_event, nextSession) => {
      try {
        if (!nextSession?.user?.id) {
          setSession(null);
          setIsAdmin(false);
          return;
        }

        const admin = await checkIsAdmin(nextSession.user.id);
        if (admin) {
          setSession(nextSession);
          setIsAdmin(true);
          setError(null);
        } else {
          await signOutSession();
          setSession(null);
          setIsAdmin(false);
        }
      } catch (err) {
        setSession(null);
        setIsAdmin(false);
        setError(err?.message ?? "Failed to update admin session.");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email, password) => {
      setError(null);
      setLoading(true);
      try {
        const nextSession = await signInWithEmailPassword(email, password);
        await resolveMembership(nextSession);
      } catch (err) {
        setSession(null);
        setIsAdmin(false);
        setError(err?.message ?? "Sign-in failed.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resolveMembership]
  );

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await signOutSession();
    } finally {
      setSession(null);
      setIsAdmin(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () =>
      buildAdminAuthValue({
        session,
        isAdmin,
        loading,
        error,
        signIn,
        signOut,
        clearError,
      }),
    [session, isAdmin, loading, error, signIn, signOut, clearError]
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}
