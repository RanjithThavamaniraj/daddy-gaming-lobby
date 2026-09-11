/**
 * Tournaments hub display data — derived from the central registry.
 * Future: replace with supabase.from("tournaments").select("*")
 */

import {
  countActiveTournaments,
  getCompletedTournaments,
  getUpcomingTournaments,
  selectFeaturedTournament,
  toCompletedCardShape,
  toFeaturedShape,
  toUpcomingCardShape,
  compareTournamentsByStartDate,
  compareTournamentsByCompletedDateDesc,
} from "../lib/tournamentModel";
import { selectNextScheduledTournament } from "../lib/nextScheduledTournament";

const completed = getCompletedTournaments();
const upcoming = getUpcomingTournaments();
const all = [...completed, ...upcoming];

const featuredRaw = selectFeaturedTournament(all);
const nextRaw = selectNextScheduledTournament(all, {
  excludeId: featuredRaw?.id ?? null,
});

/** Main Event — highest priority tournament (Live > Open > Upcoming > Completed) */
export const featuredTournament = featuredRaw ? toFeaturedShape(featuredRaw) : null;

/** Next Tournament — latest active open/live event after the Main Event */
export const nextTournament = nextRaw ? toFeaturedShape(nextRaw) : null;

export const upcomingTournaments = upcoming.map(toUpcomingCardShape);

export const completedTournaments = completed.map(toCompletedCardShape);

/**
 * Resolves Main Event vs Next Tournament vs Upcoming vs Completed archive
 * for the tournaments hub. Neither the featured nor the next tournament is
 * ever duplicated into the plain upcoming grid.
 * Upcoming list is ordered by tournament start date.
 * Archived/historical events stay in the database and hub-by-slug fallback,
 * but are never listed on the public tournaments page.
 */
export function getTournamentsPageLayout({
  featured = featuredTournament,
  next = nextTournament,
  upcoming: upcomingList = upcomingTournaments,
  completed: completedList = completedTournaments,
  activeTournamentCount = countActiveTournaments(all),
  openRegistrationCount = activeTournamentCount,
} = {}) {
  const featuredId = featured?.id ?? null;
  const nextId = next?.id ?? null;

  const upcomingDisplay = upcomingList
    .filter((t) => t.id !== featuredId && t.id !== nextId)
    .sort(compareTournamentsByStartDate);
  const archivedCompleted = completedList
    .filter((t) => t.id !== featuredId)
    .sort(compareTournamentsByCompletedDateDesc);

  return {
    mainEvent: featured,
    nextTournament: next,
    upcomingDisplay,
    showCompletedArchive: archivedCompleted.length > 0,
    archivedCompleted,
    activeTournamentCount,
    openRegistrationCount,
  };
}

export { toFeaturedShape };