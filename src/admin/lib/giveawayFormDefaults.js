/**
 * UI-only helpers for GiveawayForm field state.
 * Validation and persistence live in giveawayRepository.
 */

/** @typedef {{
 *   title: string,
 *   reason: string,
 *   description: string,
 *   prize: string,
 *   rules: string,
 *   eligibleTournamentIds: string[],
 *   entriesCloseAt: string,
 *   drawAt: string,
 *   winnerNotes: string,
 * }} GiveawayFormValues */

/**
 * @returns {GiveawayFormValues}
 */
export function createEmptyGiveawayFormValues() {
  return {
    title: "",
    reason: "",
    description: "",
    prize: "",
    rules: "",
    eligibleTournamentIds: [],
    entriesCloseAt: "",
    drawAt: "",
    winnerNotes: "",
  };
}

/**
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
