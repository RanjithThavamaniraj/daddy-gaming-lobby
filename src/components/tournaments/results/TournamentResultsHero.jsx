import { EVENT_TYPES, isSaturdayShowdown } from "../../../config/eventTypeConfig";

/**
 * Results page hero — tournament metadata header.
 * @param {object} props
 * @param {import("../../../lib/tournamentModel").ReturnType<import("../../../lib/tournamentModel").enrichTournament>} props.tournament
 */
export default function TournamentResultsHero({ tournament }) {
  const isShowdown = isSaturdayShowdown(tournament.eventType);
  const eventTypeBadge = isShowdown ? EVENT_TYPES.saturday_showdown.badge : EVENT_TYPES.championship.badge;

  return (
    <section className="results-section">
      <div className="results-hero-card" style={{ "--accent": tournament.accent }}>
        <div className="results-hero-inner">
          <div className="results-hero-scanlines" />
          <div className="results-hero-header">
            <div className="results-hero-title-block">
              <span className="results-tournament-badge">{tournament.tournamentNumber}</span>
              <span
                className="results-tournament-badge"
                style={
                  isShowdown
                    ? {
                        color: EVENT_TYPES.saturday_showdown.goldAccent,
                        borderColor: `color-mix(in srgb, ${EVENT_TYPES.saturday_showdown.goldAccent} 45%, transparent)`,
                        background: `color-mix(in srgb, ${EVENT_TYPES.saturday_showdown.goldAccent} 12%, transparent)`,
                        marginLeft: "0.5rem",
                      }
                    : { marginLeft: "0.5rem" }
                }
              >
                {eventTypeBadge}
              </span>
              <h1 className="results-hero-title">
                {isShowdown ? "⚡" : "🏆"} {tournament.championshipName}
              </h1>
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
            {isShowdown ? (
              <div className="results-hero-stat">
                <span className="stat-label">Reward</span>
                <span className="stat-value text-completed">DGL Points</span>
              </div>
            ) : (
              <div className="results-hero-stat">
                <span className="stat-label">Prize Pool</span>
                <span className="stat-value text-completed">{tournament.prizePool}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
