import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdmin } from "./useAdmin";

/**
 * Single route wrapper for all protected admin pages.
 * Unauthenticated / non-admin users are sent to /admin/login.
 */
export default function AdminGuard() {
  const { loading, isAuthenticated, isAdmin } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-auth-loading" role="status" aria-live="polite">
        Checking admin session…
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
