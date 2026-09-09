/**
 * Shared Next Event selection for Home, Dashboard, and the tournaments page.
 *
 * Prefers currently playable/open events over closed ones, then the latest
 * global tournament number. Dated events keep chronological order only as a
 * tie-break. Null starts_at is allowed and is not invented here.
 */

function tournamentStatusKey(tournament) {
  let key = String(tournament?.dbStatus ?? tournament?.status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (key === "registrations_open") key = "registration_open";
  if (key === "registrations_closed") key = "registration_closed";
  if (key === "live") key = "active";
  return key;
}

/**
 * Lower is more current: live, then registrations open, then coming soon,
 * then registration closed.
 * @param {object} tournament
 * @returns {number}
 */
function nextEventBucket(tournament) {
  const key = tournamentStatusKey(tournament);
  if (key === "active") return 0;
  if (key === "registration_open") return 1;
  if (key === "coming_soon") return 2;
  if (key === "registration_closed") return 3;
  return 9;
}

function globalNumberOf(tournament) {
  return Number(tournament?.globalNumber ?? tournament?.global_number ?? tournament?.number ?? 0) || 0;
}

function isArchivedTournament(tournament) {
  return Boolean(tournament?.isArchived ?? tournament?.is_archived);
}

function startsAtMs(tournament) {
  const value = tournament?.startsAt ?? tournament?.starts_at;
  if (!value) return Number.NaN;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? Number.NaN : ms;
}

function identityOf(tournament) {
  return [
    tournament?.id,
    tournament?.tournamentId,
    tournament?.external_id,
    tournament?.slug,
  ].filter(Boolean);
}

/**
 * Pick the public Next Event from already-fetched tournaments.
 * Does not hardcode a slug. Does not write timestamps.
 *
 * @param {object[]} tournaments
 * @param {{ excludeId?: string | null }} [options]
 * @returns {object | null}
 */
export function selectNextScheduledTournament(tournaments, { excludeId } = {}) {
  const excluded = new Set(excludeId ? [excludeId] : []);
  const candidates = (tournaments ?? []).filter((tournament) => {
    if (!tournament || isArchivedTournament(tournament)) return false;
    if (identityOf(tournament).some((id) => excluded.has(id))) return false;
    return nextEventBucket(tournament) < 9;
  });

  if (!candidates.length) return null;

  const bestBucket = Math.min(...candidates.map(nextEventBucket));
  const inBucket = candidates.filter((t) => nextEventBucket(t) === bestBucket);

  inBucket.sort((a, b) => {
    const byNumber = globalNumberOf(b) - globalNumberOf(a);
    if (byNumber !== 0) return byNumber;
    const aMs = startsAtMs(a);
    const bMs = startsAtMs(b);
    const aValid = !Number.isNaN(aMs);
    const bValid = !Number.isNaN(bMs);
    if (aValid && bValid && aMs !== bMs) return aMs - bMs;
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;
    return 0;
  });

  return inBucket[0] ?? null;
}
