import { Link } from "react-router-dom";
import { Calendar, Trophy } from "lucide-react";

import GameIcon from "./GameIcon";
import ReserveInfoTooltip from "./ReserveInfoTooltip";
import { EVENT_TYPES, getSeriesLabel, isSaturdayShowdown } from "../../config/eventTypeConfig";
import { formatInrPrize, parsePrizePoolAmount } from "../../lib/prizePool";
import {
  deriveTournamentLifecycle,
  formatTournamentSchedule,
  formatTournamentStartDate,
  getLifecycleDashboardBadge,
  isLifecycleClosed,
  isLifecycleCompleted,
  isLifecycleComingSoon,
  isLifecycleLive,
  isLifecycleOpen,
  LIFECYCLE,
  resolveTournamentLifecycleCta,
} from "../../lib/tournamentLifecycle";
import { isRegisteredForTournament } from "../../lib/registrationSession";

/**
 * Shared DGL tournament card: main (full hero), next (medium), compact (upcoming).
 * The card itself is the navigation link — CTA is visual only.
 *
 * @param {object} props
 * @param {object} props.tournament
 * @param {"main"|"next"|"compact"} [props.variant]
 * @param {number} [props.index]
 */
export default function TournamentPresentationCard({
  tournament,
  variant = "main",
  index = 0,
}) {
  if (!tournament) return null;

  const gameSlug =
    tournament.gameSlug ??
    tournament.game?.toLowerCase?.().replace(/\s+/g, "-") ??
    "dgl";
  const lifecycle =
    tournament.lifecycle ?? deriveTournamentLifecycle(tournament);
  const isCompleted = isLifecycleCompleted(tournament);
  const isLive = isLifecycleLive(tournament);
  const isRegistrationOpen = isLifecycleOpen(tournament);
  const isRegistrationClosed = isLifecycleClosed(tournament);
  const isComingSoon = isLifecycleComingSoon(tournament);
  const isShowdown = isSaturdayShowdown(tournament.eventType);
  const seriesLabel = tournament.seriesLabel || getSeriesLabel(tournament.eventType);
  const seriesBadge = isShowdown
    ? EVENT_TYPES.saturday_showdown.heroBadge
    : EVENT_TYPES.championship.badge;
  const title =
    tournament.title ||
    tournament.championshipName ||
    tournament.name ||
    "Tournament";
  const statusLabel = getLifecycleDashboardBadge(tournament);
  const statusClass =
    lifecycle === LIFECYCLE.COMPLETED || isCompleted
      ? "tournament-completed"
      : lifecycle === LIFECYCLE.CLOSED || isRegistrationClosed
        ? "registrations-closed"
        : lifecycle === LIFECYCLE.LIVE || isLive
          ? "live"
          : lifecycle === LIFECYCLE.OPEN || isRegistrationOpen
            ? "registrations-open"
            : "coming-soon";

  const capacity = tournament.registrationLimit ?? null;
  const registered = tournament.confirmedCount ?? tournament.registeredCount ?? 0;
  const slotsRemaining =
    capacity == null ? null : Math.max(0, capacity - registered);
  const isTeamSlots = tournament.registrationMode === "team_slots";
  const hasDynamicPrize = Number(tournament.prizePerConfirmed) > 0;
  const hasCashPrize =
    parsePrizePoolAmount(tournament.prizePool) > 0 || hasDynamicPrize;
  const showFreeEntry = isShowdown || !hasCashPrize;
  const championPlayers = tournament.championPlayers ?? [];
  const compact = variant === "compact";
  const stats = buildStatItems(tournament, {
    compact,
    isMain: variant === "main",
    isShowdown,
    isRegistrationOpen,
    capacity,
    registered,
    slotsRemaining,
    showFreeEntry,
    hasCashPrize,
    seriesLabel,
    isTeamSlots,
  });

  const slug = tournament.slug ?? tournament.resultsSlug ?? null;
  const href = tournament.resultsPath ?? (slug ? `/tournaments/${slug}` : null);
  const alreadyRegistered = isRegisteredForTournament(tournament.id);
  const cta = resolveTournamentLifecycleCta(tournament, { alreadyRegistered });
  const showCta =
    isRegistrationOpen ||
    isRegistrationClosed ||
    isLive ||
    isComingSoon ||
    isCompleted;

  const cardClass = `hero-card hero-card--${variant}${href ? " hero-card--link" : ""}`;
  const style = {
    "--accent": tournament.accent,
    animationDelay: compact ? `${0.08 * index}s` : undefined,
  };
  const ariaLabel = `${title} — ${statusLabel}. Open tournament page.`;

  const body = (
    <>
      <div className="hero-scanlines" />
      <div className="hero-inner">
        <div className="hero-details-container">
          <div className="hero-content">
            <div className="hero-icon">
              <GameIcon slug={gameSlug} />
            </div>
            <div className="hero-details">
              <div className="hero-badge-row">
                {tournament.tournamentNumber ? (
                  <span className="hero-tournament-badge">
                    {tournament.tournamentNumber}
                  </span>
                ) : null}
                {seriesBadge ? (
                  <span
                    className="hero-tournament-badge hero-series-badge"
                    style={
                      isShowdown
                        ? {
                            color: EVENT_TYPES.saturday_showdown.goldAccent,
                            borderColor: `color-mix(in srgb, ${EVENT_TYPES.saturday_showdown.goldAccent} 45%, transparent)`,
                            background: `color-mix(in srgb, ${EVENT_TYPES.saturday_showdown.goldAccent} 12%, transparent)`,
                          }
                        : undefined
                    }
                  >
                    {seriesBadge}
                  </span>
                ) : null}
              </div>
              <h3 className="hero-title">{title}</h3>
              <div className="hero-badges">
                <span className={`status-badge-custom ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          {stats.length > 0 ? (
            <div className="hero-stats-grid featured-stats-grid">
              {stats.map((stat) => (
                <div className="hero-stat-box" key={stat.label}>
                  <span className="stat-label">
                    {stat.label}
                    {stat.tooltip ? (
                      <>
                        {" "}
                        <ReserveInfoTooltip />
                      </>
                    ) : null}
                  </span>
                  <span className={`stat-value${stat.gold ? " text-completed" : ""}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {variant === "main" && isCompleted ? (
            <div className="registration-progress-container">
              <div className="progress-text-row">
                <span>
                  TOURNAMENT STATUS:{" "}
                  <strong className="text-completed">Completed</strong>
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

          {variant === "main" && isCompleted && championPlayers.length > 0 ? (
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

          {variant === "main" && isCompleted && tournament.completedDate ? (
            <div className="dates-info-row">
              <div className="date-item">
                <Calendar size={16} className="text-accent" />
                <span>
                  Completed: <strong>{tournament.completedDate}</strong>
                </span>
              </div>
            </div>
          ) : null}

          {showCta ? (
            <div className="hero-action-container">
              <span
                className={`cyber-btn hero-cta-visual ${
                  cta.disabled ? "disabled" : "primary"
                }`}
                aria-hidden="true"
              >
                <span>{cta.label}</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  if (!href) {
    return (
      <div className={cardClass} style={style}>
        {body}
      </div>
    );
  }

  return (
    <Link to={href} className={cardClass} style={style} aria-label={ariaLabel}>
      {body}
    </Link>
  );
}

/**
 * @param {object} tournament
 * @param {object} ctx
 */
function buildStatItems(tournament, ctx) {
  const {
    compact,
    isMain,
    isShowdown,
    isRegistrationOpen,
    capacity,
    registered,
    slotsRemaining,
    showFreeEntry,
    hasCashPrize,
    seriesLabel,
    isTeamSlots,
  } = ctx;

  /** @type {{ label: string, value: string | number, gold?: boolean, tooltip?: boolean }[]} */
  const items = [];
  const push = (label, value, extra = {}) => {
    if (value == null || value === "") return;
    items.push({ label, value, ...extra });
  };

  push("GAME", tournament.game);
  push("FORMAT", tournament.format);
  if (!compact) {
    push("MATCH TYPE", tournament.matchType);
  }
  if (!compact && tournament.platform) {
    push("PLATFORM", tournament.platform);
  }
  if (isTeamSlots && tournament.teamLimit != null) {
    push("TEAMS", tournament.teamLimit);
  } else if (!compact && tournament.registrationLimit != null) {
    push("PLAYERS", tournament.registrationLimit);
  }
  if (!isTeamSlots && isRegistrationOpen && slotsRemaining != null) {
    push("SLOTS REMAINING", slotsRemaining);
  }
  if (!isTeamSlots && capacity != null) {
    push("REGISTERED PLAYERS", `${tournament.confirmedCount ?? registered} / ${capacity}`);
  }
  if (!compact && Number(tournament.reserveLimit) > 0) {
    push(
      "RESERVE PLAYERS",
      `${tournament.reserveCount ?? 0} / ${tournament.reserveLimit}`,
      { tooltip: true }
    );
  }
  if (isShowdown) {
    push("SERIES", seriesLabel);
  }
  if (showFreeEntry) {
    push("ENTRY", tournament.entryFee?.trim() || "Free", { gold: true });
  } else if (tournament.prizePool || hasCashPrize) {
    const per = Number(tournament.prizePerConfirmed);
    const prizeValue =
      isMain && per > 0 && capacity != null
        ? `Up to ${formatInrPrize(capacity * per)}`
        : tournament.prizePool;
    const prizeLabel =
      isTeamSlots && hasCashPrize && prizeValue
        ? /team prize/i.test(String(prizeValue))
          ? prizeValue
          : `${prizeValue} Team Prize`
        : prizeValue;
    push(compact ? "PRIZE" : "PRIZE POOL", prizeLabel, { gold: true });
  }
  if (tournament.rewards) {
    push("REWARDS", compact ? "DGL Points" : tournament.rewards, { gold: true });
  } else if (isShowdown) {
    push(
      "REWARDS",
      compact ? "DGL Points" : "DGL Points • Hall of Titans Recognition",
      { gold: true }
    );
  }
  if (tournament.entryFee && hasCashPrize && !isShowdown) {
    push("ENTRY", tournament.entryFee);
  }
  if (tournament.startsAt) {
    push(
      tournament.endsAt ? "EVENT WINDOW" : "TOURNAMENT START",
      tournament.endsAt
        ? formatTournamentSchedule(tournament.startsAt, tournament.endsAt)
        : formatTournamentStartDate(tournament.startsAt)
    );
  }

  return items;
}
