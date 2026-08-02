/**
 * Low-level admin auth session helpers.
 * Only this module may call Supabase Auth or query admin_users.
 */

import { getSupabaseClient, getSupabaseConfigIssues } from "../../supabase";

/**
 * @returns {Promise<import("@supabase/supabase-js").Session | null>}
 */
export async function readSession() {
  if (getSupabaseConfigIssues().length > 0) return null;

  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  return data.session ?? null;
}

/**
 * @param {(event: string, session: import("@supabase/supabase-js").Session | null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToAuthChanges(callback) {
  if (getSupabaseConfigIssues().length > 0) {
    return () => {};
  }

  const {
    data: { subscription },
  } = getSupabaseClient().auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => subscription.unsubscribe();
}

/**
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function checkIsAdmin(userId) {
  if (!userId) return false;
  if (getSupabaseConfigIssues().length > 0) return false;

  const { data, error } = await getSupabaseClient()
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.user_id);
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("@supabase/supabase-js").Session>}
 */
export async function signInWithEmailPassword(email, password) {
  const issues = getSupabaseConfigIssues();
  if (issues.length > 0) {
    throw new Error(issues.join(" "));
  }

  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;
  if (!data.session) {
    throw new Error("Sign-in succeeded but no session was returned.");
  }

  return data.session;
}

/**
 * @returns {Promise<void>}
 */
export async function signOutSession() {
  if (getSupabaseConfigIssues().length > 0) return;

  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}
