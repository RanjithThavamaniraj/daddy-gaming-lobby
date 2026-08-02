import { Outlet } from "react-router-dom";

import { useAdmin } from "../auth/useAdmin";
import { adminShellStyles } from "../styles/adminShellStyles";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";

/**
 * Shared chrome for every protected admin page.
 * Auth is consumed via useAdmin() only — no Supabase here.
 */
export default function AdminShell() {
  useAdmin();

  return (
    <>
      <style>{adminShellStyles}</style>
      <div className="admin-shell">
        <AdminSidebar />
        <AdminTopBar />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
