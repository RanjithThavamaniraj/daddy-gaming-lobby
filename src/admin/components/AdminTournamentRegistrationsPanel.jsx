import { useCallback, useEffect, useMemo, useState } from "react";

import ReserveInfoTooltip from "../../components/tournaments/ReserveInfoTooltip";
import {
  formatRegistrationStatus,
  listRegistrationsForTournament,
  promoteReserveRegistration,
  swapReserveOrder,
  withdrawRegistration,
} from "../repositories/registrationRepository";

/**
 * Confirmed + Reserve management for tournament admin.
 * @param {object} props
 * @param {string} props.tournamentId
 * @param {boolean} [props.isRocketLeague=false]
 * @param {number | null} [props.registrationLimit]
 * @param {number} [props.reserveLimit]
 */
export default function AdminTournamentRegistrationsPanel({
  tournamentId,
  isRocketLeague = false,
  registrationLimit = null,
  reserveLimit = 4,
}) {
  const [rows, setRows] = useState(
    /** @type {import("../repositories/registrationRepository").AdminRegistrationRow[] | null} */ (
      null
    )
  );
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [message, setMessage] = useState(/** @type {string | null} */ (null));
  const [busyId, setBusyId] = useState(/** @type {string | null} */ (null));

  const reload = useCallback(async () => {
    if (!tournamentId) return;
    const next = await listRegistrationsForTournament(tournamentId);
    setRows(next);
  }, [tournamentId]);

  useEffect(() => {
    let cancelled = false;
    if (!tournamentId) return undefined;
    listRegistrationsForTournament(tournamentId)
      .then((next) => {
        if (!cancelled) setRows(next);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load registrations.");
      });
    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  const confirmed = useMemo(
    () => (rows ?? []).filter((r) => r.status === "confirmed" || r.status === "pending"),
    [rows]
  );
  const reserves = useMemo(
    () => (rows ?? []).filter((r) => r.status === "waitlist"),
    [rows]
  );

  async function runAction(registrationId, action) {
    setBusyId(registrationId);
    setError(null);
    setMessage(null);
    try {
      if (action === "promote") {
        await promoteReserveRegistration(registrationId);
        setMessage("Reserve player promoted to Confirmed.");
      } else if (action === "withdraw") {
        if (!window.confirm("Withdraw this registration?")) return;
        await withdrawRegistration(registrationId);
        setMessage("Registration withdrawn.");
      } else if (action === "up" || action === "down") {
        await swapReserveOrder(registrationId, action);
        setMessage("Reserve order updated.");
      }
      await reload();
    } catch (err) {
      setError(err?.message ?? "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="admin-lifecycle" aria-label="Tournament registrations">
      <div className="admin-lifecycle-header">
        <h2 className="admin-lifecycle-title">Registrations</h2>
        <p className="admin-lifecycle-copy">
          Confirmed roster and reserve list. Promote reserves manually when a
          confirmed player withdraws.
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

      {rows === null ? (
        <div className="admin-inline-loading" role="status">
          Loading registrations…
        </div>
      ) : (
        <>
          <div className="admin-reg-section">
            <h3>
              Confirmed Players ({confirmed.length}
              {registrationLimit != null ? ` / ${registrationLimit}` : ""})
            </h3>
            <AdminRegTable
              rows={confirmed}
              isRocketLeague={isRocketLeague}
              busyId={busyId}
              onWithdraw={(id) => runAction(id, "withdraw")}
              showReserveActions={false}
            />
          </div>

          <div className="admin-reg-section">
            <h3>
              Reserve Players ({reserves.length} / {reserveLimit}){" "}
              <ReserveInfoTooltip />
            </h3>
            <AdminRegTable
              rows={reserves}
              isRocketLeague={isRocketLeague}
              busyId={busyId}
              showReserveActions
              onPromote={(id) => runAction(id, "promote")}
              onWithdraw={(id) => runAction(id, "withdraw")}
              onMoveUp={(id) => runAction(id, "up")}
              onMoveDown={(id) => runAction(id, "down")}
            />
          </div>
        </>
      )}
    </section>
  );
}

/**
 * @param {object} props
 */
function AdminRegTable({
  rows,
  isRocketLeague,
  busyId,
  showReserveActions,
  onPromote,
  onWithdraw,
  onMoveUp,
  onMoveDown,
}) {
  if (rows.length === 0) {
    return (
      <div className="admin-table-empty" role="status">
        None yet.
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {showReserveActions ? <th>#</th> : null}
            <th>Player Name</th>
            <th>Status</th>
            {isRocketLeague ? (
              <>
                <th>Epic ID</th>
                <th>Rank</th>
                <th>Team</th>
              </>
            ) : null}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              {showReserveActions ? <td>{index + 1}</td> : null}
              <td className="admin-table-primary">{row.playerName}</td>
              <td>{formatRegistrationStatus(row.status)}</td>
              {isRocketLeague ? (
                <>
                  <td>{row.epicId ?? "—"}</td>
                  <td>{row.rocketLeagueRank ?? "—"}</td>
                  <td>{row.teamName ?? "—"}</td>
                </>
              ) : null}
              <td>
                <div className="admin-reg-actions">
                  {showReserveActions ? (
                    <>
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        disabled={busyId === row.id}
                        onClick={() => onPromote?.(row.id)}
                      >
                        Promote
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        disabled={busyId === row.id || index === 0}
                        onClick={() => onMoveUp?.(row.id)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        disabled={busyId === row.id || index === rows.length - 1}
                        onClick={() => onMoveDown?.(row.id)}
                      >
                        Down
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className="admin-btn"
                    disabled={busyId === row.id}
                    onClick={() => onWithdraw?.(row.id)}
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
