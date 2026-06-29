import { HOME_FEATURED_GAME_IDS, HOME_GAME_TAGLINES } from "../homeModel";

/** @type {Record<string, string>} */
const GAME_STATUS_LABELS = {
  available: "Available",
  coming_soon: "Coming Soon",
  planned: "Planned",
  archived: "Archived",
};

/**
 * @param {object} row - games table row
 */
export function mapDashboardGameRow(row) {
  return {
    id: row.slug,
    name: row.name,
    category: row.category,
    accent: row.accent_color,
    glow: row.glow_color,
  };
}

/**
 * @param {object} row - games table row
 */
export function mapFeaturedGameRow(row) {
  const statusKey = row.status === "coming_soon" ? "coming-soon" : row.status;

  return {
    id: row.slug,
    name: row.name,
    category: row.category,
    accent: row.accent_color,
    glow: row.glow_color,
    tagline: HOME_GAME_TAGLINES[row.slug] ?? row.category ?? "",
    status: statusKey,
    statusLabel: GAME_STATUS_LABELS[row.status] ?? "Planned",
  };
}

/**
 * @param {object[]} rows
 */
export function mapFeaturedGamesList(rows) {
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  return HOME_FEATURED_GAME_IDS.map((slug) => {
    const row = bySlug.get(slug);
    return row ? mapFeaturedGameRow(row) : null;
  }).filter(Boolean);
}
