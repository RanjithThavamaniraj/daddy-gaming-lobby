import { DGL_POINTS } from "../config/dglPointsConfig";
import { TOURNAMENT_REGISTRY } from "../config/tournamentRegistry";
import { normalizePrizePoolDisplay } from "./prizePool";
import { resolveEventAccent } from "../config/eventTypeConfig";
import { applyLifecycleStatus, isLifecycleClosed } from "./tournamentLifecycle";

/**
 * @typedef {object} TournamentIdentifiers
 * @property {number} globalNumber
 * @property {number} gameChampionshipNumber
 * @property {string} tournamentNumber - e.g. "Tournament #1"
 * @property {string} championshipName - e.g. "DGL Valorant Championship #1"
 * @property {string} championshipLabel
 */

/**
 * Global DGL tournament label — increments after every event.
 * @param {number} number
 * @returns {string}
 */
export function formatGlobalTournamentNumber(number) {
  return `Tournament #${number}`;
}

/** @deprecated Use formatGlobalTournamentNumber */
export const formatTournamentNumber = formatGlobalTournamentNumber;

/**
 * Per-series title — sequence resets per (game, event type) combination, so
 * a game's Championship and Saturday Showdown series number independently.
 * @param {string} championshipLabel
 * @param {number} gameChampionshipNumber
 * @param {string} [eventType] - "championship" (default) | "saturday_showdown"
 * @returns {string}
 */
export function formatChampionshipName(championshipLabel, gameChampionshipNumber, eventType) {
  const seriesName = eventType === "saturday_showdown" ? "Saturday Showdown" : "Championship";
  return `DGL ${championshipLabel} ${seriesName} #${gameChampionshipNumber}`;
}

/**
 * Assign global and per-series championship numbers from tournament records.
 * Sort by global number; the per-series counter increments only when the
 * same (gameSlug, eventType) pair repeats — matching the DB's series_id-scoped
 * numbering (see dgl_assign_game_championship_number).
 * Future: supabase.from("tournaments").select("*").order("number")
 *
 * @param {import("../config/tournamentRegistry").TournamentRecord[]} registry
 * @returns {Map<string, TournamentIdentifiers>}
 */
export function buildTournamentIdentifierMap(registry) {
  const sorted = [...registry].sort((a, b) => a.number - b.number);
  const seriesCounts = new Map();
  /** @type {Map<string, TournamentIdentifiers>} */
  const map = new Map();

  for (const tournament of sorted) {
    const championshipLabel = tournament.championshipLabel ?? tournament.game;
    const eventType = tournament.eventType ?? "championship";
    const seriesKey = `${tournament.gameSlug}::${eventType}`;
    const gameChampionshipNumber = (seriesCounts.get(seriesKey) ?? 0) + 1;
    seriesCounts.set(seriesKey, gameChampionshipNumber);

    map.set(tournament.id, {
      globalNumber: tournament.number,
      gameChampionshipNumber,
      tournamentNumber: formatGlobalTournamentNumber(tournament.number),
      championshipLabel,
      championshipName: formatChampionshipName(
        championshipLabel,
        gameChampionshipNumber,
        eventType
      ),
    });
  }

  return map;
}

/** @type {Map<string, TournamentIdentifiers> | null} */
let identifierMapCache = null;

/** @returns {Map<string, TournamentIdentifiers>} */
export function getTournamentIdentifierMap() {
  if (!identifierMapCache) {
    identifierMapCache = buildTournamentIdentifierMap(TOURNAMENT_REGISTRY);
  }
  return identifierMapCache;
}

/**
 * @param {string} tournamentId
 * @returns {TournamentIdentifiers | null}
 */
export function getTournamentIdentifiers(tournamentId) {
  return getTournamentIdentifierMap().get(tournamentId) ?? null;
}

/**
 * @param {string[]} players
 * @returns {string[]}
 */
export function sortPlayerNames(players = []) {
  return [...players].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

/**
 * @param {import("../config/tournamentRegistry").TournamentRecord} tournament
 * @param {TournamentIdentifiers} [identifiers]
 */
export function enrichTournament(tournament, identifiers) {
  const eventType = tournament.eventType ?? "championship";
  const ids =
    identifiers ??
    getTournamentIdentifiers(tournament.id) ?? {
      globalNumber: tournament.number,
      gameChampionshipNumber: 1,
      tournamentNumber: formatGlobalTournamentNumber(tournament.number),
      championshipLabel: tournament.championshipLabel ?? tournament.game,
      championshipName: formatChampionshipName(
        tournament.championshipLabel ?? tournament.game,
        1,
        eventType
      ),
    };

  const championPlayers = sortPlayerNames(tournament.championPlayers ?? []);
  const runnerUpPlayers = sortPlayerNames(tournament.runnerUpPlayers ?? []);
  const semiFinalistPlayers = sortPlayerNames(tournament.semiFinalistPlayers ?? []);
  const quarterFinalistPlayers = sortPlayerNames(tournament.quarterFinalistPlayers ?? []);
  const groupStagePlayers = sortPlayerNames(tournament.groupStagePlayers ?? []);
  const slug = tournament.slug ?? null;

  return applyLifecycleStatus({
    ...tournament,
    tournamentId: tournament.tournamentId ?? null,
    ...ids,
    name: ids.championshipName,
    title: ids.championshipName,
    eventType,
    accent: resolveEventAccent(eventType, tournament.accent),
    prizePool: normalizePrizePoolDisplay(tournament.prizePool),
    entryFee: tournament.entryFee ?? null,
    resultsPath: slug ? `/tournaments/${slug}` : null,
    resultsSlug: slug,
    championPlayers,
    runnerUpPlayers,
    semiFinalistPlayers,
    quarterFinalistPlayers,
    groupStagePlayers,
    pointsAwarded: {
      champion: tournament.pointsAwarded?.champion ?? DGL_POINTS.champion,
      runnerUp: tournament.pointsAwarded?.runnerUp ?? DGL_POINTS.runnerUp,
      semiFinalist: tournament.pointsAwarded?.semiFinalist ?? DGL_POINTS.semiFinalist,
      quarterFinalist: tournament.pointsAwarded?.quarterFinalist ?? DGL_POINTS.quarterFinalist,
      groupStage: tournament.pointsAwarded?.groupStage ?? DGL_POINTS.groupStage,
      thirdPlace: tournament.pointsAwarded?.thirdPlace ?? DGL_POINTS.thirdPlace,
    },
    dglPoints: tournament.pointsAwarded?.champion ?? DGL_POINTS.champion,
    runnerUpDglPoints: tournament.pointsAwarded?.runnerUp ?? DGL_POINTS.runnerUp,
  });
}

/** @returns {ReturnType<typeof enrichTournament>[]} */
export function getAllTournaments() {
  const identifierMap = getTournamentIdentifierMap();
  return TOURNAMENT_REGISTRY.map((t) =>
    enrichTournament(t, identifierMap.get(t.id))
  );
}

/** @returns {ReturnType<typeof enrichTournament>[]} */
export function getCompletedTournaments() {
  return getAllTournaments().filter((t) => t.status === "Completed");
}

/** @returns {ReturnType<typeof enrichTournament>[]} */
export function getUpcomingTournaments() {
  return getAllTournaments().filter(
    (t) =>
      t.status === "Coming Soon" ||
      t.status === "Registrations Open" ||
      t.status === "Registration Closed" ||
      t.status === "Registrations Closed" ||
      t.status === "Live"
  );
}

/**
 * @param {string} slug
 * @returns {ReturnType<typeof enrichTournament> | null}
 */
export function getTournamentResultsBySlug(slug) {
  const tournament = getCompletedTournaments().find((t) => t.slug === slug);
  return tournament ?? null;
}

/**
 * @param {string} slug
 * @returns {ReturnType<typeof enrichTournament> | null}
 */
export function getTournamentBySlug(slug) {
  return getAllTournaments().find((t) => t.slug === slug) ?? null;
}

/** @returns {string[]} */
export function getAllTournamentResultsSlugs() {
  return getCompletedTournaments()
    .map((t) => t.slug)
    .filter(Boolean);
}

/**
 * Featured / main-event shape for the tournaments hub.
 * @param {ReturnType<typeof enrichTournament>} tournament
 */
export function toFeaturedShape(tournament) {
  return {
    id: tournament.id,
    tournamentId: tournament.tournamentId ?? null,
    slug: tournament.slug ?? tournament.resultsSlug ?? null,
    number: tournament.globalNumber,
    globalNumber: tournament.globalNumber,
    gameChampionshipNumber: tournament.gameChampionshipNumber,
    tournamentNumber: tournament.tournamentNumber,
    championshipName: tournament.championshipName,
    title: tournament.title,
    game: tournament.game,
    gameSlug: tournament.gameSlug,
    eventType: tournament.eventType ?? "championship",
    format: tournament.format ?? "—",
    matchType: tournament.matchType ?? "—",
    prizePool: tournament.prizePool ?? "TBA",
    entryFee: tournament.entryFee ?? null,
    status: tournament.status ?? "Coming Soon",
    completedDate: tournament.completedDate,
    accent: tournament.accent,
    registrationLimit: tournament.registrationLimit ?? null,
    registeredCount: tournament.registeredCount ?? null,
    registrationClosesAt: tournament.registrationClosesAt ?? null,
    startsAt: tournament.startsAt ?? null,
    lifecycle: tournament.lifecycle ?? null,
    resultsPath: tournament.resultsPath ?? null,
    resultsSlug: tournament.resultsSlug ?? null,
    championPlayers: tournament.championPlayers ?? [],
  };
}

/**
 * Featured tournament priority order:
 *   0. isFeatured (manual override — set explicitly by promote_next_tournament)
 *   1. Live  2. Registrations Open  3. Registrations Closed  4. Latest Completed
 *
 * Deliberately excludes "Coming Soon": a coming_soon tournament (e.g. the
 * Next Tournament) must never become the Main Event on its own. Promotion
 * only happens via an explicit admin action, which sets is_featured=true
 * (tier 0) at the same time it opens registration (tier 2) — so once
 * promoted, a tournament is always caught by an earlier tier anyway. This
 * is what keeps "finish the current Main Event" from silently promoting
 * whatever is next.
 *
 * @param {ReturnType<typeof enrichTournament>[]} tournaments
 * @returns {ReturnType<typeof enrichTournament> | null}
 */
export function selectFeaturedTournament(tournaments) {
  if (!tournaments?.length) return null;

  const featured = tournaments
    .filter((t) => t.isFeatured)
    .sort((a, b) => (a.globalNumber ?? 0) - (b.globalNumber ?? 0))[0];
  if (featured) return featured;

  const live = tournaments
    .filter((t) => t.status === "Live")
    .sort((a, b) => a.globalNumber - b.globalNumber)[0];
  if (live) return live;

  const open = tournaments
    .filter((t) => t.status === "Registrations Open")
    .sort((a, b) => a.globalNumber - b.globalNumber)[0];
  if (open) return open;

  const closed = tournaments
    .filter((t) => isLifecycleClosed(t) || t.status === "Registrations Closed")
    .sort((a, b) => a.globalNumber - b.globalNumber)[0];
  if (closed) return closed;

  const completed = tournaments
    .filter((t) => t.status === "Completed")
    .sort((a, b) => (b.globalNumber ?? 0) - (a.globalNumber ?? 0))[0];
  return completed ?? null;
}

/**
 * Next Tournament selection — same status-priority rule as
 * selectFeaturedTournament, applied to whatever is left once the current
 * Main Event and completed tournaments are excluded. Purely derived: a
 * tournament becomes "next" automatically the moment it outranks any other
 * non-featured, non-completed tournament, with no manual flag and no code
 * changes required for future championships.
 *
 * @param {ReturnType<typeof enrichTournament>[]} tournaments
 * @param {ReturnType<typeof enrichTournament> | null} mainEvent - the tournament already selected as Main Event
 * @returns {ReturnType<typeof enrichTournament> | null}
 */
export function selectNextTournament(tournaments, mainEvent) {
  if (!tournaments?.length) return null;

  const candidates = tournaments.filter(
    (t) => t.status !== "Completed" && t.id !== mainEvent?.id
  );

  const live = candidates
    .filter((t) => t.status === "Live")
    .sort((a, b) => a.globalNumber - b.globalNumber)[0];
  if (live) return live;

  const open = candidates
    .filter((t) => t.status === "Registrations Open")
    .sort((a, b) => a.globalNumber - b.globalNumber)[0];
  if (open) return open;

  const closed = candidates
    .filter((t) => isLifecycleClosed(t) || t.status === "Registrations Closed")
    .sort((a, b) => a.globalNumber - b.globalNumber)[0];
  if (closed) return closed;

  const upcoming = candidates
    .filter((t) => t.status === "Coming Soon")
    .sort((a, b) => a.globalNumber - b.globalNumber)[0];
  return upcoming ?? null;
}

/**
 * Count tournaments currently accepting registrations.
 * @param {Array<{ id?: string, status?: string } | null | undefined>} tournaments
 * @returns {number}
 */
export function countRegistrationOpenTournaments(tournaments) {
  const seen = new Set();
  let count = 0;

  for (const tournament of tournaments ?? []) {
    if (!tournament?.id || seen.has(tournament.id)) continue;
    seen.add(tournament.id);
    if (tournament.status === "Registrations Open") count += 1;
  }

  return count;
}

/**
 * Completed card shape for the tournaments hub archive.
 * @param {ReturnType<typeof enrichTournament>} tournament
 */
export function toCompletedCardShape(tournament) {
  return {
    id: tournament.id,
    tournamentId: tournament.tournamentId ?? null,
    slug: tournament.slug ?? tournament.resultsSlug ?? null,
    number: tournament.globalNumber,
    globalNumber: tournament.globalNumber,
    gameChampionshipNumber: tournament.gameChampionshipNumber,
    tournamentNumber: tournament.tournamentNumber,
    championshipName: tournament.championshipName,
    title: tournament.title,
    game: tournament.game,
    gameSlug: tournament.gameSlug,
    eventType: tournament.eventType ?? "championship",
    completedDate: tournament.completedDate,
    championPlayers: tournament.championPlayers,
    prizePool: tournament.prizePool,
    accent: tournament.accent,
    resultsPath: tournament.resultsPath,
    resultsSlug: tournament.resultsSlug,
  };
}

/**
 * Upcoming tournament card shape for hub and dashboard widgets.
 * @param {ReturnType<typeof enrichTournament>} tournament
 */
export function toUpcomingCardShape(tournament) {
  return {
    id: tournament.id,
    tournamentId: tournament.tournamentId ?? null,
    slug: tournament.slug ?? tournament.resultsSlug ?? null,
    globalNumber: tournament.globalNumber,
    gameChampionshipNumber: tournament.gameChampionshipNumber,
    tournamentNumber: tournament.tournamentNumber,
    championshipName: tournament.championshipName,
    title: tournament.title,
    game: tournament.game,
    gameSlug: tournament.gameSlug,
    eventType: tournament.eventType ?? "championship",
    status: tournament.status,
    accent: tournament.accent,
    entryFee: tournament.entryFee ?? null,
    prizePool: tournament.prizePool ?? null,
    format: tournament.format ?? null,
    matchType: tournament.matchType ?? null,
  };
}
