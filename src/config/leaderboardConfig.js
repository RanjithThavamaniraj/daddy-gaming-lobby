import { tournamentResultsBySlug } from "./tournamentResultsConfig";

/**
 * Build Hall of Champions entries from completed tournament results.
 * Future: supabase.from("tournaments").select("*").eq("status", "Completed")
 */
export function buildHallOfChampions() {
  return Object.values(tournamentResultsBySlug).map((tournament) => ({
    slug: tournament.slug,
    tournamentNumber: tournament.tournamentNumber,
    name: tournament.name,
    game: tournament.game,
    gameSlug: tournament.gameSlug,
    championPlayers: tournament.championPlayers,
    prizePool: tournament.prizePool,
    dglPoints: tournament.dglPoints,
    completedDate: tournament.completedDate,
    accent: tournament.accent,
    resultsPath: `/tournaments/${tournament.slug}`,
  }));
}

/**
 * Aggregate DGL Points leaderboard across all completed tournaments.
 * Future: supabase.from("player_stats").select("*").order("dgl_points", { ascending: false })
 */
export function buildDglPointsLeaderboard() {
  const playerStats = new Map();
  const orderIndex = new Map();
  let order = 0;

  for (const tournament of Object.values(tournamentResultsBySlug)) {
    for (const name of tournament.championPlayers) {
      if (!orderIndex.has(name)) orderIndex.set(name, order++);
      const existing = playerStats.get(name) ?? {
        name,
        game: tournament.game,
        points: 0,
        championships: 0,
        tournamentsPlayed: 0,
        accent: tournament.accent,
      };
      existing.points += tournament.dglPoints;
      existing.championships += 1;
      existing.tournamentsPlayed += 1;
      existing.game = tournament.game;
      existing.accent = tournament.accent;
      playerStats.set(name, existing);
    }

    for (const name of tournament.runnerUpPlayers) {
      if (!orderIndex.has(name)) orderIndex.set(name, order++);
      const existing = playerStats.get(name) ?? {
        name,
        game: tournament.game,
        points: 0,
        championships: 0,
        tournamentsPlayed: 0,
        accent: tournament.accent,
      };
      existing.tournamentsPlayed += 1;
      existing.game = tournament.game;
      playerStats.set(name, existing);
    }
  }

  return [...playerStats.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.championships - a.championships ||
        orderIndex.get(a.name) - orderIndex.get(b.name)
    )
    .map((player, index) => ({ rank: index + 1, ...player }));
}

export const hallOfChampions = buildHallOfChampions();
export const dglPointsLeaderboard = buildDglPointsLeaderboard();
