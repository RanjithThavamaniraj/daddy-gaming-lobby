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

/**
 * Resolves Main Event vs Completed archive for the tournaments hub.
 * Future: replace inputs with supabase.from("tournaments").select("*")
 */
export function getTournamentsPageLayout({
  featured = featuredTournament,
  upcoming = upcomingTournaments,
  completed = completedTournaments,
} = {}) {
  const hasMultipleCompleted = completed.length >= 2;

  if (!hasMultipleCompleted) {
    return {
      mainEvent: featured,
      upcomingDisplay: upcoming,
      showCompletedArchive: false,
      archivedCompleted: [],
    };
  }

  const [mainEventCandidate, ...remainingUpcoming] = upcoming;
  const mainEvent = mainEventCandidate
    ? toFeaturedShape(mainEventCandidate)
    : featured;

  return {
    mainEvent,
    upcomingDisplay: remainingUpcoming,
    showCompletedArchive: true,
    archivedCompleted: completed,
  };
}

function toFeaturedShape(tournament) {
  return {
    id: tournament.id,
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
  };
}
