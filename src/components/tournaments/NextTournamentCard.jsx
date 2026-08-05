import { Link } from "react-router-dom";

import GameIcon from "./GameIcon";
import { EVENT_TYPES, isSaturdayShowdown } from "../../config/eventTypeConfig";
import { isRegisteredForTournament } from "../../lib/registrationSession";
import {
  LIFECYCLE_BADGE,
  formatTournamentStartDate,
  isLifecycleClosed,
  isLifecycleLive,
  isLifecycleOpen,
} from "../../lib/tournamentLifecycle";

/** Short CTA label per game — cosmetic only. */
const SHORT_GAME_LABELS = {
  valorant: "Valorant",
  cs2: "CS2",
  "fc-26": "FC26",
};

/**
 * Next Tournament preview card.
 * @param {object} props
 * @param {object} props.tournament
 * @param {object|null} [props.mainEvent]
 */
export default function NextTournamentCard({ tournament, mainEvent }) {
  if (!tournament) return null;

  const gameSlug = tournament.gameSlug ?? tournament.game.toLowerCase().replace(/\s+/g, "-");
  const mainEventLabel = mainEvent
    ? SHORT_GAME_LABELS[mainEvent.gameSlug] ?? mainEvent.game
    : null;
  const isShowdown = isSaturdayShowdown(tournament.eventType);
  const isRegistrationOpen = isLifecycleOpen(tournament);
  const isRegistrationClosed = isLifecycleClosed(tournament);
  const isLive = isLifecycleLive(tournament);
  const alreadyRegistered = isRegisteredForTournament(tournament.id);
  const registrationPath =
    tournament.slug ?? tournament.resultsSlug
      ? `/tournaments/${tournament.slug ?? tournament.resultsSlug}`
      : null;
  const capacity = tournament.registrationLimit ?? null;
  const registered = tournament.registeredCount ?? 0;
  const slotsRemaining =
    capacity == null ? null : Math.max(0, capacity - registered);
  const badge =
    LIFECYCLE_BADGE[tournament.lifecycle] ??
    (isRegistrationOpen ? tournament.status : null);

  return (
    <section className="featured-section">
      <h2 className="section-heading">Next Tournament</h2>
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
                  {isRegistrationOpen || isRegistrationClosed || isLive ? (
                    <span
                      className={`status-badge-custom ${
                        isLive
                          ? "live"
                          : isRegistrationClosed
                            ? "registrations-closed"
                            : "registrations-open"
                      }`}
                    >
                      {badge}
                    </span>
                  ) : (
                    <span className="status-badge-custom coming-soon">NEXT TOURNAMENT</span>
                  )}
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
                <span className="stat-label">TOURNAMENT FORMAT</span>
                <span className="stat-value">{tournament.matchType}</span>
              </div>
              <div className="hero-stat-box">
                <span className="stat-label">PLAYERS</span>
                <span className="stat-value">{tournament.registrationLimit ?? "—"}</span>
              </div>
              {isRegistrationOpen && slotsRemaining != null ? (
                <div className="hero-stat-box">
                  <span className="stat-label">SLOTS REMAINING</span>
                  <span className="stat-value">{slotsRemaining}</span>
                </div>
              ) : null}
              {isRegistrationClosed && capacity != null ? (
                <>
                  <div className="hero-stat-box">
                    <span className="stat-label">REGISTERED PLAYERS</span>
                    <span className="stat-value">
                      {registered} / {capacity}
                    </span>
                  </div>
                  <div className="hero-stat-box">
                    <span className="stat-label">TOURNAMENT START</span>
                    <span className="stat-value">
                      {formatTournamentStartDate(tournament.startsAt)}
                    </span>
                  </div>
                </>
              ) : null}
              {isShowdown ? (
                <>
                  <div className="hero-stat-box">
                    <span className="stat-label">PRIZE</span>
                    <span className="stat-value text-completed">Community Event</span>
                  </div>
                  <div className="hero-stat-box">
                    <span className="stat-label">REWARDS</span>
                    <span className="stat-value text-completed">
                      DGL Points • Hall of Titans Recognition
                    </span>
                  </div>
                </>
              ) : (
                <div className="hero-stat-box">
                  <span className="stat-label">PRIZE</span>
                  <span className="stat-value text-completed">{tournament.prizePool}</span>
                </div>
              )}
              {tournament.entryFee ? (
                <div className="hero-stat-box">
                  <span className="stat-label">ENTRY</span>
                  <span className="stat-value">{tournament.entryFee}</span>
                </div>
              ) : null}
            </div>

            <div className="hero-action-container">
              {isRegistrationOpen && registrationPath ? (
                alreadyRegistered ? (
                  <button type="button" className="cyber-btn disabled registered-cta" disabled>
                    <span>✓ REGISTERED</span>
                  </button>
                ) : (
                  <Link to={registrationPath} className="cyber-btn primary">
                    <span>REGISTER NOW</span>
                  </Link>
                )
              ) : isRegistrationClosed && registrationPath ? (
                <Link to={registrationPath} className="cyber-btn primary">
                  <span>VIEW TOURNAMENT</span>
                </Link>
              ) : isLive && registrationPath ? (
                <Link to={registrationPath} className="cyber-btn primary">
                  <span>VIEW BRACKET</span>
                </Link>
              ) : (
                <button type="button" className="cyber-btn disabled" disabled>
                  <span>
                    {mainEventLabel
                      ? `COMING AFTER ${mainEventLabel.toUpperCase()}`
                      : "COMING SOON"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
