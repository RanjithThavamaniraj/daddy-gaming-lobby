import { DGL_POINTS } from "../config/dglPointsConfig";
import { TOURNAMENT_REGISTRY } from "../config/tournamentRegistry";

/**
 * @param {number} number
 * @returns {string}
 */
export function formatTournamentNumber(number) {
  return `Tournament #${number}`;
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
 */
export function enrichTournament(tournament) {
  const championPlayers = sortPlayerNames(tournament.championPlayers ?? []);
  const runnerUpPlayers = sortPlayerNames(tournament.runnerUpPlayers ?? []);
  const slug = tournament.slug ?? null;

  return {
    ...tournament,
    tournamentNumber: formatTournamentNumber(tournament.number),
    title: tournament.name,
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
  return TOURNAMENT_REGISTRY.map(enrichTournament);
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
    number: tournament.number,
    tournamentNumber: tournament.tournamentNumber,
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
    number: tournament.number,
    tournamentNumber: tournament.tournamentNumber,
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
