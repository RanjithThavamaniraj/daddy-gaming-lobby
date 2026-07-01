/**
 * Browser-session duplicate-registration guard.
 *
 * Marks a tournament as registered within the current browser session only
 * (sessionStorage — cleared when the tab/window closes), so revisiting the
 * tournament page or hub shows the "Registered" state without hitting
 * Supabase again, while still allowing a fresh registration next session.
 */

const PREFIX = "dgl:registration:";

/**
 * @param {string} tournamentId
 * @returns {boolean}
 */
export function isRegisteredForTournament(tournamentId) {
  if (!tournamentId) return false;
  try {
    return sessionStorage.getItem(`${PREFIX}${tournamentId}`) === "1";
  } catch {
    return false;
  }
}

/**
 * @param {string} tournamentId
 * @returns {void}
 */
export function markRegisteredForTournament(tournamentId) {
  if (!tournamentId) return;
  try {
    sessionStorage.setItem(`${PREFIX}${tournamentId}`, "1");
  } catch {
    /* sessionStorage unavailable — ignore */
  }
}