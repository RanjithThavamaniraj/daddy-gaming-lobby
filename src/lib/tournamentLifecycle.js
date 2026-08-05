/**
 * Automatic public tournament lifecycle (Phase 1).
 *
 * Every public tournament is exactly one of:
 *   Registrations Open | Registration Closed | Live | Completed
 *
 * Derives from DB status + registration count + dates.
 * Coming Soon is only used for tournaments that have never opened registration.
 */

/** @typedef {'open'|'closed'|'live'|'completed'|'coming_soon'} TournamentLifecycle */

export const LIFECYCLE = {
  OPEN: "open",
  CLOSED: "closed",
  LIVE: "live",
  COMPLETED: "completed",
  COMING_SOON: "coming_soon",
};

/** @type {Record<TournamentLifecycle, string>} */
export const LIFECYCLE_LABEL = {
  open: "Registrations Open",
  closed: "Registration Closed",
  live: "Live",
  completed: "Completed",
  coming_soon: "Coming Soon",
};

/** @type {Record<TournamentLifecycle, string>} */
export const LIFECYCLE_BADGE = {
  open: "🟢 Registrations Open",
  closed: "🟠 Registration Closed",
  live: "🔴 LIVE NOW",
  completed: "⚫ Completed",
  coming_soon: "Coming Soon",
};

/**
 * @param {string | null | undefined} value
 * @returns {number | null}
 */
function parseTime(value) {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Normalize app/DB status strings into a coarse bucket.
 * @param {object} tournament
 * @returns {TournamentLifecycle | null}
 */
function statusHint(tournament) {
  const raw = String(tournament?.dbStatus ?? tournament?.status ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");

  if (raw === "completed") return LIFECYCLE.COMPLETED;
  if (raw === "active" || raw === "live") return LIFECYCLE.LIVE;
  if (
    raw === "registration closed" ||
    raw === "registrations closed"
  ) {
    return LIFECYCLE.CLOSED;
  }
  if (
    raw === "registration open" ||
    raw === "registrations open"
  ) {
    return LIFECYCLE.OPEN;
  }
  if (raw === "coming soon") return LIFECYCLE.COMING_SOON;
  return null;
}

/**
 * Derive the public lifecycle for a tournament.
 * @param {object} tournament
 * @param {number} [nowMs]
 * @returns {TournamentLifecycle}
 */
export function deriveTournamentLifecycle(tournament, nowMs = Date.now()) {
  if (!tournament) return LIFECYCLE.COMING_SOON;

  const hint = statusHint(tournament);
  if (hint === LIFECYCLE.COMPLETED) return LIFECYCLE.COMPLETED;
  if (hint === LIFECYCLE.LIVE) return LIFECYCLE.LIVE;

  const startsAt = parseTime(tournament.startsAt);
  if (
    startsAt != null &&
    nowMs >= startsAt &&
    hint !== LIFECYCLE.COMING_SOON &&
    hint !== LIFECYCLE.COMPLETED
  ) {
    return LIFECYCLE.LIVE;
  }

  const registered = Number(
    tournament.confirmedCount ?? tournament.registeredCount ?? 0
  );
  const limit =
    tournament.registrationLimit == null
      ? null
      : Number(tournament.registrationLimit);
  const capacityFull = limit != null && registered >= limit;
  const closesAt = parseTime(tournament.registrationClosesAt);
  const dateClosed = closesAt != null && nowMs >= closesAt;

  if (
    hint === LIFECYCLE.CLOSED ||
    ((capacityFull || dateClosed) &&
      (hint === LIFECYCLE.OPEN || hint === LIFECYCLE.CLOSED || hint == null))
  ) {
    if (hint !== LIFECYCLE.COMING_SOON) {
      return LIFECYCLE.CLOSED;
    }
  }

  if (hint === LIFECYCLE.OPEN) return LIFECYCLE.OPEN;
  if (hint === LIFECYCLE.COMING_SOON) return LIFECYCLE.COMING_SOON;

  return LIFECYCLE.COMING_SOON;
}

/**
 * Apply derived lifecycle onto a tournament object (mutates status label).
 * @template {object} T
 * @param {T} tournament
 * @param {number} [nowMs]
 * @returns {T & { lifecycle: TournamentLifecycle, status: string }}
 */
export function applyLifecycleStatus(tournament, nowMs = Date.now()) {
  const lifecycle = deriveTournamentLifecycle(tournament, nowMs);
  return {
    ...tournament,
    lifecycle,
    status: LIFECYCLE_LABEL[lifecycle],
  };
}

/**
 * True when registration_closes_at has passed (locks ALL new registrations).
 * @param {object | null | undefined} tournament
 * @param {number} [nowMs]
 * @returns {boolean}
 */
export function isRegistrationDeadlinePassed(tournament, nowMs = Date.now()) {
  const closesAt = parseTime(tournament?.registrationClosesAt);
  return closesAt != null && nowMs >= closesAt;
}

/**
 * @param {object | null | undefined} tournament
 * @returns {boolean}
 */
export function isLifecycleOpen(tournament) {
  return (
    tournament?.lifecycle === LIFECYCLE.OPEN ||
    tournament?.status === LIFECYCLE_LABEL.open
  );
}

/**
 * @param {object | null | undefined} tournament
 * @returns {boolean}
 */
export function isLifecycleClosed(tournament) {
  return (
    tournament?.lifecycle === LIFECYCLE.CLOSED ||
    tournament?.status === LIFECYCLE_LABEL.closed ||
    tournament?.status === "Registrations Closed"
  );
}

/**
 * @param {object | null | undefined} tournament
 * @returns {boolean}
 */
export function isLifecycleLive(tournament) {
  return (
    tournament?.lifecycle === LIFECYCLE.LIVE || tournament?.status === "Live"
  );
}

/**
 * @param {object | null | undefined} tournament
 * @returns {boolean}
 */
export function isLifecycleCompleted(tournament) {
  return (
    tournament?.lifecycle === LIFECYCLE.COMPLETED ||
    tournament?.status === "Completed"
  );
}

/**
 * @param {object | null | undefined} tournament
 * @returns {boolean}
 */
export function isLifecycleComingSoon(tournament) {
  return (
    tournament?.lifecycle === LIFECYCLE.COMING_SOON ||
    tournament?.status === LIFECYCLE_LABEL.coming_soon
  );
}

/**
 * Lifecycle-driven public CTA. Tournament Series must never affect this.
 *
 * @param {object | null | undefined} tournament
 * @param {{ alreadyRegistered?: boolean }} [options]
 * @returns {{
 *   kind: 'register'|'registered'|'view'|'watch'|'results'|'coming_soon',
 *   label: string,
 *   href: string | null,
 *   disabled: boolean,
 *   external?: boolean,
 * }}
 */
export function resolveTournamentLifecycleCta(tournament, options = {}) {
  const alreadyRegistered = Boolean(options.alreadyRegistered);
  const slug = tournament?.slug ?? tournament?.resultsSlug ?? null;
  const hubPath = slug ? `/tournaments/${slug}` : null;
  const resultsPath = tournament?.resultsPath ?? hubPath;

  if (isLifecycleOpen(tournament)) {
    if (alreadyRegistered) {
      return {
        kind: "registered",
        label: "✓ REGISTERED",
        href: null,
        disabled: true,
      };
    }
    return {
      kind: "register",
      label: "REGISTER NOW",
      href: hubPath,
      disabled: !hubPath,
    };
  }

  if (isLifecycleClosed(tournament)) {
    return {
      kind: "view",
      label: "VIEW TOURNAMENT",
      href: hubPath,
      disabled: !hubPath,
    };
  }

  if (isLifecycleLive(tournament)) {
    const streamUrl =
      typeof tournament?.streamUrl === "string" && tournament.streamUrl.trim()
        ? tournament.streamUrl.trim()
        : null;
    if (streamUrl) {
      return {
        kind: "watch",
        label: "WATCH LIVE",
        href: streamUrl,
        disabled: false,
        external: true,
      };
    }
    return {
      kind: "view",
      label: "VIEW TOURNAMENT",
      href: hubPath,
      disabled: !hubPath,
    };
  }

  if (isLifecycleCompleted(tournament)) {
    return {
      kind: "results",
      label: "VIEW RESULTS",
      href: resultsPath,
      disabled: !resultsPath,
    };
  }

  return {
    kind: "coming_soon",
    label: "COMING SOON",
    href: null,
    disabled: true,
  };
}

/**
 * Format a future timestamp as a short countdown string.
 * @param {string | null | undefined} iso
 * @param {number} [nowMs]
 * @returns {string}
 */
export function formatCountdown(iso, nowMs = Date.now()) {
  const target = parseTime(iso);
  if (target == null) return "TBA";
  const diff = Math.max(0, target - nowMs);
  if (diff <= 0) return "Starting soon";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/**
 * Human-readable start date for cards.
 * @param {string | null | undefined} iso
 * @returns {string}
 */
export function formatTournamentStartDate(iso) {
  const ms = parseTime(iso);
  if (ms == null) return "TBA";
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
