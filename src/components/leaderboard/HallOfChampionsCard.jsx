import { Link } from "react-router-dom";
import { Calendar, Trophy } from "lucide-react";

/**
 * Card for a completed tournament in the Hall of Champions.
 * @param {object} props
 * @param {object} props.tournament
 * @param {number} [props.index]
 */
export default function HallOfChampionsCard({ tournament, index = 0 }) {
  return (
    <article
      className="hall-card"
      style={{ "--accent": tournament.accent, animationDelay: `${index * 0.08}s` }}
    >
      <div className="card-border" aria-hidden />
      <div className="card-shine" aria-hidden />
      <div className="card-glow" aria-hidden />
      <div className="hall-card-inner">
        <div className="hall-card-header">
          <span className="hall-tournament-badge">{tournament.tournamentNumber}</span>
          {tournament.resultsPath ? (
            <Link to={tournament.resultsPath} className="hall-view-results">
              View Results
            </Link>
          ) : null}
        </div>

        <h3 className="hall-card-title">{tournament.name}</h3>

        <div className="hall-meta-grid">
          <div className="hall-meta-box">
            <span className="hall-meta-label">Game</span>
            <span className="hall-meta-value">{tournament.game}</span>
          </div>
          <div className="hall-meta-box">
            <span className="hall-meta-label">Prize Pool</span>
            <span className="hall-meta-value hall-accent">{tournament.prizePool}</span>
          </div>
          <div className="hall-meta-box">
            <span className="hall-meta-label">Reward</span>
            <span className="hall-meta-value">+{tournament.dglPoints} DGL Points each</span>
          </div>
          <div className="hall-meta-box">
            <span className="hall-meta-label">Completed</span>
            <span className="hall-meta-value hall-meta-inline">
              <Calendar size={14} />
              {tournament.completedDate}
            </span>
          </div>
        </div>

        <div className="hall-champions-block">
          <span className="hall-champions-label">
            <Trophy size={14} /> Champion Players
          </span>
          <ul className="hall-players-list">
            {tournament.championPlayers.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
