/**
 * Canonical prize pool formatting — the single source every tournament
 * mapper (live Supabase + offline fallback) normalizes through, so every
 * card on every page (present and future) renders "₹X,XXX" only, regardless
 * of whatever descriptor words ("Awarded", "Team Prize", etc.) a
 * tournament's stored prize_pool_display happens to contain.
 */

/**
 * Parse a numeric INR amount from a prize pool string (e.g. "₹1,000 Awarded", "₹2,000 Team Prize").
 * @param {string | undefined} prizePool
 * @returns {number}
 */
export function parsePrizePoolAmount(prizePool) {
  const numericPrize = parseInt(String(prizePool ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isNaN(numericPrize) ? 0 : numericPrize;
}

/**
 * @param {number} amount
 * @returns {string}
 */
export function formatInrPrize(amount) {
  return amount > 0 ? `₹${amount.toLocaleString("en-IN")}` : "₹0";
}

/**
 * Strips any descriptor suffix from a stored prize pool display string,
 * leaving only the amount. Falsy input passes through unchanged so
 * downstream "TBA" fallbacks (tournaments with no prize set yet) keep working.
 * @param {string | null | undefined} prizePool
 * @returns {string | null | undefined}
 */
export function normalizePrizePoolDisplay(prizePool) {
  if (!prizePool) return prizePool;
  return formatInrPrize(parsePrizePoolAmount(prizePool));
}

/**
 * Dynamic prize-pool rule used by some DGL events:
 *   confirmed participants × ₹{prizePerConfirmed}
 * capped at registration_limit × ₹{prizePerConfirmed} (capacity).
 * Tournaments without prizePerConfirmed keep the stored prize_pool_display.
 *
 * @param {object} [input]
 * @param {string | null | undefined} [input.prizePool]
 * @param {number | string | null | undefined} [input.prizePerConfirmed]
 * @param {number | string | null | undefined} [input.confirmedCount]
 * @param {number | string | null | undefined} [input.registrationLimit]
 * @returns {number}
 */
export function derivePrizePoolAmount({
  prizePool,
  prizePerConfirmed,
  confirmedCount = 0,
  registrationLimit,
} = {}) {
  const per = Number(prizePerConfirmed);
  if (Number.isFinite(per) && per > 0) {
    const confirmed = Math.max(0, Number(confirmedCount) || 0);
    const limit = Number(registrationLimit);
    const cappedCount =
      Number.isFinite(limit) && limit > 0 ? Math.min(confirmed, limit) : confirmed;
    return cappedCount * per;
  }
  return parsePrizePoolAmount(prizePool);
}

/**
 * @param {Parameters<typeof derivePrizePoolAmount>[0]} [input]
 * @returns {string | null | undefined}
 */
export function resolvePrizePoolDisplay(input = {}) {
  const per = Number(input.prizePerConfirmed);
  if (Number.isFinite(per) && per > 0) {
    return formatInrPrize(derivePrizePoolAmount(input));
  }
  return normalizePrizePoolDisplay(input.prizePool);
}
