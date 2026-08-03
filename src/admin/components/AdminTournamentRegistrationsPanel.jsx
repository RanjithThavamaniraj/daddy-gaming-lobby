import { useEffect, useState } from "react";

import { listRegistrationsForTournament } from "../repositories/registrationRepository";

/**
 * Read-only registrants list for a tournament.
 * Rocket League tournaments also show Epic ID, rank, team name, and
 * needs-teammate. Reuses the same admin-table / mobile-card markup as
 * AdminTournamentTable.
 * @param {object} props
 * @param {string} props.tournamentId
 * @param {boolean} [props.isRocketLeague=false]
 */
export default function AdminTournamentRegistrationsPanel({
  tournamentId,
  isRocketLeague = false,
}) {
  const [rows, setRows] = useState(/** @type {import("../repositories/registrationRepository").AdminRegistrationRow[] | null} */ (null));
  const [error, setError] = useState(/** @type {string | null} */ (null));

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

  return (
    <section className="admin-lifecycle" aria-label="Tournament registrations">
      <div className="admin-lifecycle-header">
        <h2 className="admin-lifecycle-title">Registrations</h2>
        <p className="admin-lifecycle-copy">
          {isRocketLeague
            ? "Everyone registered for this tournament, including Rocket League rank and team-pairing status."
            : "Everyone registered for this tournament."}
        </p>
      </div>

      {error ? (
        <div className="admin-inline-error" role="alert">
          {error}
        </div>
      ) : rows === null ? (
        <div className="admin-inline-loading" role="status">
          Loading registrations…
        </div>
      ) : rows.length === 0 ? (
        <div className="admin-table-empty" role="status">
          No registrations yet.
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  {isRocketLeague ? (
                    <>
                      <th>Epic ID</th>
                      <th>Rocket League Rank</th>
                      <th>Team Name</th>
                      <th>Needs Teammate</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="admin-table-primary">{row.playerName}</td>
                    {isRocketLeague ? (
                      <>
                        <td>{row.epicId ?? "—"}</td>
                        <td>{row.rocketLeagueRank ?? "—"}</td>
                        <td>{row.teamName ?? "—"}</td>
                        <td>{row.needsTeammate ? "Yes" : "No"}</td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-mobile-cards" aria-label="Registration cards">
            {rows.map((row) => (
              <article key={row.id} className="admin-mobile-card">
                <h3 className="admin-mobile-card-title">{row.playerName}</h3>
                {isRocketLeague ? (
                  <div className="admin-mobile-card-meta">
                    <div>
                      <span className="admin-mobile-kv-label">Epic ID</span>
                      <span className="admin-mobile-kv-value">
                        {row.epicId ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="admin-mobile-kv-label">Rocket League Rank</span>
                      <span className="admin-mobile-kv-value">
                        {row.rocketLeagueRank ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="admin-mobile-kv-label">Team Name</span>
                      <span className="admin-mobile-kv-value">
                        {row.teamName ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="admin-mobile-kv-label">Needs Teammate</span>
                      <span className="admin-mobile-kv-value">
                        {row.needsTeammate ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
