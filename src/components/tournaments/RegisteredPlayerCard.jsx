import { Link } from "react-router-dom";

/**
 * Clickable registered-player card for tournament pages.
 * @param {object} props
 * @param {object} props.player
 * @param {string} [props.accent]
 */
export default function RegisteredPlayerCard({ player, accent = "#a855f7" }) {
  const {
    name,
    slug,
    points = 0,
    rank = null,
    tournamentsPlayed = 0,
    platform = "Not Specified",
    isNewPlayer = false,
  } = player ?? {};

  const displayName = name || "Player";
  const rankLabel = rank != null ? `#${rank}` : "Unranked";
  const body = (
    <>
      <div className="player-card-header">
        <span className="player-card-name">🎮 {displayName}</span>
        {isNewPlayer ? <span className="player-card-new">🌱 New Player</span> : null}
      </div>
      <div className="player-card-stats">
        <div className="player-card-stat">
          <span className="player-card-label">🏆 DGL Points</span>
          <span className="player-card-value">{points}</span>
        </div>
        <div className="player-card-stat">
          <span className="player-card-label">📈 Current Rank</span>
          <span className="player-card-value">{rankLabel}</span>
        </div>
        <div className="player-card-stat">
          <span className="player-card-label">🎯 Tournaments Played</span>
          <span className="player-card-value">{tournamentsPlayed}</span>
        </div>
        <div className="player-card-stat">
          <span className="player-card-label">🖥 Platform</span>
          <span className="player-card-value">{platform || "Not Specified"}</span>
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
