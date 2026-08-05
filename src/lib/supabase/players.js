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
  const { data: profiles } = await supabase
    .from("player_game_profiles")
    .select("platform")
    .eq("player_id", player.id)
    .not("platform", "is", null)
    .limit(1);
  if (profiles?.[0]?.platform) {
    platform = formatPlatformLabel(profiles[0].platform);
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
  };
}
