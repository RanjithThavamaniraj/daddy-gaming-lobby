import GameIcon from "./GameIcon";

/**
 * Card for a tournament that has not opened registration yet.
 * @param {object} props
 * @param {object} props.tournament
 */
export default function UpcomingTournamentCard({ tournament }) {
  const gameSlug = tournament.gameSlug ?? tournament.game.toLowerCase().replace(/\s+/g, "-");

  return (
    <article
      className="tournament-hub-card upcoming-card"
      style={{ "--accent": tournament.accent, animationDelay: `${0.08 * (tournament.index ?? 0)}s` }}
    >
      <div className="tournament-hub-card-inner">
        <div className="hub-card-header">
          <div className="hub-card-icon">
            <GameIcon slug={gameSlug} />
          </div>
          <div className="hub-card-titles">
            {tournament.tournamentNumber ? (
              <span className="hub-card-tournament-number">{tournament.tournamentNumber}</span>
            ) : null}
            <h4 className="hub-card-title">{tournament.championshipName ?? tournament.title}</h4>
            <span className="hub-card-game">{tournament.game}</span>
          </div>
          <span className="status-badge-custom coming-soon">{tournament.status}</span>
        </div>
        <div className="hub-card-action">
          <button type="button" className="cyber-btn disabled" disabled>
            <span>COMING SOON</span>
          </button>
        </div>
      </div>
    </article>
  );
}
