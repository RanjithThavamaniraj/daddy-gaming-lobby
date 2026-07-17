/**
 * Results page hero — tournament metadata header.
 * @param {object} props
 * @param {import("../../../lib/tournamentModel").ReturnType<import("../../../lib/tournamentModel").enrichTournament>} props.tournament
 */
export default function TournamentResultsHero({ tournament }) {
  return (
    <section className="results-section">
      <div className="results-hero-card" style={{ "--accent": tournament.accent }}>
        <div className="results-hero-inner">
          <div className="results-hero-scanlines" />
          <div className="results-hero-header">
            <div className="results-hero-title-block">
              <span className="results-tournament-badge">{tournament.tournamentNumber}</span>
              <h1 className="results-hero-title">🏆 {tournament.championshipName}</h1>
            </div>
            <span className="results-status-badge">Tournament Completed</span>
          </div>

          <div className="results-hero-grid">
            <div className="results-hero-stat">
              <span className="stat-label">Status</span>
              <span className="stat-value">{tournament.status}</span>
            </div>
            <div className="results-hero-stat">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{tournament.completedDate}</span>
            </div>
            <div className="results-hero-stat">
              <span className="stat-label">Game</span>
              <span className="stat-value">{tournament.game}</span>
            </div>
            <div className="results-hero-stat">
              <span className="stat-label">Format</span>
              <span className="stat-value">{tournament.format}</span>
            </div>
            <div className="results-hero-stat">
              <span className="stat-label">Prize Pool</span>
              <span className="stat-value text-completed">{tournament.prizePool}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
