/**
 * Eligibility stats + player preview + CSV export.
 * @param {object} props
 * @param {{
 *   selectedTournaments: number,
 *   totalRegistrations: number,
 *   duplicatePlayersRemoved: number,
 *   uniqueEligiblePlayers: number,
 * } | null} props.stats
 * @param {Array<{
 *   playerId: string,
 *   playerName: string,
 *   discordName: string | null,
 *   tournamentLabels: string[],
 * }>} props.players
 * @param {boolean} props.loading
 * @param {() => void} props.onExportCsv
 */
export default function GiveawayEligiblePreview({
  stats,
  players,
  loading,
  onExportCsv,
}) {
  return (
    <section aria-label="Eligibility preview">
      <h2 className="admin-lifecycle-title" style={{ marginBottom: "0.75rem" }}>
        Eligibility
      </h2>

      <div className="admin-giveaway-stats">
        <article className="admin-giveaway-stat">
          <p className="admin-giveaway-stat-label">Selected Tournaments</p>
          <p className="admin-giveaway-stat-value">
            {loading ? "…" : (stats?.selectedTournaments ?? 0)}
          </p>
        </article>
        <article className="admin-giveaway-stat">
          <p className="admin-giveaway-stat-label">Total Registrations</p>
          <p className="admin-giveaway-stat-value">
            {loading ? "…" : (stats?.totalRegistrations ?? 0)}
          </p>
        </article>
        <article className="admin-giveaway-stat">
          <p className="admin-giveaway-stat-label">Duplicates Removed</p>
          <p className="admin-giveaway-stat-value">
            {loading ? "…" : (stats?.duplicatePlayersRemoved ?? 0)}
          </p>
        </article>
        <article className="admin-giveaway-stat">
          <p className="admin-giveaway-stat-label">Unique Eligible Players</p>
          <p className="admin-giveaway-stat-value">
            {loading ? "…" : (stats?.uniqueEligiblePlayers ?? 0)}
          </p>
        </article>
      </div>

      {loading ? (
        <div className="admin-inline-loading" role="status">
          Calculating eligibility…
        </div>
      ) : players.length === 0 ? (
        <div className="admin-table-empty" role="status">
          No eligible players yet. Select tournaments with registrations.
        </div>
      ) : (
        <>
          <div className="admin-eligible-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Discord Name</th>
                  <th>Tournament(s) Entered</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.playerId}>
                    <td className="admin-table-primary">{player.playerName}</td>
                    <td>{player.discordName ?? "—"}</td>
                    <td>{player.tournamentLabels.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-eligible-actions">
            <button
              type="button"
              className="admin-pagination-btn"
              onClick={onExportCsv}
            >
              Export CSV
            </button>
            <span className="admin-form-hint">
              One row per eligible player for Wheel of Names.
            </span>
          </div>
        </>
      )}
    </section>
  );
}
