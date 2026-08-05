/**
 * Registration flow for individual players.
 *
 * Stores registrations against the existing `tournament_registrations` table
 * (migration 20260628100003). Player identity lives in `players`.
 * Points summary is bootstrapped via dgl_ensure_player_points_summary (0 points).
 */

import { getSupabaseClient } from "../../supabase";

const PLATFORM_LABELS = {
  ps5: "PS5",
  playstation: "PS5",
  "playstation 5": "PS5",
  pc: "PC",
  xbox: "Xbox",
  "xbox series": "Xbox",
  "xbox series x": "Xbox",
  "xbox series s": "Xbox",
};

/**
 * @param {unknown} value
 * @returns {string}
 */
export function formatPlatformLabel(value) {
  if (value == null || value === "") return "Not Specified";
  const key = String(value).trim().toLowerCase();
  if (!key) return "Not Specified";
  return PLATFORM_LABELS[key] ?? String(value).trim();
}

/**
 * Resolve or create a `players` row for a Discord username.
 * Display names are case-insensitively unique (players.display_name_key).
 *
 * @param {string} discordUsername
 * @returns {Promise<{ id: string; slug: string | null; isNew: boolean }>}
 */
async function resolveOrCreatePlayer(discordUsername) {
  const supabase = getSupabaseClient();
  const trimmed = discordUsername.trim();
  const key = trimmed.toLowerCase();

  const { data: existing, error: selectError } = await supabase
    .from("players")
    .select("id, slug")
    .eq("display_name_key", key)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return { id: existing.id, slug: existing.slug ?? null, isNew: false };

  const { data: created, error: insertError } = await supabase
    .from("players")
    .insert({ display_name: trimmed, discord_username: trimmed })
    .select("id, slug")
    .single();

  if (insertError) throw insertError;
  return { id: created.id, slug: created.slug ?? null, isNew: true };
}

/**
 * Ensure a zeroed player_points_summary row exists (tournaments_played stays 0).
 * @param {string} playerId
 */
async function ensurePlayerPointsSummary(playerId) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("dgl_ensure_player_points_summary", {
    p_player_id: playerId,
  });
  // RPC may not exist until migration is applied — don't fail registration.
  if (error) {
    console.warn("dgl_ensure_player_points_summary:", error.message);
  }
}

/**
 * Register an individual player for a tournament.
 *
 * @param {object} params
 * @param {string} params.tournamentId - Tournament UUID (tournaments.id)
 * @param {string} params.discordUsername - Required Discord username
 * @param {string} [params.epicId]
 * @param {string} [params.rocketLeagueRank]
 * @param {string | null} [params.teamName]
 * @param {boolean} [params.needsTeammate]
 * @param {string | null} [params.teammateDisplayName]
 * @param {string | null} [params.platform]
 * @param {Record<string, unknown>} [params.extraFormData]
 * @returns {Promise<{ registrationId: string | null; playerId: string; playerSlug: string | null; duplicate: boolean }>}
 */
export async function registerForTournament({
  tournamentId,
  discordUsername,
  epicId,
  rocketLeagueRank,
  teamName,
  needsTeammate,
  teammateDisplayName,
  platform,
  extraFormData = {},
}) {
  const supabase = getSupabaseClient();
  const trimmed = discordUsername.trim();

  if (!trimmed) {
    throw new Error("Discord username is required.");
  }
  if (!tournamentId) {
    throw new Error("Tournament id is required.");
  }

  const { id: playerId, slug: playerSlug } = await resolveOrCreatePlayer(trimmed);
  await ensurePlayerPointsSummary(playerId);

  const formData = {
    discord_username: trimmed,
    ...(platform ? { platform } : {}),
    ...extraFormData,
  };

  const { data, error } = await supabase
    .from("tournament_registrations")
    .insert({
      tournament_id: tournamentId,
      player_id: playerId,
      status: "confirmed",
      form_data: formData,
      epic_id: epicId ?? null,
      rocket_league_rank: rocketLeagueRank ?? null,
      team_name: teamName ?? null,
      needs_teammate: needsTeammate ?? false,
      teammate_display_name: teammateDisplayName ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { registrationId: null, playerId, playerSlug, duplicate: true };
    }
    throw error;
  }

  return { registrationId: data.id, playerId, playerSlug, duplicate: false };
}

export {
  isRegisteredForTournament,
  markRegisteredForTournament,
} from "../registrationSession";

/**
 * Fetch confirmed registrations with player profile/leaderboard fields.
 * Sorted by registered_at ascending (registration order). Efficient joins.
 *
 * @param {string} tournamentId
 * @param {string | null} [gameId]
 * @returns {Promise<Array<{
 *   name: string;
 *   slug: string | null;
 *   registeredAt: string;
 *   points: number;
 *   rank: number | null;
 *   tournamentsPlayed: number;
 *   platform: string;
 *   isNewPlayer: boolean;
 * }>>}
 */
export async function fetchTournamentRegistrations(tournamentId, gameId = null) {
  const supabase = getSupabaseClient();

  let query = supabase
    .from("tournament_registrations")
    .select(
      `
      registered_at,
      form_data,
      player:players!inner (
        id,
        display_name,
        slug,
        discord_username,
        created_at,
        points_summary:player_points_summary (
          total_points,
          tournaments_played
        )
      )
    `
    )
    .eq("tournament_id", tournamentId)
    .eq("status", "confirmed")
    .order("registered_at", { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return [];

  const playerIds = data.map((row) => row.player?.id).filter(Boolean);

  /** @type {Map<string, number>} */
  const rankByPlayerId = new Map();
  if (playerIds.length) {
    const { data: ranks, error: rankError } = await supabase
      .from("v_player_leaderboard")
      .select("player_id, rank")
      .in("player_id", playerIds);
    if (!rankError && ranks) {
      for (const row of ranks) {
        rankByPlayerId.set(row.player_id, row.rank);
      }
    }
  }

  /** @type {Map<string, string>} */
  const platformByPlayerId = new Map();
  if (playerIds.length && gameId) {
    const { data: profiles, error: profileError } = await supabase
      .from("player_game_profiles")
      .select("player_id, platform")
      .eq("game_id", gameId)
      .in("player_id", playerIds);
    if (!profileError && profiles) {
      for (const row of profiles) {
        if (row.platform) platformByPlayerId.set(row.player_id, row.platform);
      }
    }
  }

  return data.map((row) => {
    const player = row.player ?? {};
    const summary = Array.isArray(player.points_summary)
      ? player.points_summary[0]
      : player.points_summary;
    const points = Number(summary?.total_points ?? 0);
    const tournamentsPlayed = Number(summary?.tournaments_played ?? 0);
    const rank = rankByPlayerId.get(player.id) ?? null;
    const formPlatform = row.form_data?.platform;
    const platform = formatPlatformLabel(
      formPlatform ?? platformByPlayerId.get(player.id) ?? null
    );
    const name =
      row.form_data?.discord_username ||
      player.discord_username ||
      player.display_name ||
      "Player";

    return {
      name: String(name),
      slug: player.slug ?? null,
      registeredAt: row.registered_at,
      points,
      rank,
      tournamentsPlayed,
      platform,
      isNewPlayer: points === 0 && tournamentsPlayed === 0 && rank == null,
    };
  });
}
