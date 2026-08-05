import { Link } from "react-router-dom";
import { Calendar, Trophy } from "lucide-react";

import GameIcon from "./GameIcon";
import { isRegisteredForTournament } from "../../lib/registrationSession";
import { EVENT_TYPES, isSaturdayShowdown } from "../../config/eventTypeConfig";
import { parsePrizePoolAmount } from "../../lib/prizePool";
import {
  LIFECYCLE_BADGE,
  formatTournamentStartDate,
  isLifecycleClosed,
  isLifecycleCompleted,
  isLifecycleLive,
  isLifecycleOpen,
} from "../../lib/tournamentLifecycle";
import ReserveInfoTooltip from "./ReserveInfoTooltip";

/**
 * Featured / Main Event tournament hero card.
 * Renders from derived lifecycle status.
 * @param {object} props
 * @param {object} props.tournament
 * @param {number} [props.openRegistrationCount=0]
 */
export default function FeaturedTournament({ tournament, openRegistrationCount = 0 }) {
  if (!tournament) return null;

  const gameSlug = tournament.gameSlug ?? tournament.game.toLowerCase().replace(/\s+/g, "-");
  const isCompleted = isLifecycleCompleted(tournament);
  const isLive = isLifecycleLive(tournament);
  const isRegistrationOpen = isLifecycleOpen(tournament);
  const isRegistrationClosed = isLifecycleClosed(tournament);
  const isComingSoon = tournament.status === "Coming Soon" && !isRegistrationOpen;
  const isShowdown = isSaturdayShowdown(tournament.eventType);
  const championPlayers = tournament.championPlayers ?? [];
  const alreadyRegistered = isRegisteredForTournament(tournament.id);
  const registrationPath =
    tournament.slug ?? tournament.resultsSlug
      ? `/tournaments/${tournament.slug ?? tournament.resultsSlug}`
      : null;
  const showOpenCount = openRegistrationCount >= 2;
  const capacity = tournament.registrationLimit ?? null;
  const registered = tournament.confirmedCount ?? tournament.registeredCount ?? 0;
  const slotsRemaining =
    capacity == null ? null : Math.max(0, capacity - registered);
  const badge =
    LIFECYCLE_BADGE[tournament.lifecycle] ??
    (isCompleted ? "⚫ Completed" : tournament.status);
  const hasCashPrize = parsePrizePoolAmount(tournament.prizePool) > 0;
  const showFreeEntry = isShowdown || !hasCashPrize;

  return (
    <section className="featured-section">
      <h2 className="section-heading">
        Main Event
        {showOpenCount ? (
          <span className="status-badge-custom live">
            LIVE NOW • {openRegistrationCount}
          </span>
        ) : null}
      </h2>
      <div className="hero-card" style={{ "--accent": tournament.accent }}>
        <div className="hero-scanlines" />
        <div className="hero-inner">
          <div className="hero-details-container">
            <div className="hero-content">
              <div className="hero-icon">
                <GameIcon slug={gameSlug} />
              </div>
              <div className="hero-details">
                {tournament.tournamentNumber ? (
                  <span className="hero-tournament-badge">{tournament.tournamentNumber}</span>
                ) : null}
                {isShowdown ? (
                  <span
                    className="hero-tournament-badge"
                    style={{
                      color: EVENT_TYPES.saturday_showdown.goldAccent,
                      borderColor: `color-mix(in srgb, ${EVENT_TYPES.saturday_showdown.goldAccent} 45%, transparent)`,
                      background: `color-mix(in srgb, ${EVENT_TYPES.saturday_showdown.goldAccent} 12%, transparent)`,
                      marginLeft: "0.5rem",
                    }}
                  >
                    {EVENT_TYPES.saturday_showdown.heroBadge}
                  </span>
                ) : null}
                <h3 className="hero-title">{tournament.title}</h3>
                <div className="hero-badges">
                  <span
                    className={`status-badge-custom ${
                      isCompleted
                        ? "tournament-completed"
                        : isRegistrationClosed
                          ? "registrations-closed"
                          : isLive
                            ? "live"
                            : isRegistrationOpen
                              ? "registrations-open"
                              : "coming-soon"
                    }`}
                  >
                    {isCompleted ? "🏆 Tournament Completed" : badge}
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
              {showFreeEntry ? (
                <>
                  {isShowdown ? (
                    <div className="hero-stat-box">
                      <span className="stat-label">SERIES</span>
                      <span className="stat-value">Saturday Showdown</span>
                    </div>
                  ) : null}
                  <div className="hero-stat-box">
                    <span className="stat-label">ENTRY</span>
                    <span className="stat-value text-completed">
                      {tournament.entryFee?.trim() || "Free"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="hero-stat-box">
                  <span className="stat-label">PRIZE POOL</span>
                  <span className="stat-value text-completed">{tournament.prizePool}</span>
                </div>
              )}
              {isShowdown ? (
                <div className="hero-stat-box">
                  <span className="stat-label">REWARDS</span>
                  <span className="stat-value text-completed">
                    DGL Points • Hall of Titans Recognition
                  </span>
                </div>
              ) : null}
              {tournament.entryFee && hasCashPrize && !isShowdown ? (
                <div className="hero-stat-box">
                  <span className="stat-label">ENTRY</span>
                  <span className="stat-value">{tournament.entryFee}</span>
                </div>
              ) : null}
              {isRegistrationOpen && slotsRemaining != null ? (
                <div className="hero-stat-box">
                  <span className="stat-label">SLOTS REMAINING</span>
                  <span className="stat-value">{slotsRemaining}</span>
                </div>
              ) : null}
              {capacity != null ? (
                <div className="hero-stat-box">
                  <span className="stat-label">REGISTERED PLAYERS</span>
                  <span className="stat-value">
                    {(tournament.confirmedCount ?? registered)} / {capacity}
                  </span>
                </div>
              ) : null}
              <div className="hero-stat-box">
                <span className="stat-label">
                  RESERVE PLAYERS{" "}
                  <ReserveInfoTooltip />
                </span>
                <span className="stat-value">
                  {tournament.reserveCount ?? 0} / {tournament.reserveLimit ?? 4}
                </span>
              </div>
              {isRegistrationClosed && capacity != null ? (
                <div className="hero-stat-box">
                  <span className="stat-label">TOURNAMENT START</span>
                  <span className="stat-value">
                    {formatTournamentStartDate(tournament.startsAt)}
                  </span>
                </div>
              ) : null}
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

            {isCompleted && championPlayers.length > 0 ? (
              <div className="hero-champions-block">
                <span className="hero-champions-label">
                  <Trophy size={14} /> Champions
                </span>
                <ul className="hero-champions-list">
                  {championPlayers.map((player) => (
                    <li key={player}>{player}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {isCompleted ? (
              <div className="dates-info-row">
                <div className="date-item">
                  <Calendar size={16} className="text-accent" />
                  <span>
                    Completed: <strong>{tournament.completedDate}</strong>
                  </span>
                </div>
              </div>
            ) : null}

            {isRegistrationOpen && registrationPath ? (
              <div className="hero-action-container">
                {alreadyRegistered ? (
                  <button type="button" className="cyber-btn disabled registered-cta" disabled>
                    <span>✓ REGISTERED</span>
                  </button>
                ) : (
                  <Link to={registrationPath} className="cyber-btn primary">
                    <span>REGISTER NOW</span>
                  </Link>
                )}
              </div>
            ) : null}

            {isRegistrationClosed && registrationPath ? (
              <div className="hero-action-container">
                <Link to={registrationPath} className="cyber-btn primary">
                  <span>VIEW TOURNAMENT</span>
                </Link>
              </div>
            ) : null}

            {isLive && registrationPath ? (
              <div className="hero-action-container">
                <Link to={registrationPath} className="cyber-btn primary">
                  <span>VIEW BRACKET</span>
                </Link>
              </div>
            ) : null}

            {isComingSoon ? (
              <div className="hero-action-container">
                <button type="button" className="cyber-btn disabled" disabled>
                  <span>COMING SOON</span>
                </button>
              </div>
            ) : null}

            {isCompleted && tournament.resultsPath ? (
              <div className="hero-action-container">
                <Link to={tournament.resultsPath} className="cyber-btn primary">
                  <span>VIEW RESULTS</span>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
