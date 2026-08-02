import { useState } from "react";
import { Navigate } from "react-router-dom";

import { useAdmin } from "../auth/useAdmin";
import { adminAuthStyles } from "../styles/adminAuthStyles";

/**
 * Admin email/password login. Auth only — no dashboard chrome.
 */
export default function AdminLogin() {
  const { loading, isAuthenticated, isAdmin, error, signIn, clearError } =
    useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(/** @type {string | null} */ (null));

  if (loading) {
    return (
      <>
        <style>{adminAuthStyles}</style>
        <div className="admin-auth-loading" role="status">
          Checking admin session…
        </div>
      </>
    );
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError(null);
    clearError();
    setSubmitting(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setLocalError(err?.message ?? "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = localError || error;

  return (
    <>
      <style>{adminAuthStyles}</style>
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="admin-auth-eyebrow">Daddy Gaming Lobby</p>
          <h1 className="admin-auth-title">Admin Sign In</h1>
          <p className="admin-auth-copy">
            Tournament administration is restricted to authorized operators.
          </p>

          {displayError ? (
            <p className="admin-auth-error" role="alert">
              {displayError}
            </p>
          ) : null}

          <form className="admin-auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="admin-auth-label" htmlFor="admin-email">
                Email
              </label>
              <input
                id="admin-email"
                className="admin-auth-input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="admin-auth-label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                className="admin-auth-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="admin-auth-submit"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
