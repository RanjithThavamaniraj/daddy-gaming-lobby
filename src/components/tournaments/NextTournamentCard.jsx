import GameIcon from "./GameIcon";
import { EVENT_TYPES, isSaturdayShowdown } from "../../config/eventTypeConfig";
import { parsePrizePoolAmount } from "../../lib/prizePool";
import {
  LIFECYCLE_BADGE,
  formatTournamentStartDate,
  isLifecycleClosed,
  isLifecycleLive,
  isLifecycleOpen,
} from "../../lib/tournamentLifecycle";
import ReserveInfoTooltip from "./ReserveInfoTooltip";
import TournamentLifecycleCta from "./TournamentLifecycleCta";

/**
 * Next Tournament preview card.
 * CTA is lifecycle-driven only — Tournament Series affects branding only.
 * @param {object} props
 * @param {object} props.tournament
 * @param {object|null} [props.mainEvent]
 */
export default function NextTournamentCard({ tournament }) {
  if (!tournament) return null;

  const gameSlug = tournament.gameSlug ?? tournament.game.toLowerCase().replace(/\s+/g, "-");
  const isShowdown = isSaturdayShowdown(tournament.eventType);
  const isRegistrationOpen = isLifecycleOpen(tournament);
  const isRegistrationClosed = isLifecycleClosed(tournament);
  const isLive = isLifecycleLive(tournament);
  const capacity = tournament.registrationLimit ?? null;
  const registered = tournament.confirmedCount ?? tournament.registeredCount ?? 0;
  const slotsRemaining =
    capacity == null ? null : Math.max(0, capacity - registered);
  const badge =
    LIFECYCLE_BADGE[tournament.lifecycle] ??
    (isRegistrationOpen ? tournament.status : null);
  const hasCashPrize = parsePrizePoolAmount(tournament.prizePool) > 0;
  const showFreeEntry = isShowdown || !hasCashPrize;

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
                  RESERVE PLAYERS <ReserveInfoTooltip />
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
              {isShowdown ? (
                <>
                  <div className="hero-stat-box">
                    <span className="stat-label">SERIES</span>
                    <span className="stat-value">Saturday Showdown</span>
                  </div>
                  <div className="hero-stat-box">
                    <span className="stat-label">ENTRY</span>
                    <span className="stat-value text-completed">
                      {tournament.entryFee?.trim() || "Free"}
                    </span>
                  </div>
                  <div className="hero-stat-box">
                    <span className="stat-label">REWARDS</span>
                    <span className="stat-value text-completed">
                      DGL Points • Hall of Titans Recognition
                    </span>
                  </div>
                </>
              ) : showFreeEntry ? (
                <div className="hero-stat-box">
                  <span className="stat-label">ENTRY</span>
                  <span className="stat-value text-completed">
                    {tournament.entryFee?.trim() || "Free"}
                  </span>
                </div>
              ) : (
                <div className="hero-stat-box">
                  <span className="stat-label">PRIZE</span>
                  <span className="stat-value text-completed">{tournament.prizePool}</span>
                </div>
              )}
              {tournament.entryFee && hasCashPrize && !isShowdown ? (
                <div className="hero-stat-box">
                  <span className="stat-label">ENTRY</span>
                  <span className="stat-value">{tournament.entryFee}</span>
                </div>
              ) : null}
            </div>

            <div className="hero-action-container">
              <TournamentLifecycleCta tournament={tournament} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
