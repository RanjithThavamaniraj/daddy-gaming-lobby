import { Link } from "react-router-dom";

import {
  formatAdminDate,
  formatAdminDateTime,
  formatAdminStatus,
} from "../lib/adminTournamentList";

/**
 * @param {object} props
 * @param {import("../lib/adminTournamentList").AdminTournamentRow[]} props.rows
 * @param {number} props.total
 * @param {number} props.page
 * @param {number} props.totalPages
 * @param {(page: number) => void} props.onPageChange
 */
export default function AdminTournamentTable({
  rows,
  total,
  page,
  totalPages,
  onPageChange,
}) {
  if (total === 0) {
    return (
      <div className="admin-table-empty" role="status">
        No tournaments match the current filters.
      </div>
    );
  }

  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tournament #</th>
              <th>Championship</th>
              <th>Game</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Reg. Limit</th>
              <th>Registration Opens</th>
              <th>Tournament Start</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="admin-table-mono">{row.tournamentNumber ?? "—"}</td>
                <td className="admin-table-primary">{row.championshipName}</td>
                <td>{row.game}</td>
                <td>
                  <span className="admin-status-pill" data-status={row.status}>
                    {formatAdminStatus(row.status)}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      row.isFeatured ? "admin-featured-yes" : "admin-featured-no"
                    }
                  >
                    {row.isFeatured ? "Yes" : "No"}
                  </span>
                </td>
                <td>{row.registrationLimit ?? "—"}</td>
                <td>{formatAdminDateTime(row.registrationOpensAt)}</td>
                <td>{formatAdminDateTime(row.startsAt)}</td>
                <td>{formatAdminDate(row.createdAt)}</td>
                <td>
                  <Link
                    className="admin-table-action"
                    to={`/admin/tournaments/${row.id}/edit`}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-mobile-cards" aria-label="Tournament cards">
        {rows.map((row) => (
          <article key={row.id} className="admin-mobile-card">
            <p className="admin-table-mono" style={{ margin: 0 }}>
                {row.tournamentNumber ?? "—"}
            </p>
            <h3 className="admin-mobile-card-title">{row.championshipName}</h3>
            <span className="admin-status-pill" data-status={row.status}>
              {formatAdminStatus(row.status)}
            </span>
            <div className="admin-mobile-card-meta">
              <div>
                <span className="admin-mobile-kv-label">Game</span>
                <span className="admin-mobile-kv-value">{row.game}</span>
              </div>
              <div>
                <span className="admin-mobile-kv-label">Featured</span>
                <span className="admin-mobile-kv-value">
                  {row.isFeatured ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="admin-mobile-kv-label">Reg. Limit</span>
                <span className="admin-mobile-kv-value">
                  {row.registrationLimit ?? "—"}
                </span>
              </div>
              <div>
                <span className="admin-mobile-kv-label">Created</span>
                <span className="admin-mobile-kv-value">
                  {formatAdminDate(row.createdAt)}
                </span>
              </div>
              <div>
                <span className="admin-mobile-kv-label">Registration Opens</span>
                <span className="admin-mobile-kv-value">
                  {formatAdminDateTime(row.registrationOpensAt)}
                </span>
              </div>
              <div>
                <span className="admin-mobile-kv-label">Tournament Start</span>
                <span className="admin-mobile-kv-value">
                  {formatAdminDateTime(row.startsAt)}
                </span>
              </div>
            </div>
            <Link
              className="admin-table-action admin-mobile-edit"
              to={`/admin/tournaments/${row.id}/edit`}
            >
              Edit
            </Link>
          </article>
        ))}
      </div>

      <div className="admin-pagination">
        <p className="admin-pagination-meta">
          Page {page} of {totalPages} · {total} tournament
          {total === 1 ? "" : "s"}
        </p>
        <div className="admin-pagination-actions">
          <button
            type="button"
            className="admin-pagination-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="admin-pagination-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
