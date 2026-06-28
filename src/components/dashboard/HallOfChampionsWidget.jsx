import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

/**
 * Latest completed tournament preview for the Titan Dashboard.
 * @param {object} props
 * @param {object|null} props.tournament
 */
export default function HallOfChampionsWidget({ tournament }) {
  if (!tournament) return null;

  return (
    <section
      className="glass-panel dashboard-widget hall-widget"
      style={{ "--accent": tournament.accent ?? "#f59e0b" }}
    >
      <div className="panel-header">
        <h2 className="section-title">🏆 Hall of Champions</h2>
      </div>

      <div className="widget-body">
        <span className="widget-tournament-badge">{tournament.tournamentNumber}</span>
        <h3 className="widget-title">{tournament.name}</h3>

        <div className="widget-meta-grid">
          <div className="widget-meta-row">
            <span className="widget-meta-label">Status</span>
            <span className="widget-meta-value widget-status-completed">{tournament.status}</span>
          </div>
          <div className="widget-meta-row">
            <span className="widget-meta-label">Completed</span>
            <span className="widget-meta-value widget-meta-inline">
              <Calendar size={14} />
              {tournament.completedDate}
            </span>
          </div>
        </div>

        {tournament.resultsPath ? (
          <Link to={tournament.resultsPath} className="cyber-btn outline widget-action-btn">
            View Results
          </Link>
        ) : null}
      </div>
    </section>
  );
}
