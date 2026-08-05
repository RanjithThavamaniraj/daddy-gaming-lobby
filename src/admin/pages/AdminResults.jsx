import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAdmin } from "../auth/useAdmin";
import { listTournaments } from "../repositories/tournamentRepository";
import { adminTournamentStyles } from "../styles/adminTournamentStyles";
import { formatAdminStatus } from "../lib/adminTournamentList";

/**
 * Results hub — jump into live/completed tournaments to enter match results.
 */
export default function AdminResults() {
  useAdmin();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    let cancelled = false;
    listTournaments()
      .then((list) => {
        if (cancelled) return;
        const relevant = (list ?? []).filter((t) =>
          ["registration_closed", "active", "completed"].includes(t.status)
        );
        setRows(relevant);
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load tournaments");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <style>{adminTournamentStyles}</style>
      <div className="admin-results-page">
        <h1 className="admin-page-title">Results</h1>
        <p className="admin-panel-desc">
          Enter match winners and scores from each tournament editor. Saving a
          result advances the bracket and updates standings / DGL Points
          automatically.
        </p>

        {error ? (
          <div className="admin-inline-error" role="alert">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="admin-muted">Loading tournaments…</p>
        ) : rows.length === 0 ? (
          <p className="admin-muted">
            No closed, live, or completed tournaments yet.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Game</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.championshipName}</td>
                    <td>{row.game}</td>
                    <td>{formatAdminStatus(row.status)}</td>
                    <td>
                      <Link
                        className="admin-btn admin-btn-primary"
                        to={`/admin/tournaments/${row.id}/edit`}
                      >
                        Open match editor
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
