import { getCompletedTournaments } from "../lib/tournamentModel";
import { DGL_POINTS } from "./dglPointsConfig";

/**
 * Build Hall of Champions entries from completed tournaments.
 * Future: supabase.from("tournaments").select("*").eq("status", "Completed")
 */
export function buildHallOfChampions() {
  return [...getCompletedTournaments()]
    .sort((a, b) => b.globalNumber - a.globalNumber)
    .map((tournament) => ({
      slug: tournament.slug,
      tournamentNumber: tournament.tournamentNumber,
      name: tournament.name,
      game: tournament.game,
      gameSlug: tournament.gameSlug,
      championPlayers: tournament.championPlayers,
      runnerUpPlayers: tournament.runnerUpPlayers,
      semiFinalistPlayers: tournament.semiFinalistPlayers,
      quarterFinalistPlayers: tournament.quarterFinalistPlayers,
      groupStagePlayers: tournament.groupStagePlayers,
      prizePool: tournament.prizePool,
      dglPoints: tournament.pointsAwarded.champion,
      completedDate: tournament.completedDate,
      accent: tournament.accent,
      resultsPath: tournament.resultsPath,
    }));
}

/**
 * Tournament progression tiers, in the order every completed tournament's
 * roster fields are read. `isChampionship` mirrors the "championships" stat
 * the live v_player_leaderboard view derives from placement = 1 only.
 */
const PROGRESSION_TIERS = [
  { rosterKey: "championPlayers", pointsKey: "champion", isChampionship: true },
  { rosterKey: "runnerUpPlayers", pointsKey: "runnerUp" },
  { rosterKey: "semiFinalistPlayers", pointsKey: "semiFinalist" },
  { rosterKey: "quarterFinalistPlayers", pointsKey: "quarterFinalist" },
  { rosterKey: "groupStagePlayers", pointsKey: "groupStage" },
];

/**
 * Aggregate DGL Points leaderboard across all completed tournaments and every
 * progression tier (champion, runner-up, semi-finalist, quarter-finalist,
 * group stage) — mirrors Supabase's player_points_ledger, which sums an
 * explicit cumulative points_awarded per placement rather than just
 * champion/runner-up.
 *
 * Players are merged case-insensitively (trimmed, lowercased key), matching
 * Supabase's generated display_name_key column — the same player appearing
 * with different casing across tournaments (e.g. "Naveen kumar" vs a
 * differently-cased future entry) still accumulates into one leaderboard row.
 * The displayed name is whichever casing was seen first, same as Postgres'
 * "on conflict (display_name_key) do nothing" behavior.
 *
 * Sort: points desc → championships desc → name asc.
 * Future: supabase.from("player_points").select("*").order("points", { ascending: false })
 */
export function buildDglPointsLeaderboard() {
  const playerStats = new Map();

  for (const tournament of getCompletedTournaments()) {
    for (const tier of PROGRESSION_TIERS) {
      const roster = tournament[tier.rosterKey] ?? [];
      const points = tournament.pointsAwarded?.[tier.pointsKey] ?? DGL_POINTS[tier.pointsKey];

      for (const name of roster) {
        const key = name.trim().toLowerCase();
        const existing = playerStats.get(key) ?? {
          name,
          game: tournament.game,
          points: 0,
          championships: 0,
          tournamentsPlayed: 0,
          accent: tournament.accent,
        };
        existing.points += points;
        if (tier.isChampionship) existing.championships += 1;
        existing.tournamentsPlayed += 1;
        existing.game = tournament.game;
        existing.accent = tournament.accent;
        playerStats.set(key, existing);
      }
    }
  }

  return [...playerStats.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.championships - a.championships ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    )
    .map((player, index) => ({ rank: index + 1, ...player }));
}

export const hallOfChampions = buildHallOfChampions();
export const dglPointsLeaderboard = buildDglPointsLeaderboard();
