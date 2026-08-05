/**
 * UI-only helpers for TournamentForm field state.
 * Validation and persistence live in tournamentRepository.
 */

/** @typedef {{
 *   championshipLabel: string,
 *   gameId: string,
 *   seriesId: string,
 *   externalId: string,
 *   slug: string,
 *   participationMode: 'solo' | 'team',
 *   format: string,
 *   matchType: string,
 *   prizePoolDisplay: string,
 *   prizePoolAmount: string,
 *   accentColor: string,
 *   registrationLimit: string,
 *   registrationOpensAt: string,
 *   registrationClosesAt: string,
 *   startsAt: string,
 *   entryFee: string,
 * }} TournamentFormValues */

/**
 * @returns {TournamentFormValues}
 */
export function createEmptyTournamentFormValues() {
  return {
    championshipLabel: "",
    gameId: "",
    seriesId: "",
    externalId: "",
    slug: "",
    participationMode: "team",
    format: "",
    matchType: "",
    prizePoolDisplay: "",
    prizePoolAmount: "",
    accentColor: "",
    registrationLimit: "",
    registrationOpensAt: "",
    registrationClosesAt: "",
    startsAt: "",
    reserveLimit: "4",
    entryFee: "",
  };
}

/**
 * Convert DB timestamptz → datetime-local value.
 * @param {string | null | undefined} iso
 * @returns {string}
 */
export function isoToDateTimeLocal(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * @param {string} local
 * @returns {string | null}
 */
export function dateTimeLocalToIso(local) {
  if (!local || !String(local).trim()) return null;
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
