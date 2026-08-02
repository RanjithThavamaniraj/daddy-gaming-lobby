import { Link } from "react-router-dom";

import { useAdmin } from "../auth/useAdmin";
import { useAdminGiveawayList } from "../hooks/useAdminGiveawayList";
import { formatGiveawayStatus } from "../lib/giveawayLifecycle";
import { adminGiveawayStyles } from "../styles/adminGiveawayStyles";
import { adminTournamentStyles } from "../styles/adminTournamentStyles";

function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminGiveaways() {
  useAdmin();
  const { giveaways, counts, loading, error, reload } = useAdminGiveawayList();

  const cards = [
    { id: "draft", label: "Draft", value: counts?.draft },
    { id: "published", label: "Published", value: counts?.published },
    { id: "entries", label: "Entries Closed", value: counts?.entriesClosed },
    { id: "completed", label: "Completed", value: counts?.completed },
  ];

  return (
    <>
      <style>{adminTournamentStyles}</style>
      <style>{adminGiveawayStyles}</style>
      <section>
        <header className="admin-list-header-row">
          <div>
            <p className="admin-page-eyebrow">Community Rewards</p>
            <h1 className="admin-page-title">Giveaways</h1>
            <p className="admin-page-copy">
              Celebrate Discord milestones by rewarding players who joined
              official DGL tournaments. Eligibility is never entered manually.
            </p>
          </div>
          <Link
            className="admin-form-submit admin-header-cta"
            to="/admin/giveaways/new"
          >
            Create Giveaway
          </Link>
        </header>

        <div className="admin-stat-grid" style={{ marginBottom: "1.25rem" }}>
          {cards.map((card) => (
            <article key={card.id} className="admin-stat-card">
              <p className="admin-stat-label">{card.label}</p>
              <p className="admin-stat-value">
                {loading ? "…" : (card.value ?? "—")}
              </p>
            </article>
          ))}
        </div>

        {error ? (
          <div className="admin-inline-error" role="alert">
            <p style={{ margin: "0 0 0.75rem" }}>{error}</p>
            <button type="button" className="admin-pagination-btn" onClick={reload}>
              Retry
            </button>
          </div>
        ) : null}

        {!error && loading ? (
          <div className="admin-inline-loading" role="status">
            Loading giveaways…
          </div>
        ) : null}

        {!error && !loading && giveaways.length === 0 ? (
          <div className="admin-table-empty" role="status">
            No giveaways yet. Create the 150+ Members Celebration Giveaway to
            get started.
          </div>
        ) : null}

        {!error && !loading && giveaways.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Prize</th>
                  <th>Status</th>
                  <th>Tournaments</th>
                  <th>Winner</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {giveaways.map((row) => (
                  <tr key={row.id}>
                    <td className="admin-table-primary">{row.title}</td>
                    <td>{row.prize}</td>
                    <td>
                      <span className="admin-status-pill">{formatGiveawayStatus(row.status)}</span>
                    </td>
                    <td>{row.eligibleTournamentCount}</td>
                    <td>{row.winnerName ?? "—"}</td>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>
                      <Link
                        className="admin-table-action"
                        to={`/admin/giveaways/${row.id}/edit`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </>
  );
}
