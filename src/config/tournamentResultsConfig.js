/**
 * Completed tournament results data.
 * Future: supabase.from("tournaments").select("*, champion_players(*), runner_up_players(*)")
 */

export const valorantChampionship1Results = {
  slug: "valorant-1",
  name: "DGL Valorant Championship #1",
  tournamentNumber: "Tournament #1",
  game: "Valorant",
  gameSlug: "valorant",
  format: "5v5",
  matchType: "Best of 3",
  status: "Completed",
  completedDate: "June 27, 2026",
  prizePool: "₹1,000 Awarded",
  dglPoints: 50,
  accent: "#ff4655",
  championTeam: null,
  championPlayers: [
    "Girish",
    "Bumble_Bee",
    "cl_me_Brian",
    "Mrbean",
    "Victor",
  ],
  runnerUpPlayers: [
    "5am0anth0r",
    "Diddstein",
    "mike_",
    "St0rm",
    "Thelonewolf",
  ],
};

/** @type {Record<string, typeof valorantChampionship1Results>} */
export const tournamentResultsBySlug = {
  "valorant-1": valorantChampionship1Results,
};

export function getTournamentResults(slug) {
  return tournamentResultsBySlug[slug] ?? null;
}

export function getAllTournamentResultsSlugs() {
  return Object.keys(tournamentResultsBySlug);
}
