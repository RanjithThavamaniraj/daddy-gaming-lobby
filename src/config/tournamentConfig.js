/**
 * Tournaments hub display data — derived from the central registry.
 * Future: replace with supabase.from("tournaments").select("*")
 */

import {
  countRegistrationOpenTournaments,
  getCompletedTournaments,
  getUpcomingTournaments,
  selectFeaturedTournament,
  selectNextTournament,
  toCompletedCardShape,
  toFeaturedShape,
  toUpcomingCardShape,
} from "../lib/tournamentModel";

const completed = getCompletedTournaments();
const upcoming = getUpcomingTournaments();
const all = [...completed, ...upcoming];

const featuredRaw = selectFeaturedTournament(all);
const nextRaw = selectNextTournament(all, featuredRaw);

/** Main Event — highest priority tournament (Live > Open > Upcoming > Completed) */
export const featuredTournament = featuredRaw ? toFeaturedShape(featuredRaw) : null;

/** Next Tournament — highest priority tournament once the Main Event is excluded */
export const nextTournament = nextRaw ? toFeaturedShape(nextRaw) : null;

export const upcomingTournaments = upcoming.map(toUpcomingCardShape);

export const completedTournaments = completed.map(toCompletedCardShape);

/**
 * Resolves Main Event vs Next Tournament vs Upcoming vs Completed archive
 * for the tournaments hub. Neither the featured nor the next tournament is
 * ever duplicated into the plain upcoming grid.
 * Future: replace inputs with supabase.from("tournaments").select("*")
 */
export function getTournamentsPageLayout({
  featured = featuredTournament,
  next = nextTournament,
  upcoming: upcomingList = upcomingTournaments,
  completed: completedList = completedTournaments,
  openRegistrationCount = countRegistrationOpenTournaments(all),
} = {}) {
  const featuredId = featured?.id ?? null;
  const nextId = next?.id ?? null;

  const upcomingDisplay = upcomingList.filter(
    (t) => t.id !== featuredId && t.id !== nextId
  );
  const archivedCompleted = completedList.filter((t) => t.id !== featuredId);

  return {
    mainEvent: featured,
    nextTournament: next,
    upcomingDisplay,
    showCompletedArchive: archivedCompleted.length > 0,
    archivedCompleted,
    openRegistrationCount,
  };
}

export { toFeaturedShape };