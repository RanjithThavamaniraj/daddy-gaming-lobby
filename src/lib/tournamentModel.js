import { DGL_POINTS } from "../config/dglPointsConfig";
import { TOURNAMENT_REGISTRY } from "../config/tournamentRegistry";

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
 * Per-game championship title — sequence resets per gameSlug.
 * @param {string} championshipLabel
 * @param {number} gameChampionshipNumber
 * @returns {string}
 */
export function formatChampionshipName(championshipLabel, gameChampionshipNumber) {
  return `DGL ${championshipLabel} Championship #${gameChampionshipNumber}`;
}

/**
 * Assign global and per-game championship numbers from tournament records.
 * Sort by global number; game championship increments only when the same gameSlug repeats.
 * Future: supabase.from("tournaments").select("*").order("number")
 *
 * @param {import("../config/tournamentRegistry").TournamentRecord[]} registry
 * @returns {Map<string, TournamentIdentifiers>}
 */
export function buildTournamentIdentifierMap(registry) {
  const sorted = [...registry].sort((a, b) => a.number - b.number);
  const gameCounts = new Map();
  /** @type {Map<string, TournamentIdentifiers>} */
  const map = new Map();

  for (const tournament of sorted) {
    const championshipLabel = tournament.championshipLabel ?? tournament.game;
    const gameChampionshipNumber = (gameCounts.get(tournament.gameSlug) ?? 0) + 1;
    gameCounts.set(tournament.gameSlug, gameChampionshipNumber);

    map.set(tournament.id, {
      globalNumber: tournament.number,
      gameChampionshipNumber,
      tournamentNumber: formatGlobalTournamentNumber(tournament.number),
      championshipLabel,
      championshipName: formatChampionshipName(
        championshipLabel,
        gameChampionshipNumber
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
  const ids =
    identifiers ??
    getTournamentIdentifiers(tournament.id) ?? {
      globalNumber: tournament.number,
      gameChampionshipNumber: 1,
      tournamentNumber: formatGlobalTournamentNumber(tournament.number),
      championshipLabel: tournament.championshipLabel ?? tournament.game,
      championshipName: formatChampionshipName(
        tournament.championshipLabel ?? tournament.game,
        1
      ),
    };

  const championPlayers = sortPlayerNames(tournament.championPlayers ?? []);
  const runnerUpPlayers = sortPlayerNames(tournament.runnerUpPlayers ?? []);
  const slug = tournament.slug ?? null;

  return {
    ...tournament,
    ...ids,
    name: ids.championshipName,
    title: ids.championshipName,
    resultsPath: slug ? `/tournaments/${slug}` : null,
    resultsSlug: slug,
    championPlayers,
    runnerUpPlayers,
    pointsAwarded: {
      champion: DGL_POINTS.champion,
      runnerUp: DGL_POINTS.runnerUp,
      thirdPlace: DGL_POINTS.thirdPlace,
    },
    /** @deprecated Use pointsAwarded.champion */
    dglPoints: DGL_POINTS.champion,
    runnerUpDglPoints: DGL_POINTS.runnerUp,
  };
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
    (t) => t.status === "Coming Soon" || t.status === "Active"
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
    number: tournament.globalNumber,
    globalNumber: tournament.globalNumber,
    gameChampionshipNumber: tournament.gameChampionshipNumber,
    tournamentNumber: tournament.tournamentNumber,
    championshipName: tournament.championshipName,
    title: tournament.title,
    game: tournament.game,
    gameSlug: tournament.gameSlug,
    format: tournament.format ?? "—",
    matchType: tournament.matchType ?? "—",
    prizePool: tournament.prizePool ?? "TBA",
    status: tournament.status ?? "Coming Soon",
    completedDate: tournament.completedDate,
    accent: tournament.accent,
    resultsPath: tournament.resultsPath ?? null,
    resultsSlug: tournament.resultsSlug ?? null,
    championPlayers: tournament.championPlayers ?? [],
  };
}

/**
 * Completed card shape for the tournaments hub archive.
 * @param {ReturnType<typeof enrichTournament>} tournament
 */
export function toCompletedCardShape(tournament) {
  return {
    id: tournament.id,
    number: tournament.globalNumber,
    globalNumber: tournament.globalNumber,
    gameChampionshipNumber: tournament.gameChampionshipNumber,
    tournamentNumber: tournament.tournamentNumber,
    championshipName: tournament.championshipName,
    title: tournament.title,
    game: tournament.game,
    gameSlug: tournament.gameSlug,
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
    globalNumber: tournament.globalNumber,
    gameChampionshipNumber: tournament.gameChampionshipNumber,
    tournamentNumber: tournament.tournamentNumber,
    championshipName: tournament.championshipName,
    title: tournament.title,
    game: tournament.game,
    gameSlug: tournament.gameSlug,
    status: tournament.status,
    accent: tournament.accent,
  };
}
