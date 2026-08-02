import { Link } from "react-router-dom";

import GameIcon from "./GameIcon";
import { isSaturdayShowdown } from "../../config/eventTypeConfig";

/**
 * Card for a finished tournament with results link.
 * Preview only — full champion roster lives on the results page.
 * @param {object} props
 * @param {object} props.tournament
 */
export default function CompletedTournamentCard({ tournament }) {
  const gameSlug = tournament.gameSlug ?? tournament.game?.toLowerCase().replace(/\s+/g, "-");
  const winnerCount = (tournament.championPlayers ?? []).length;
  const winnersSummary =
    winnerCount > 0
      ? `${winnerCount} Winner${winnerCount === 1 ? "" : "s"} Crowned`
      : tournament.championPlaceholder ?? "To be updated";
  const isShowdown = isSaturdayShowdown(tournament.eventType);

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
            <span className="hub-stat-label">🏆 Champions</span>
            <span className="hub-stat-value">{winnersSummary}</span>
          </div>
          <div className="hub-stat-box">
            {isShowdown ? (
              <>
                <span className="hub-stat-label">🏅 Reward</span>
                <span className="hub-stat-value text-completed">DGL Points</span>
              </>
            ) : (
              <>
                <span className="hub-stat-label">💰 Prize Pool</span>
                <span className="hub-stat-value text-completed">{tournament.prizePool}</span>
              </>
            )}
          </div>
        </div>

        <div className="hub-card-badges">
          <span className="hub-card-badge">✓ Tournament Completed</span>
          {isShowdown ? (
            <span className="hub-card-badge hub-card-badge-prize-paid">✓ DGL Points Awarded</span>
          ) : (
            <span className="hub-card-badge hub-card-badge-prize-paid">✓ Prize Paid</span>
          )}
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
