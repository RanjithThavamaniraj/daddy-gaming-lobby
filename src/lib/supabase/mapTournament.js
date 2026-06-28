import { DGL_POINTS } from "../../config/dglPointsConfig";
import {
  formatChampionshipName,
  formatGlobalTournamentNumber,
  sortPlayerNames,
} from "../tournamentModel";

/** @type {Record<string, string>} */
const DB_STATUS_TO_APP = {
  completed: "Completed",
  coming_soon: "Coming Soon",
  registration_open: "Active",
  active: "Active",
  draft: "Draft",
  cancelled: "Cancelled",
};

/**
 * @param {string | null | undefined} status
 * @returns {string}
 */
export function mapDbTournamentStatus(status) {
  return DB_STATUS_TO_APP[status ?? ""] ?? "Coming Soon";
}

/**
 * @param {string[] | null | undefined} value
 * @returns {string[]}
 */
export function parsePlayerNameList(value) {
  if (!Array.isArray(value)) return [];
  return sortPlayerNames(value.filter(Boolean));
}

/**
 * @param {object} row - v_tournaments_enriched row
 * @param {object} [resultsRow] - v_tournament_results row
 */
export function mapEnrichedTournamentRow(row, resultsRow) {
  const globalNumber = row.global_number;
  const gameChampionshipNumber = row.game_championship_number ?? 1;
  const championshipLabel = row.championship_label ?? row.game_name;
  const championshipName =
    row.championship_name ??
    formatChampionshipName(championshipLabel, gameChampionshipNumber);
  const slug = row.slug ?? null;

  const championPlayers = parsePlayerNameList(resultsRow?.champion_players);
  const runnerUpPlayers = parsePlayerNameList(resultsRow?.runner_up_players);

  return {
    id: row.external_id,
    number: globalNumber,
    globalNumber,
    gameChampionshipNumber,
    tournamentNumber:
      row.tournament_number ?? formatGlobalTournamentNumber(globalNumber),
    championshipName,
    championshipLabel,
    name: championshipName,
    title: championshipName,
    slug,
    game: row.game_name,
    gameSlug: row.game_slug,
    format: row.format ?? undefined,
    matchType: row.match_type ?? undefined,
    prizePool: row.prize_pool_display ?? undefined,
    status: mapDbTournamentStatus(row.status),
    completedDate: row.completed_date_label ?? undefined,
    accent: row.accent_color ?? row.game_accent ?? "#a855f7",
    resultsPath: slug ? `/tournaments/${slug}` : null,
    resultsSlug: slug,
    championPlayers,
    runnerUpPlayers,
    pointsAwarded: {
      champion: DGL_POINTS.champion,
      runnerUp: DGL_POINTS.runnerUp,
      thirdPlace: DGL_POINTS.thirdPlace,
    },
    dglPoints: DGL_POINTS.champion,
    runnerUpDglPoints: DGL_POINTS.runnerUp,
  };
}

/**
 * @param {object} row - v_tournament_results row
 */
export function mapTournamentResultsRow(row) {
  const enriched = mapEnrichedTournamentRow(row, row);
  return {
    ...enriched,
    championPlayers: parsePlayerNameList(row.champion_players),
    runnerUpPlayers: parsePlayerNameList(row.runner_up_players),
  };
}

/**
 * @param {object} row - v_tournament_results row
 */
export function mapHallOfChampionsEntry(row) {
  const tournament = mapTournamentResultsRow(row);
  return {
    slug: tournament.slug,
    tournamentNumber: tournament.tournamentNumber,
    name: tournament.championshipName,
    game: tournament.game,
    gameSlug: tournament.gameSlug,
    championPlayers: tournament.championPlayers,
    prizePool: tournament.prizePool,
    dglPoints: tournament.pointsAwarded.champion,
    completedDate: tournament.completedDate,
    accent: tournament.accent,
    resultsPath: tournament.resultsPath,
  };
}

/**
 * @param {object} row - v_player_leaderboard row
 * @param {object} [meta]
 */
export function mapLeaderboardRow(row, meta = {}) {
  return {
    rank: row.rank,
    name: row.display_name,
    game: meta.game ?? "—",
    points: row.points,
    championships: row.championships,
    tournamentsPlayed: row.tournaments_played,
    accent: meta.accent ?? "#a855f7",
  };
}
