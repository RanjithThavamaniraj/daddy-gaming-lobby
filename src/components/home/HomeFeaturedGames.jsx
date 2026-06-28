import GameIcon from "../tournaments/GameIcon";

/**
 * Featured games grid for the homepage.
 * @param {object} props
 * @param {import("../../config/dglGamesConfig").DglGame[]} props.games
 * @param {string} [props.intro]
 */
export default function HomeFeaturedGames({ games, intro }) {
  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Supported Titles</p>
        <h2 className="section-title">
          Featured <span>Games</span>
        </h2>
      </div>

      {intro ? <p className="section-intro section-intro-compact">{intro}</p> : null}

      <div className="games-grid">
        {games.map((game, index) => (
          <article
            className="game-card"
            key={game.id}
            style={{
              animationDelay: `${0.08 * index}s`,
              "--game-accent": game.accent,
            }}
          >
            <div className="game-card-scan" />
            <div className="game-icon-wrap">
              <GameIcon slug={game.id} />
            </div>
            <div className="game-name">{game.name}</div>
            <div className="game-category-tag">{game.category}</div>
            <div className="game-status">Supported</div>
          </article>
        ))}
      </div>
    </section>
  );
}
