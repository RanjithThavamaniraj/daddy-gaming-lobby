/** Valorant competitive rank tiers for registration forms. */
export const VALORANT_RANKS = [
  "Unranked",
  "Iron 1",
  "Iron 2",
  "Iron 3",
  "Bronze 1",
  "Bronze 2",
  "Bronze 3",
  "Silver 1",
  "Silver 2",
  "Silver 3",
  "Gold 1",
  "Gold 2",
  "Gold 3",
  "Platinum 1",
  "Platinum 2",
  "Platinum 3",
  "Diamond 1",
  "Diamond 2",
  "Diamond 3",
  "Ascendant 1",
  "Ascendant 2",
  "Ascendant 3",
  "Immortal 1",
  "Immortal 2",
  "Immortal 3",
  "Radiant",
];

/**
 * Strength index from the existing VALORANT_RANKS order (Unranked weakest,
 * Radiant strongest). Missing or unknown values return -1 so they sort
 * below Unranked without throwing.
 *
 * @param {string | null | undefined} rank
 * @returns {number}
 */
export function getValorantRankStrength(rank) {
  const value = String(rank ?? "").trim();
  if (!value) return -1;
  const index = VALORANT_RANKS.indexOf(value);
  return index === -1 ? -1 : index;
}
