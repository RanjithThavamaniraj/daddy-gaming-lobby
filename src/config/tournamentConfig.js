/**
 * Tournaments hub display data — derived from the central registry.
 * Future: replace with supabase.from("tournaments").select("*")
 */

import {
  getCompletedTournaments,
  getUpcomingTournaments,
  toCompletedCardShape,
  toFeaturedShape,
} from "../lib/tournamentModel";

const completed = getCompletedTournaments();
const upcoming = getUpcomingTournaments();

/** Main Event when a single completed tournament is featured */
export const featuredTournament = completed.length
  ? toFeaturedShape(completed[0])
  : upcoming.length
    ? toFeaturedShape(upcoming[0])
    : null;

export const upcomingTournaments = upcoming.map((t) => ({
  id: t.id,
  title: t.title,
  game: t.game,
  gameSlug: t.gameSlug,
  status: t.status,
  accent: t.accent,
}));

export const completedTournaments = completed.map(toCompletedCardShape);

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
  upcoming: upcomingList = upcomingTournaments,
  completed: completedList = completedTournaments,
} = {}) {
  const hasMultipleCompleted = completedList.length >= 2;

  if (!hasMultipleCompleted) {
    return {
      mainEvent: featured,
      upcomingDisplay: upcomingList,
      showCompletedArchive: false,
      archivedCompleted: [],
    };
  }

  const [mainEventCandidate, ...remainingUpcoming] = upcomingList;
  const mainEvent = mainEventCandidate
    ? toFeaturedShape(
        getUpcomingTournaments().find((t) => t.id === mainEventCandidate.id) ??
          mainEventCandidate
      )
    : featured;

  return {
    mainEvent,
    upcomingDisplay: remainingUpcoming,
    showCompletedArchive: true,
    archivedCompleted: completedList,
  };
}

export { toFeaturedShape };
