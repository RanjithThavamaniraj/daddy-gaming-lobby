/**
 * DGL's two permanent event series. Championship is the default/unmarked
 * case everywhere in the app (existing per-game accent colors, existing
 * "Prize Pool" wording, etc. all stay exactly as they were). Saturday
 * Showdown is the only branch that needs special-casing.
 */
export const EVENT_TYPES = {
  championship: {
    id: "championship",
    label: "Championship",
    badge: "🏆 Championship",
    heroBadge: null, // Championships don't get an extra event-type badge — status badge alone is enough, unchanged from before this feature.
  },
  saturday_showdown: {
    id: "saturday_showdown",
    label: "Saturday Showdown",
    badge: "⚡ Saturday Showdown",
    heroBadge: "⚡ Saturday Showdown",
    /** Burnt orange / black / white / gold — distinct from every game's own Championship accent. */
    accent: "#c2410c",
    goldAccent: "#f5b400",
  },
};

/** @param {string | null | undefined} eventType */
export function isSaturdayShowdown(eventType) {
  return eventType === "saturday_showdown";
}

/**
 * Public series label for branding (Championship vs Saturday Showdown).
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
 * burnt-orange identity regardless of game; Championship keeps whatever
 * per-game/per-tournament accent it already had.
 * @param {string | null | undefined} eventType
 * @param {string | undefined} fallbackAccent
 */
export function resolveEventAccent(eventType, fallbackAccent) {
  return isSaturdayShowdown(eventType)
    ? EVENT_TYPES.saturday_showdown.accent
    : fallbackAccent;
}
