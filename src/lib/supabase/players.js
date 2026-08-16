/**
 * Player profile reads for /players/{slug}.
 */

import { getSupabaseClient } from "../../supabase";
import { formatPlatformLabel } from "./registrations";

/**
 * @param {string} slug
 * @returns {Promise<{
 *   displayName: string;
 *   slug: string;
 *   points: number;
 *   rank: number | null;
 *   tournamentsPlayed: number;
 *   platform: string;
 *   joinedAt: string | null;
 *   isNewPlayer: boolean;
 *   gameRanks: Array<{ gameName: string; gameSlug: string | null; rank: string }>;
 * } | null>}
 */
export async function fetchPlayerBySlug(slug) {
  if (!slug) return null;
  const supabase = getSupabaseClient();

  const { data: player, error } = await supabase
    .from("players")
    .select(
      `
      id,
      display_name,
      discord_username,
      slug,
      created_at,
      points_summary:player_points_summary (
        total_points,
        tournaments_played
      )
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!player) return null;

  const summary = Array.isArray(player.points_summary)
    ? player.points_summary[0]
    : player.points_summary;

  const points = Number(summary?.total_points ?? 0);
  const tournamentsPlayed = Number(summary?.tournaments_played ?? 0);

  let rank = null;
  const { data: lb } = await supabase
    .from("v_player_leaderboard")
    .select("rank")
    .eq("player_id", player.id)
    .maybeSingle();
  if (lb?.rank != null) rank = lb.rank;

  let platform = "Not Specified";
  /** @type {Array<{ gameName: string; gameSlug: string | null; rank: string }>} */
  const gameRanks = [];
  const { data: profiles } = await supabase
    .from("player_game_profiles")
    .select("rank_tier, platform, games(name, slug)")
    .eq("player_id", player.id);
  for (const row of profiles ?? []) {
    if (row.platform && platform === "Not Specified") {
      platform = formatPlatformLabel(row.platform);
    }
    const rankTier = row.rank_tier != null ? String(row.rank_tier).trim() : "";
    if (!rankTier) continue;
    const game = Array.isArray(row.games) ? row.games[0] : row.games;
    gameRanks.push({
      gameName: game?.name ?? "Game",
      gameSlug: game?.slug ?? null,
      rank: rankTier,
    });
  }

  return {
    displayName: player.discord_username || player.display_name || "Player",
    slug: player.slug,
    points,
    rank,
    tournamentsPlayed,
    platform,
    joinedAt: player.created_at ?? null,
    isNewPlayer: points === 0 && tournamentsPlayed === 0,
    gameRanks,
  };
}
