import { Link } from "react-router-dom";

/**
 * Clickable registered-player card for tournament pages.
 * DGL Rank (leaderboard) and Game Rank (in-game) are separate fields.
 * @param {object} props
 * @param {object} props.player
 * @param {string} [props.accent]
 */
export default function RegisteredPlayerCard({ player, accent = "#a855f7" }) {
  const {
    name,
    slug,
    points = 0,
    dglRank = null,
    gameRank = null,
    gameName = "Game",
    tournamentsPlayed = 0,
    isNewPlayer = false,
    isReserve = false,
    reserveNumber = null,
  } = player ?? {};

  const displayName = name || "Player";
  const dglRankLabel = dglRank != null ? `#${dglRank}` : "Unranked";
  const gameRankLabel =
    gameRank != null && String(gameRank).trim()
      ? String(gameRank).trim()
      : "Not provided";
  const body = (
    <>
      <div className="player-card-header">
        <span className="player-card-name">
          🎮 {displayName}
          {gameRank != null && String(gameRank).trim() ? (
            <span className="player-card-game-rank"> · {String(gameRank).trim()}</span>
          ) : null}
        </span>
        <span className="player-card-badges">
          {isReserve ? (
            <span className="player-card-reserve">🟡 Reserve Player</span>
          ) : null}
          {isNewPlayer ? <span className="player-card-new">🌱 New Player</span> : null}
        </span>
      </div>
      {isReserve && reserveNumber != null ? (
        <p className="player-card-reserve-order">Reserve #{reserveNumber}</p>
      ) : null}
      {isReserve ? (
        <p className="player-card-reserve-hint">
          Waiting for an available confirmed slot.
        </p>
      ) : null}
      <div className="player-card-stats">
        <div className="player-card-stat">
          <span className="player-card-label">🏆 DGL Points</span>
          <span className="player-card-value">{points}</span>
        </div>
        <div className="player-card-stat">
          <span className="player-card-label">📈 DGL Rank</span>
          <span className="player-card-value">{dglRankLabel}</span>
        </div>
        <div className="player-card-stat">
          <span className="player-card-label">{gameName}</span>
          <span className="player-card-value">{gameRankLabel}</span>
        </div>
        <div className="player-card-stat">
          <span className="player-card-label">🎯 Tournaments Played</span>
          <span className="player-card-value">{tournamentsPlayed}</span>
        </div>
      </div>
    </>
  );

  if (slug) {
    return (
      <Link
        to={`/players/${slug}`}
        className="player-card player-card-link"
        style={{ "--accent": accent }}
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="player-card" style={{ "--accent": accent }}>
      {body}
    </div>
  );
}
