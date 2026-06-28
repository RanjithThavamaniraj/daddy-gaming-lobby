import { Link } from "react-router-dom";

/**
 * Latest Hall of Champions preview for the homepage.
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

      <article
        className="hall-preview-card"
        style={{ "--accent": tournament.accent ?? "#f59e0b" }}
      >
        <span className="hall-preview-badge">{tournament.tournamentNumber}</span>
        <h3 className="hall-preview-title">{tournament.name}</h3>
        {tournament.resultsPath ? (
          <Link to={tournament.resultsPath} className="hall-preview-link">
            View Results →
          </Link>
        ) : null}
      </article>
    </section>
  );
}
