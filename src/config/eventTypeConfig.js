/**
 * DGL's two permanent event series:
 *   - DGL Signature      → prize / premium tournaments (event_type championship)
 *   - DGL Saturday Showdown → free community tournaments
 */
export const EVENT_TYPES = {
  championship: {
    id: "championship",
    label: "DGL Signature",
    badge: "🏆 DGL Signature",
    // Title already includes "DGL Signature — …"; hero cards keep status badge only.
    heroBadge: null,
  },
  saturday_showdown: {
    id: "saturday_showdown",
    label: "DGL Saturday Showdown",
    badge: "⚡ DGL Saturday Showdown",
    heroBadge: "⚡ DGL Saturday Showdown",
    /** Burnt orange / black / white / gold — distinct from per-game Signature accents. */
    accent: "#c2410c",
    goldAccent: "#f5b400",
  },
};

/** @param {string | null | undefined} eventType */
export function isSaturdayShowdown(eventType) {
  return eventType === "saturday_showdown";
}

/**
 * Public series label for branding (DGL Signature vs DGL Saturday Showdown).
 * @param {string | null | undefined} eventType
 * @returns {string}
 */
export function getSeriesLabel(eventType) {
  if (isSaturdayShowdown(eventType)) {
    return EVENT_TYPES.saturday_showdown.label;
  }
  return EVENT_TYPES.championship.label;
}

/**
 * Resolves the card accent color: Saturday Showdown always gets its own
 * burnt-orange identity regardless of game; Signature keeps whatever
 * per-game/per-tournament accent it already had.
 * @param {string | null | undefined} eventType
 * @param {string | undefined} fallbackAccent
 */
export function resolveEventAccent(eventType, fallbackAccent) {
  return isSaturdayShowdown(eventType)
    ? EVENT_TYPES.saturday_showdown.accent
    : fallbackAccent;
}
