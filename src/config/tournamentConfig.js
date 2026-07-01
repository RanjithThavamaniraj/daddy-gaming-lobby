/**
 * Tournaments hub display data — derived from the central registry.
 * Future: replace with supabase.from("tournaments").select("*")
 */

import {
  getCompletedTournaments,
  getUpcomingTournaments,
  selectFeaturedTournament,
  toCompletedCardShape,
  toFeaturedShape,
  toUpcomingCardShape,
} from "../lib/tournamentModel";

const completed = getCompletedTournaments();
const upcoming = getUpcomingTournaments();
const all = [...completed, ...upcoming];

/** Main Event — highest priority tournament (Live > Open > Upcoming > Completed) */
export const featuredTournament = (() => {
  const featured = selectFeaturedTournament(all);
  return featured ? toFeaturedShape(featured) : null;
})();

export const upcomingTournaments = upcoming.map(toUpcomingCardShape);

export const completedTournaments = completed.map(toCompletedCardShape);

/**
 * Resolves Main Event vs Upcoming vs Completed archive for the tournaments hub.
 * The featured tournament is never duplicated across sections.
 * Future: replace inputs with supabase.from("tournaments").select("*")
 */
export function getTournamentsPageLayout({
  featured = featuredTournament,
  upcoming: upcomingList = upcomingTournaments,
  completed: completedList = completedTournaments,
} = {}) {
  const featuredId = featured?.id ?? null;

  const upcomingDisplay = upcomingList.filter((t) => t.id !== featuredId);
  const archivedCompleted = completedList.filter((t) => t.id !== featuredId);

  return {
    mainEvent: featured,
    upcomingDisplay,
    showCompletedArchive: archivedCompleted.length > 0,
    archivedCompleted,
  };
}

export { toFeaturedShape };