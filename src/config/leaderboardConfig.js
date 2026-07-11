import { getCompletedTournaments } from "../lib/tournamentModel";
import { DGL_POINTS } from "./dglPointsConfig";

/**
 * Build Hall of Champions entries from completed tournaments.
 * Future: supabase.from("tournaments").select("*").eq("status", "Completed")
 */
export function buildHallOfChampions() {
  return getCompletedTournaments().map((tournament) => ({
    slug: tournament.slug,
    tournamentNumber: tournament.tournamentNumber,
    name: tournament.name,
    game: tournament.game,
    gameSlug: tournament.gameSlug,
    championPlayers: tournament.championPlayers,
    prizePool: tournament.prizePool,
    dglPoints: tournament.pointsAwarded.champion,
    completedDate: tournament.completedDate,
    accent: tournament.accent,
    resultsPath: tournament.resultsPath,
  }));
}

/**
 * Aggregate DGL Points leaderboard across all completed tournaments.
 * Sort: points desc → championships desc → name asc.
 * Future: supabase.from("player_points").select("*").order("points", { ascending: false })
 */
export function buildDglPointsLeaderboard() {
  const playerStats = new Map();

  for (const tournament of getCompletedTournaments()) {
    for (const name of tournament.championPlayers) {
      const existing = playerStats.get(name) ?? {
        name,
        game: tournament.game,
        points: 0,
        championships: 0,
        tournamentsPlayed: 0,
        accent: tournament.accent,
      };
      const championPoints = tournament.pointsAwarded?.champion ?? DGL_POINTS.champion;
      existing.points += championPoints;
      existing.championships += 1;
      existing.tournamentsPlayed += 1;
      existing.game = tournament.game;
      existing.accent = tournament.accent;
      playerStats.set(name, existing);
    }

    for (const name of tournament.runnerUpPlayers) {
      const existing = playerStats.get(name) ?? {
        name,
        game: tournament.game,
        points: 0,
        championships: 0,
        tournamentsPlayed: 0,
        accent: tournament.accent,
      };
      const runnerUpPoints = tournament.pointsAwarded?.runnerUp ?? DGL_POINTS.runnerUp;
      existing.points += runnerUpPoints;
      existing.tournamentsPlayed += 1;
      existing.game = tournament.game;
      existing.accent = tournament.accent;
      playerStats.set(name, existing);
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
