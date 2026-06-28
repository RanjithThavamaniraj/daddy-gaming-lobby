import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";

import GameIcon from "./GameIcon";

/**
 * Card for a finished tournament with results link.
 * @param {object} props
 * @param {object} props.tournament
 */
export default function CompletedTournamentCard({ tournament }) {
  const gameSlug = tournament.gameSlug ?? tournament.game?.toLowerCase().replace(/\s+/g, "-");
  const championPlayers = tournament.championPlayers ?? [];
  const championLabel =
    championPlayers.length > 0
      ? championPlayers.join(", ")
      : tournament.champion ?? tournament.championPlaceholder ?? "To be updated";

  return (
    <article
      className="tournament-hub-card completed-card"
      style={{ "--accent": tournament.accent, animationDelay: `${0.08 * (tournament.index ?? 0)}s` }}
    >
      <div className="tournament-hub-card-inner">
        <div className="hub-card-header">
          {gameSlug ? (
            <div className="hub-card-icon">
              <GameIcon slug={gameSlug} />
            </div>
          ) : null}
          <div className="hub-card-titles">
            <h4 className="hub-card-title">{tournament.title}</h4>
            <span className="hub-card-date">{tournament.completedDate}</span>
          </div>
        </div>

        <div className="hub-card-stats">
          <div className="hub-stat-box">
            <span className="hub-stat-label">CHAMPION TEAM</span>
            <span className="hub-stat-value">
              <Trophy size={14} className="hub-stat-icon" />
              {championLabel}
            </span>
          </div>
          <div className="hub-stat-box">
            <span className="hub-stat-label">PRIZE POOL</span>
            <span className="hub-stat-value text-accent">{tournament.prizePool}</span>
          </div>
        </div>

        {tournament.resultsPath ? (
          <div className="hub-card-action">
            <Link to={tournament.resultsPath} className="cyber-btn outline">
              VIEW RESULTS
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
