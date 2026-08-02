import { Link } from "react-router-dom";
import { Calendar, Medal, Trophy, Users } from "lucide-react";

import { isSaturdayShowdown } from "../../config/eventTypeConfig";

/**
 * Card for a completed tournament in the Hall of Champions.
 * DGL Points are not shown here — the DGL Points Leaderboard below is the
 * single source of truth for player totals.
 * @param {object} props
 * @param {object} props.tournament
 * @param {number} [props.index]
 */
export default function HallOfChampionsCard({ tournament, index = 0 }) {
  const runnerUpPlayers = tournament.runnerUpPlayers ?? [];
  const isShowdown = isSaturdayShowdown(tournament.eventType);

  // Everyone who competed but isn't already highlighted as Champion or
  // Runner-Up — semi-finalists, quarter-finalists, and group-stage players,
  // combined. Sourced straight from the same tournament data builder that
  // powers the Leaderboard and the results page tiers; nothing hardcoded.
  const participantPlayers = [
    ...(tournament.semiFinalistPlayers ?? []),
    ...(tournament.quarterFinalistPlayers ?? []),
    ...(tournament.groupStagePlayers ?? []),
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

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
            {isShowdown ? (
              <>
                <span className="hall-meta-label">Reward</span>
                <span className="hall-meta-value hall-accent">DGL Points</span>
              </>
            ) : (
              <>
                <span className="hall-meta-label">Prize Pool</span>
                <span className="hall-meta-value hall-accent">{tournament.prizePool}</span>
              </>
            )}
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
            <Trophy size={14} /> Champion{tournament.championPlayers.length > 1 ? "s" : ""}
          </span>
          <ul className="hall-players-list">
            {tournament.championPlayers.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </div>

        {runnerUpPlayers.length > 0 ? (
          <div className="hall-champions-block">
            <span className="hall-champions-label">
              <Medal size={14} /> Runner-Up{runnerUpPlayers.length > 1 ? "s" : ""}
            </span>
            <ul className="hall-players-list">
              {runnerUpPlayers.map((player) => (
                <li key={player}>{player}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {participantPlayers.length > 0 ? (
          <div className="hall-champions-block">
            <span className="hall-champions-label">
              <Users size={14} /> Participants
            </span>
            <ul className="hall-players-list">
              {participantPlayers.map((player) => (
                <li key={player}>{player}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
