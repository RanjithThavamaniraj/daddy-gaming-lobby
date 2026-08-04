import { DGL_GAMES } from "../../config/dglGamesConfig";
import { HOME_FEATURED_GAME_IDS, HOME_GAME_TAGLINES } from "../homeModel";

/** Frontend-supported game lineup (excludes titles removed from DGL listings). */
const SUPPORTED_GAME_IDS = new Set(DGL_GAMES.map((game) => game.id));

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
    status: "available",
    statusLabel: "Active",
  };
}

/**
 * @param {object[]} rows
 */
export function mapDashboardGamesList(rows) {
  return (rows ?? [])
    .map(mapDashboardGameRow)
    .filter((game) => SUPPORTED_GAME_IDS.has(game.id));
}

/**
 * @param {object} row - games table row
 */
export function mapFeaturedGameRow(row) {
  return {
    id: row.slug,
    name: row.name,
    category: row.category,
    accent: row.accent_color,
    glow: row.glow_color,
    tagline: HOME_GAME_TAGLINES[row.slug] ?? row.category ?? "",
    status: "available",
    statusLabel: "Active",
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
