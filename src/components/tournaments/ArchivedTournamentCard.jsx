import GameIcon from "./GameIcon";

/**
 * Card for an archived tournament that was not conducted.
 * @param {object} props
 * @param {object} props.tournament
 */
export default function ArchivedTournamentCard({ tournament }) {
  const gameSlug =
    tournament.gameSlug ?? tournament.game?.toLowerCase().replace(/\s+/g, "-");

  return (
    <article
      className="tournament-hub-card archived-card"
      style={{
        "--accent": tournament.accent,
        animationDelay: `${0.08 * (tournament.index ?? 0)}s`,
      }}
    >
      <div className="tournament-hub-card-inner">
        <div className="hub-card-header">
          {gameSlug ? (
            <div className="hub-card-icon">
              <GameIcon slug={gameSlug} />
            </div>
          ) : null}
          <div className="hub-card-titles">
            <h4 className="hub-card-title">{tournament.title}</h4>
            <span className="hub-card-date">{tournament.scheduledLabel}</span>
          </div>
        </div>

        <div className="hub-card-badges">
          <span className="hub-card-badge hub-card-badge-archived">
            {tournament.archiveLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
