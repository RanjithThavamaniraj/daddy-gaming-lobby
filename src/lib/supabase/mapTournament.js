import { DGL_POINTS_CUMULATIVE } from "../../config/dglPointsConfig";
import {
  formatChampionshipName,
  formatGlobalTournamentNumber,
  sortPlayerNames,
} from "../tournamentModel";
import { normalizePrizePoolDisplay } from "../prizePool";
import {
  getSeriesLabel,
  resolveEventAccent,
} from "../../config/eventTypeConfig";
import { applyLifecycleStatus } from "../tournamentLifecycle";

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
  const eventType = row.event_type ?? "championship";
  const championshipName =
    row.championship_name ??
    formatChampionshipName(championshipLabel, gameChampionshipNumber, eventType);
  const slug = row.slug ?? null;

  const championPlayers = parsePlayerNameList(
    resultsRow?.champion_players ?? row.champion_players
  );
  const runnerUpPlayers = parsePlayerNameList(
    resultsRow?.runner_up_players ?? row.runner_up_players
  );
  const semiFinalistPlayers = parsePlayerNameList(resultsRow?.semi_finalist_players);
  const quarterFinalistPlayers = parsePlayerNameList(resultsRow?.quarter_finalist_players);
  const groupStagePlayers = parsePlayerNameList(resultsRow?.group_stage_players);

  return applyLifecycleStatus({
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
    subtitle: row.metadata?.subtitle ?? undefined,
    teamLimit: row.metadata?.team_limit ?? undefined,
    matchDuration: row.metadata?.match_duration ?? undefined,
    overtimeRule: row.metadata?.overtime_rule ?? undefined,
    dbStatus: row.status,
    status: mapDbTournamentStatus(row.status),
    completedDate: row.completed_date_label ?? undefined,
    completedAt: row.completed_at ?? null,
    isFeatured: row.is_featured ?? false,
    eventType,
    seriesLabel: getSeriesLabel(eventType),
    accent: resolveEventAccent(eventType, row.accent_color ?? row.game_accent ?? "#a855f7"),
    registrationLimit: row.registration_limit ?? undefined,
    registeredCount:
      row.confirmed_count ?? row.registered_count ?? undefined,
    confirmedCount: row.confirmed_count ?? row.registered_count ?? undefined,
    reserveCount: row.waitlist_count ?? 0,
    reserveLimit: row.reserve_limit ?? 4,
    registrationOpensAt: row.registration_opens_at ?? undefined,
    registrationClosesAt: row.registration_closes_at ?? undefined,
    startsAt: row.starts_at ?? undefined,
    resultsPath: slug ? `/tournaments/${slug}` : null,
    resultsSlug: slug,
    championPlayers,
    runnerUpPlayers,
    semiFinalistPlayers,
    quarterFinalistPlayers,
    groupStagePlayers,
    pointsAwarded: {
      champion:
        resultsRow?.champion_points ??
        row.champion_points ??
        DGL_POINTS_CUMULATIVE.champion,
      runnerUp:
        resultsRow?.runner_up_points ??
        row.runner_up_points ??
        DGL_POINTS_CUMULATIVE.runnerUp,
      semiFinalist:
        resultsRow?.semi_finalist_points ?? DGL_POINTS_CUMULATIVE.semiFinalist,
      quarterFinalist:
        resultsRow?.quarter_finalist_points ?? DGL_POINTS_CUMULATIVE.quarterFinalist,
      groupStage: resultsRow?.group_stage_points ?? DGL_POINTS_CUMULATIVE.groupStage,
      thirdPlace: DGL_POINTS_CUMULATIVE.thirdPlace,
    },
    dglPoints:
      resultsRow?.champion_points ??
      row.champion_points ??
      DGL_POINTS_CUMULATIVE.champion,
    runnerUpDglPoints:
      resultsRow?.runner_up_points ??
      row.runner_up_points ??
      DGL_POINTS_CUMULATIVE.runnerUp,
  });
}

/**
 * @param {object} row - v_tournament_results row
 */
export function mapTournamentResultsRow(row) {
  const globalNumber = parseGlobalNumberFromLabel(row.tournament_number);
  const slug = row.slug ?? null;
  const championshipName = row.championship_name ?? "";
  const eventType = row.event_type ?? "championship";

  const championshipMatch = championshipName.match(/#(\d+)\s*$/);
  const gameChampionshipNumber = championshipMatch
    ? Number.parseInt(championshipMatch[1], 10)
    : 1;

  return applyLifecycleStatus({
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
    dbStatus: row.status,
    status: mapDbTournamentStatus(row.status),
    completedDate: row.completed_date_label ?? undefined,
    completedAt: row.completed_at ?? null,
    eventType,
    seriesLabel: getSeriesLabel(eventType),
    accent: resolveEventAccent(eventType, row.accent_color ?? "#a855f7"),
    resultsPath: slug ? `/tournaments/${slug}` : null,
    resultsSlug: slug,
    championPlayers: parsePlayerNameList(row.champion_players),
    runnerUpPlayers: parsePlayerNameList(row.runner_up_players),
    semiFinalistPlayers: parsePlayerNameList(row.semi_finalist_players),
    quarterFinalistPlayers: parsePlayerNameList(row.quarter_finalist_players),
    groupStagePlayers: parsePlayerNameList(row.group_stage_players),
    pointsAwarded: {
      champion: row.champion_points ?? DGL_POINTS_CUMULATIVE.champion,
      runnerUp: row.runner_up_points ?? DGL_POINTS_CUMULATIVE.runnerUp,
      semiFinalist: row.semi_finalist_points ?? DGL_POINTS_CUMULATIVE.semiFinalist,
      quarterFinalist:
        row.quarter_finalist_points ?? DGL_POINTS_CUMULATIVE.quarterFinalist,
      groupStage: row.group_stage_points ?? DGL_POINTS_CUMULATIVE.groupStage,
      thirdPlace: DGL_POINTS_CUMULATIVE.thirdPlace,
    },
    dglPoints: row.champion_points ?? DGL_POINTS_CUMULATIVE.champion,
    runnerUpDglPoints: row.runner_up_points ?? DGL_POINTS_CUMULATIVE.runnerUp,
  });
}

/**
 * @param {object} row - v_player_leaderboard row
 */
export function mapLeaderboardRow(row) {
  return {
    rank: row.rank,
    name: row.display_name,
    slug: row.slug ?? null,
    game: row.game_name ?? "—",
    gameSlug: row.game_slug ?? null,
    points: row.points,
    championships: row.championships,
    tournamentsPlayed: row.tournaments_played,
    accent: row.game_accent ?? "#a855f7",
  };
}
