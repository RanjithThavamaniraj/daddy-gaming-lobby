import { Link } from "react-router-dom";

/**
 * Top players preview for the Titan Dashboard.
 * Entire card links to the existing /leaderboard page.
 * @param {object} props
 * @param {object[]} props.players
 */
export default function LeaderboardPreview({ players }) {
  if (!players.length) return null;

  return (
    <Link
      to="/leaderboard"
      className="glass-panel dashboard-widget leaderboard-widget dashboard-widget-link"
      aria-label="DGL Leaderboard. View full leaderboard."
    >
      <div className="panel-header">
        <h2 className="section-title">DGL Leaderboard</h2>
        <span className="section-badge">Top {players.length}</span>
      </div>

      <div className="leaderboard-preview-list">
        {players.map((player) => (
          <div className="leaderboard-preview-row" key={player.name}>
            <span className="preview-rank">{player.rank}</span>
            <span className="preview-name">{player.name}</span>
            <span className="preview-points">{player.points}</span>
          </div>
        ))}
      </div>

      <span className="widget-link-footer">View Full Leaderboard →</span>
    </Link>
  );
}
