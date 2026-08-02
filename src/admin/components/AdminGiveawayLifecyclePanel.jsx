import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAdmin } from "../auth/useAdmin";
import {
  GIVEAWAY_ACTION_DEFS,
  formatGiveawayStatus,
  getAvailableGiveawayActions,
} from "../lib/giveawayLifecycle";
import {
  GiveawayValidationError,
  archive,
  cancel,
  closeEntries,
  complete,
  publish,
  recordWinner,
  republishAnnouncement,
} from "../repositories/giveawayRepository";

const HANDLERS = {
  publish,
  closeEntries,
  complete,
  cancel,
  archive,
};

/**
 * Explicit giveaway lifecycle actions (no free status dropdown).
 *
 * @param {object} props
 * @param {string} props.giveawayId
 * @param {object | null} props.meta
 * @param {Array<{ playerId: string, playerName: string, discordName: string | null }>} props.eligiblePlayers
 * @param {() => void | Promise<void>} props.onChanged
 */
export default function AdminGiveawayLifecyclePanel({
  giveawayId,
  meta,
  eligiblePlayers,
  onChanged,
}) {
  const { user } = useAdmin();
  const navigate = useNavigate();
  const [busyAction, setBusyAction] = useState(/** @type {string | null} */ (null));
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [message, setMessage] = useState(/** @type {string | null} */ (null));
  const [winnerPlayerId, setWinnerPlayerId] = useState(meta?.winnerPlayerId ?? "");
  const [winnerNotes, setWinnerNotes] = useState("");

  useEffect(() => {
    setWinnerPlayerId(meta?.winnerPlayerId ?? "");
  }, [meta?.winnerPlayerId]);

  const available = getAvailableGiveawayActions(meta);
  const visibleActions = GIVEAWAY_ACTION_DEFS.filter(
    (action) => available[action.id] && action.id !== "recordWinner"
  );

  async function runAction(actionId, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    const handler = HANDLERS[actionId];
    if (!handler) return;

    setBusyAction(actionId);
    setError(null);
    setMessage(null);

    try {
      const result = await handler(giveawayId, { userId: user?.id ?? null });
      if (actionId === "archive") {
        setMessage("Giveaway archived.");
        await onChanged();
        navigate("/admin/giveaways");
        return;
      }
      setMessage(`Action completed. Status is now ${formatGiveawayStatus(result.status)}.`);
      await onChanged();
    } catch (err) {
      setError(
        err instanceof GiveawayValidationError
          ? err.message
          : err?.message ?? "Lifecycle action failed."
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRecordWinner() {
    setBusyAction("recordWinner");
    setError(null);
    setMessage(null);
    try {
      const result = await recordWinner(giveawayId, {
        playerId: winnerPlayerId,
        notes: winnerNotes,
        userId: user?.id ?? null,
      });
      setMessage(`Winner recorded: ${result.winnerName}.`);
      await onChanged();
    } catch (err) {
      setError(
        err instanceof GiveawayValidationError
          ? err.message
          : err?.message ?? "Could not record winner."
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRepublishAnnouncement() {
    if (
      !window.confirm(
        "Republish this announcement to Discord? Jarvis will post a new message based on the current giveaway status."
      )
    ) {
      return;
    }

    setBusyAction("republishAnnouncement");
    setError(null);
    setMessage(null);
    try {
      const result = await republishAnnouncement(giveawayId, {
        userId: user?.id ?? null,
      });
      setMessage(
        `Announcement republished (${result.activityType}). Discord should update shortly.`
      );
      await onChanged();
    } catch (err) {
      setError(
        err instanceof GiveawayValidationError
          ? err.message
          : err?.message ?? "Could not republish announcement."
      );
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <section className="admin-lifecycle" aria-label="Giveaway lifecycle">
      <div className="admin-lifecycle-header">
        <h2 className="admin-lifecycle-title">Lifecycle</h2>
        <p className="admin-lifecycle-copy">
          Status changes only through these actions. The Wheel of Names draw
          happens externally — use Record Winner to store the official result.
        </p>
        <p className="admin-form-meta">
          {formatGiveawayStatus(meta?.status)}
          {meta?.winnerName ? ` · Winner: ${meta.winnerName}` : ""}
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

        {available.republishAnnouncement ? (
          <article className="admin-lifecycle-card">
            <h3 className="admin-lifecycle-action-title">
              Republish Announcement
            </h3>
            <p className="admin-lifecycle-action-copy">
              Create a new Discord announcement for the current status without
              changing the giveaway. Use if a message was deleted or needs
              reposting.
            </p>
            <button
              type="button"
              className="admin-lifecycle-btn"
              disabled={Boolean(busyAction)}
              onClick={handleRepublishAnnouncement}
            >
              {busyAction === "republishAnnouncement"
                ? "Working…"
                : "Republish Announcement"}
            </button>
          </article>
        ) : null}
      </div>

      {available.recordWinner ? (
        <div className="admin-winner-panel">
          <h3 className="admin-lifecycle-action-title">Record Winner</h3>
          <p className="admin-lifecycle-action-copy">
            After the live Wheel of Names draw, choose the winner from the
            eligible list. Name and Discord are snapshotted automatically.
          </p>
          <div className="admin-form-field" style={{ marginTop: "0.85rem" }}>
            <label className="admin-toolbar-label" htmlFor="giveaway-winner">
              Eligible winner *
            </label>
            <select
              id="giveaway-winner"
              className="admin-toolbar-select admin-winner-select"
              value={winnerPlayerId}
              onChange={(e) => setWinnerPlayerId(e.target.value)}
            >
              <option value="">Select player…</option>
              {eligiblePlayers.map((player) => (
                <option key={player.playerId} value={player.playerId}>
                  {player.playerName}
                  {player.discordName ? ` (${player.discordName})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-field" style={{ marginTop: "0.75rem" }}>
            <label className="admin-toolbar-label" htmlFor="giveaway-winner-notes">
              Notes (optional)
            </label>
            <input
              id="giveaway-winner-notes"
              className="admin-toolbar-input"
              value={winnerNotes}
              onChange={(e) => setWinnerNotes(e.target.value)}
              placeholder="e.g. Drawn live on Discord stream"
            />
          </div>
          <button
            type="button"
            className="admin-lifecycle-btn"
            style={{ marginTop: "0.85rem" }}
            disabled={Boolean(busyAction) || !winnerPlayerId}
            onClick={handleRecordWinner}
          >
            {busyAction === "recordWinner" ? "Saving…" : "Record Winner"}
          </button>
        </div>
      ) : null}

      {(meta?.status === "winner_selected" || meta?.status === "completed") &&
      meta?.winnerName ? (
        <div className="admin-winner-panel" style={{ marginTop: "1rem" }}>
          <h3 className="admin-lifecycle-action-title">Official Winner</h3>
          <p className="admin-table-primary" style={{ margin: "0.35rem 0" }}>
            {meta.winnerName}
          </p>
          <p className="admin-form-hint" style={{ margin: 0 }}>
            Discord: {meta.winnerDiscordName ?? "—"}
          </p>
        </div>
      ) : null}
    </section>
  );
}
