/**
 * Central tournament data for the DGL esports hub.
 * Future: replace static exports with supabase.from("tournaments").select("*")
 */

export const featuredTournament = {
  id: "dgl-valorant-championship-1",
  title: "DGL Valorant Championship #1",
  game: "Valorant",
  gameSlug: "valorant",
  format: "5v5",
  matchType: "Best of 3",
  prizePool: "₹1,000 Awarded",
  status: "Completed",
  completedDate: "June 27, 2026",
  accent: "#ff4655",
  resultsPath: "/tournaments/valorant-1",
  resultsSlug: "valorant-1",
};

export const upcomingTournaments = [
  {
    id: "dgl-cs2-championship-1",
    title: "DGL CS2 Championship #1",
    game: "CS2",
    gameSlug: "cs2",
    status: "Coming Soon",
    accent: "#de9b35",
  },
];

export const completedTournaments = [
  {
    id: "dgl-valorant-championship-1",
    title: "DGL Valorant Championship #1",
    game: "Valorant",
    gameSlug: "valorant",
    completedDate: "June 27, 2026",
    champion: null,
    championPlaceholder: "To be updated",
    prizePool: "₹1,000 Awarded",
    accent: "#ff4655",
    resultsPath: "/tournaments/valorant-1",
    resultsSlug: "valorant-1",
  },
];

/** @deprecated Use featuredTournament, upcomingTournaments, completedTournaments */
export const activeTournamentFallback = featuredTournament;

/** @deprecated Use completedTournaments */
export const pastChampions = [];
