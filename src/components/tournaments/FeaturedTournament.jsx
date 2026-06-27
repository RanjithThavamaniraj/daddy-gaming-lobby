import { Link } from "react-router-dom";
import { Calendar, Trophy } from "lucide-react";

import GameIcon from "./GameIcon";

/**
 * Featured / Main Event tournament hero card.
 * @param {object} props
 * @param {object} props.tournament
 */
export default function FeaturedTournament({ tournament }) {
  const gameSlug = tournament.gameSlug ?? tournament.game.toLowerCase().replace(/\s+/g, "-");
  const isCompleted = tournament.status === "Completed";

  return (
    <section className="featured-section">
      <h2 className="section-heading">Main Event</h2>
      <div className="hero-card" style={{ "--accent": tournament.accent }}>
        <div className="hero-scanlines" />
        <div className="hero-inner">
          <div className="hero-details-container">
            <div className="hero-content">
              <div className="hero-icon">
                <GameIcon slug={gameSlug} />
              </div>
              <div className="hero-details">
                <h3 className="hero-title">{tournament.title}</h3>
                <div className="hero-badges">
                  <span className={`status-badge-custom ${isCompleted ? "tournament-completed" : tournament.status.toLowerCase().replace(/\s+/g, "-")}`}>
                    {isCompleted ? "🏆 Tournament Completed" : tournament.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="hero-stats-grid featured-stats-grid">
              <div className="hero-stat-box">
                <span className="stat-label">GAME</span>
                <span className="stat-value">{tournament.game}</span>
              </div>
              <div className="hero-stat-box">
                <span className="stat-label">FORMAT</span>
                <span className="stat-value">{tournament.format}</span>
              </div>
              <div className="hero-stat-box">
                <span className="stat-label">MATCH TYPE</span>
                <span className="stat-value">{tournament.matchType}</span>
              </div>
              <div className="hero-stat-box">
                <span className="stat-label">PRIZE POOL</span>
                <span className="stat-value text-accent">{tournament.prizePool}</span>
              </div>
            </div>

            {isCompleted ? (
              <div className="registration-progress-container">
                <div className="progress-text-row">
                  <span>
                    TOURNAMENT STATUS: <strong className="text-completed">Completed</strong>
                  </span>
                  <span className="completed-indicator">
                    <Trophy size={14} /> CONCLUDED
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill completed" />
                </div>
              </div>
            ) : null}

            {isCompleted ? (
              <div className="dates-info-row">
                <div className="date-item">
                  <Calendar size={16} className="text-accent" />
                  <span>Completed: <strong>{tournament.completedDate}</strong></span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="hero-action-container">
            {isCompleted && tournament.resultsPath ? (
              <Link to={tournament.resultsPath} className="cyber-btn primary">
                <span>VIEW RESULTS</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
