import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAdmin } from "../auth/useAdmin";
import {
  LIFECYCLE_ACTION_DEFS,
  getAvailableLifecycleActions,
} from "../lib/tournamentLifecycle";
import {
  TournamentValidationError,
  archiveTournament,
  cancelTournament,
  closeRegistration,
  completeTournament,
  duplicateTournament,
  featureTournament,
  openRegistration,
  publishTournament,
  restoreTournament,
  startTournament,
} from "../repositories/tournamentRepository";
import { formatAdminStatus } from "../lib/adminTournamentList";

const ACTION_HANDLERS = {
  publish: publishTournament,
  openRegistration,
  closeRegistration,
  startTournament,
  completeTournament,
  featureTournament,
  archiveTournament,
  cancelTournament,
  duplicateTournament,
  restoreTournament,
};

/**
 * Explicit lifecycle actions for the edit screen (no free status dropdown).
 *
 * @param {object} props
 * @param {string} props.tournamentId
 * @param {{ status?: string, isFeatured?: boolean, isArchived?: boolean, tournamentNumber?: string } | null} props.meta
 * @param {() => void | Promise<void>} props.onChanged
 */
export default function AdminTournamentLifecyclePanel({
  tournamentId,
  meta,
  onChanged,
}) {
  const { user } = useAdmin();
  const navigate = useNavigate();
  const [busyAction, setBusyAction] = useState(/** @type {string | null} */ (null));
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [message, setMessage] = useState(/** @type {string | null} */ (null));

  const available = getAvailableLifecycleActions(meta);
  const visibleActions = LIFECYCLE_ACTION_DEFS.filter(
    (action) => available[action.id]
  );

  async function runAction(actionId, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;

    const handler = ACTION_HANDLERS[actionId];
    if (!handler) return;

    setBusyAction(actionId);
    setError(null);
    setMessage(null);

    try {
      const result = await handler(tournamentId, { userId: user?.id ?? null });

      if (actionId === "duplicateTournament") {
        setMessage(
          `Draft copy created as Tournament #${result.globalNumber}.`
        );
        navigate(`/admin/tournaments/${result.id}/edit`, { replace: true });
        return;
      }

      if (actionId === "archiveTournament") {
        setMessage("Tournament archived.");
        await onChanged();
        navigate("/admin/tournaments");
        return;
      }

      if (actionId === "restoreTournament") {
        setMessage("Tournament restored from archive.");
        await onChanged();
        return;
      }

      setMessage(`Action completed. Status is now ${formatAdminStatus(result.status)}.`);
      await onChanged();
    } catch (err) {
      if (err instanceof TournamentValidationError) {
        setError(err.message);
      } else {
        setError(err?.message ?? "Lifecycle action failed.");
      }
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="admin-lifecycle" aria-label="Tournament lifecycle">
      <div className="admin-lifecycle-header">
        <h2 className="admin-lifecycle-title">Lifecycle</h2>
        <p className="admin-lifecycle-copy">
          Status changes only through these actions — there is no free status
          dropdown.
        </p>
        <p className="admin-form-meta">
          {meta?.tournamentNumber ?? "Tournament"}
          {meta?.status ? ` · ${formatAdminStatus(meta.status)}` : ""}
          {meta?.isFeatured ? " · Featured" : ""}
          {meta?.isArchived ? " · Archived" : ""}
        </p>
      </div>

      {error ? (
        <div className="admin-inline-error" role="alert">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="admin-inline-success" role="status">
          {message}
        </div>
      ) : null}

      {visibleActions.length === 0 ? (
        <div className="admin-table-empty" role="status">
          No lifecycle actions available for this tournament right now.
        </div>
      ) : (
        <div className="admin-lifecycle-grid">
          {visibleActions.map((action) => (
            <article
              key={action.id}
              className={`admin-lifecycle-card${
                action.tone === "danger" ? " is-danger" : ""
              }`}
            >
              <h3 className="admin-lifecycle-action-title">{action.label}</h3>
              <p className="admin-lifecycle-action-copy">{action.description}</p>
              <button
                type="button"
                className={
                  action.tone === "danger"
                    ? "admin-lifecycle-btn is-danger"
                    : "admin-lifecycle-btn"
                }
                disabled={Boolean(busyAction)}
                onClick={() => runAction(action.id, action.confirm)}
              >
                {busyAction === action.id ? "Working…" : action.label}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
