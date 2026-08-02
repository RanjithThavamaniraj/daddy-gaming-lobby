import { Outlet } from "react-router-dom";

import { AdminAuthProvider } from "./auth/authProvider";
import { adminAuthStyles } from "./styles/adminAuthStyles";

/**
 * Wraps all /admin routes with the shared auth provider.
 */
export default function AdminAuthLayout() {
  return (
    <AdminAuthProvider>
      <style>{adminAuthStyles}</style>
      <Outlet />
    </AdminAuthProvider>
  );
}
