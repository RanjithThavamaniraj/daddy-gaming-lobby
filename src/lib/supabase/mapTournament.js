import { DGL_POINTS } from "../../config/dglPointsConfig";
import {
  formatChampionshipName,
  formatGlobalTournamentNumber,
  sortPlayerNames,
} from "../tournamentModel";
import { normalizePrizePoolDisplay } from "../prizePool";

/** @type {Record<string, string>} */
const DB_STATUS_TO_APP = {
  completed: "Completed",
  coming_soon: "Coming Soon",
  registration_open: "Registrations Open",
  registration_closed: "Registrations Closed",
  active: "Live",
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
 * @param {string | null | undefined} tournamentNumber
 * @returns {number}
 */
function parseGlobalNumberFromLabel(tournamentNumber) {
  return (
    Number.parseInt(String(tournamentNumber ?? "").replace(/\D/g, ""), 10) || 0
  );
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

  const championPlayers = parsePlayerNameList(
    resultsRow?.champion_players ?? row.champion_players
  );
  const runnerUpPlayers = parsePlayerNameList(
    resultsRow?.runner_up_players ?? row.runner_up_players
  );

  return {
    id: row.external_id ?? row.tournament_id ?? slug,
    tournamentId: row.id ?? row.tournament_id ?? null,
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
    prizePool: normalizePrizePoolDisplay(row.prize_pool_display) ?? undefined,
    entryFee: row.metadata?.entry_fee ?? undefined,
    status: mapDbTournamentStatus(row.status),
    completedDate: row.completed_date_label ?? undefined,
    isFeatured: row.is_featured ?? false,
    accent: row.accent_color ?? row.game_accent ?? "#a855f7",
    registrationLimit: row.registration_limit ?? undefined,
    registeredCount: row.registered_count ?? undefined,
    registrationOpensAt: row.registration_opens_at ?? undefined,
    registrationClosesAt: row.registration_closes_at ?? undefined,
    startsAt: row.starts_at ?? undefined,
    resultsPath: slug ? `/tournaments/${slug}` : null,
    resultsSlug: slug,
    championPlayers,
    runnerUpPlayers,
    pointsAwarded: {
      champion:
        resultsRow?.champion_points ?? row.champion_points ?? DGL_POINTS.champion,
      runnerUp:
        resultsRow?.runner_up_points ?? row.runner_up_points ?? DGL_POINTS.runnerUp,
      thirdPlace: DGL_POINTS.thirdPlace,
    },
    dglPoints:
      resultsRow?.champion_points ?? row.champion_points ?? DGL_POINTS.champion,
    runnerUpDglPoints:
      resultsRow?.runner_up_points ?? row.runner_up_points ?? DGL_POINTS.runnerUp,
  };
}

/**
 * @param {object} row - v_tournament_results row
 */
export function mapTournamentResultsRow(row) {
  const globalNumber = parseGlobalNumberFromLabel(row.tournament_number);
  const slug = row.slug ?? null;
  const championshipName = row.championship_name ?? "";

  const championshipMatch = championshipName.match(/#(\d+)\s*$/);
  const gameChampionshipNumber = championshipMatch
    ? Number.parseInt(championshipMatch[1], 10)
    : 1;

  return {
    id: slug ?? row.tournament_id,
    tournamentId: row.tournament_id ?? null,
    number: globalNumber,
    globalNumber,
    gameChampionshipNumber,
    tournamentNumber:
      row.tournament_number ?? formatGlobalTournamentNumber(globalNumber),
    championshipName,
    championshipLabel: row.game_name,
    name: championshipName,
    title: championshipName,
    slug,
    game: row.game_name,
    gameSlug: row.game_slug,
    format: row.format ?? undefined,
    matchType: row.match_type ?? undefined,
    prizePool: normalizePrizePoolDisplay(row.prize_pool_display) ?? undefined,
    status: mapDbTournamentStatus(row.status),
    completedDate: row.completed_date_label ?? undefined,
    accent: row.accent_color ?? "#a855f7",
    resultsPath: slug ? `/tournaments/${slug}` : null,
    resultsSlug: slug,
    championPlayers: parsePlayerNameList(row.champion_players),
    runnerUpPlayers: parsePlayerNameList(row.runner_up_players),
    pointsAwarded: {
      champion: row.champion_points ?? DGL_POINTS.champion,
      runnerUp: row.runner_up_points ?? DGL_POINTS.runnerUp,
      thirdPlace: DGL_POINTS.thirdPlace,
    },
    dglPoints: row.champion_points ?? DGL_POINTS.champion,
    runnerUpDglPoints: row.runner_up_points ?? DGL_POINTS.runnerUp,
  };
}

/**
 * Aggregate v_hall_of_champions rows (one row per champion player) into tournament cards.
 * @param {object[]} rows
 */
export function aggregateHallOfChampionsRows(rows) {
  /** @type {Map<string, object>} */
  const byTournament = new Map();

  for (const row of rows) {
    const key = row.tournament_id;
    let entry = byTournament.get(key);

    if (!entry) {
      entry = {
        slug: row.slug,
        tournamentNumber: row.tournament_number,
        name: row.championship_name,
        game: row.game_name,
        gameSlug: row.game_slug,
        championPlayers: [],
        prizePool: normalizePrizePoolDisplay(row.prize_pool_display),
        dglPoints: row.dgl_points ?? DGL_POINTS.champion,
        completedDate: row.completed_date_label,
        accent: row.accent_color ?? "#a855f7",
        resultsPath: row.slug ? `/tournaments/${row.slug}` : null,
        globalNumber: row.global_number ?? 0,
      };
      byTournament.set(key, entry);
    }

    if (row.player_name) {
      entry.championPlayers.push(row.player_name);
    }
  }

  return [...byTournament.values()]
    .sort((a, b) => b.globalNumber - a.globalNumber)
    .map((entry) => ({
      ...entry,
      championPlayers: sortPlayerNames(entry.championPlayers),
    }));
}

/**
 * @param {object} row - v_player_leaderboard row
 */
export function mapLeaderboardRow(row) {
  return {
    rank: row.rank,
    name: row.display_name,
    game: row.game_name ?? "—",
    gameSlug: row.game_slug ?? null,
    points: row.points,
    championships: row.championships,
    tournamentsPlayed: row.tournaments_played,
    accent: row.game_accent ?? "#a855f7",
  };
}
