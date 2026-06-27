/**
 * Single row in the DGL Points leaderboard table.
 * @param {object} props
 * @param {object} props.player
 * @param {boolean} [props.isActive]
 * @param {function} [props.onToggle]
 */
export default function DGLPointsRow({ player, isActive, onToggle }) {
  const isTopChampion = player.rank <= 3 && player.championships > 0;
  const accent = isTopChampion
    ? player.rank === 1
      ? "#f59e0b"
      : player.rank === 2
        ? "#e2e8f0"
        : "#cd7c2f"
    : player.accent ?? "#a855f7";

  return (
    <div
      className={`row-card${isActive ? " is-active" : ""}`}
      style={{ "--accent": accent, animationDelay: `${0.12 + player.rank * 0.04}s` }}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle?.();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="row-inner dgl-row-inner">
        <div className="row-rank-box">
          <span className="rank-hash">#</span>
          {player.rank}
        </div>
        <div className="row-info">
          <div className="row-name">{player.name}</div>
        </div>
        <div className="row-game-cell">{player.game}</div>
        <div className="row-points-cell">
          <span className="row-points">{player.points}</span>
          <span className="row-points-label">DGL</span>
        </div>
        <div className="row-stat-cell">
          <span className="stat-label">Championships</span>
          <span className="stat-value">{player.championships}</span>
        </div>
        <div className="row-stat-cell">
          <span className="stat-label">Played</span>
          <span className="stat-value">{player.tournamentsPlayed}</span>
        </div>
      </div>
    </div>
  );
}
