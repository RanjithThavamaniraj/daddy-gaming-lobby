import GameIcon from "../tournaments/GameIcon";

/**
 * Featured games grid — roadmap status only, no tournament details.
 * @param {object} props
 * @param {object[]} props.games
 */
export default function HomeFeaturedGames({ games }) {
  return (
    <section className="section featured-games-section">
      <div className="section-header">
        <p className="section-eyebrow">Supported Titles</p>
        <h2 className="section-title">
          Featured <span>Games</span>
        </h2>
      </div>

      <div className="games-grid">
        {games.map((game, index) => (
          <article
            className="game-card"
            key={game.id}
            style={{
              animationDelay: `${0.06 * index}s`,
              "--game-accent": game.accent,
            }}
          >
            <div className="game-card-scan" />
            <div className="game-icon-wrap">
              <GameIcon slug={game.id} />
            </div>
            <div className="game-name">{game.name}</div>
            <p className="game-tagline">{game.tagline}</p>
            <div className={`game-status game-status-${game.status}`}>
              {game.statusLabel}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
