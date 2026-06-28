import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

/**
 * Latest Hall of Champions preview — social proof with clear next steps.
 * @param {object} props
 * @param {object|null} props.tournament
 */
export default function HomeHallOfChampionsPreview({ tournament }) {
  if (!tournament) return null;

  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Latest Champions</p>
        <h2 className="section-title">
          Hall of <span>Champions</span>
        </h2>
      </div>

      <p className="section-intro section-intro-compact">
        Every DGL championship is permanently recorded. Here is the most recent winner.
      </p>

      <article
        className="hall-preview-card"
        style={{ "--accent": tournament.accent ?? "#f59e0b" }}
      >
        <span className="hall-preview-badge">{tournament.tournamentNumber}</span>
        <h3 className="hall-preview-title">{tournament.name}</h3>

        <div className="hall-preview-meta">
          <span className="hall-preview-status">{tournament.status}</span>
          {tournament.completedDate ? (
            <span className="hall-preview-date">
              <Calendar size={14} aria-hidden />
              {tournament.completedDate}
            </span>
          ) : null}
        </div>

        <div className="hall-preview-actions">
          {tournament.resultsPath ? (
            <Link to={tournament.resultsPath} className="hall-preview-link primary-link">
              View Results →
            </Link>
          ) : null}
          <Link to="/leaderboard" className="hall-preview-link secondary-link">
            Full Hall of Champions →
          </Link>
        </div>
      </article>
    </section>
  );
}
