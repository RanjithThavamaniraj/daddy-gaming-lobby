import { Link } from "react-router-dom";

/**
 * Top players preview for the Titan Dashboard.
 * @param {object} props
 * @param {object[]} props.players
 */
export default function LeaderboardPreview({ players }) {
  if (!players.length) return null;

  return (
    <section className="glass-panel dashboard-widget leaderboard-widget">
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

      <Link to="/leaderboard" className="widget-link-footer">
        View Full Leaderboard →
      </Link>
    </section>
  );
}
