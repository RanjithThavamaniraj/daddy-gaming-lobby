import AdminDashboardStatCards from "../components/AdminDashboardStatCards";
import { useAdmin } from "../auth/useAdmin";
import { useAdminTournamentCounts } from "../hooks/useAdminTournamentData";
import { adminTournamentStyles } from "../styles/adminTournamentStyles";

/**
 * Admin dashboard home with live tournament status counts (Phase 4A).
 */
export default function AdminDashboard() {
  useAdmin();
  const { counts, loading, error } = useAdminTournamentCounts();

  return (
    <>
      <style>{adminTournamentStyles}</style>
      <section>
        <header className="admin-page-header">
          <p className="admin-page-eyebrow">Overview</p>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-copy">
            Live tournament counts from the DGL database. Management tools continue
            on the Tournaments screen.
          </p>
        </header>

        {error ? (
          <div className="admin-inline-error" role="alert">
            {error}
          </div>
        ) : (
          <AdminDashboardStatCards counts={counts} loading={loading} />
        )}
      </section>
    </>
  );
}
