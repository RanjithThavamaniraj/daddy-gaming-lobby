/**
 * Registration flow for individual players + reserve (waitlist) support.
 *
 * Status mapping (DB → product):
 *   confirmed → Confirmed
 *   waitlist  → Reserve
 *   withdrawn → Withdrawn
 *   checked_in → Checked In
 *
 * Insert status is auto-assigned by dgl_assign_registration_status trigger.
 */

import { getSupabaseClient } from "../../supabase";

/** Product label for DB waitlist status */
export const REG_STATUS = {
  CONFIRMED: "confirmed",
  RESERVE: "waitlist",
  WITHDRAWN: "withdrawn",
  CHECKED_IN: "checked_in",
  PENDING: "pending",
};

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
 * @param {string | null | undefined} status
 * @returns {boolean}
 */
export function isReserveStatus(status) {
  return status === REG_STATUS.RESERVE || status === "reserve";
}

/**
 * @param {string | null | undefined} status
 * @returns {boolean}
 */
export function isConfirmedStatus(status) {
  return status === REG_STATUS.CONFIRMED || status === REG_STATUS.PENDING;
}

/**
 * Resolve or create a `players` row for a Discord username.
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
 * @param {string} playerId
 */
async function ensurePlayerPointsSummary(playerId) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("dgl_ensure_player_points_summary", {
    p_player_id: playerId,
  });
  if (error) {
    console.warn("dgl_ensure_player_points_summary:", error.message);
  }
}

/**
 * Register an individual player (confirmed or reserve — assigned by DB trigger).
 *
 * @param {object} params
 * @returns {Promise<{
 *   registrationId: string | null;
 *   playerId: string;
 *   playerSlug: string | null;
 *   duplicate: boolean;
 *   status: string | null;
 *   isReserve: boolean;
 * }>}
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

  // Status is overwritten by dgl_assign_registration_status when needed.
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
    .select("id, status")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        registrationId: null,
        playerId,
        playerSlug,
        duplicate: true,
        status: null,
        isReserve: false,
      };
    }
    const msg = error.message || "";
    if (/registrations?\s+closed/i.test(msg)) {
      throw new Error("Registrations Closed");
    }
    if (/tournament full/i.test(msg)) {
      throw new Error("Tournament Full");
    }
    throw error;
  }

  const status = data.status ?? "confirmed";
  return {
    registrationId: data.id,
    playerId,
    playerSlug,
    duplicate: false,
    status,
    isReserve: isReserveStatus(status),
  };
}

export {
  isRegisteredForTournament,
  markRegisteredForTournament,
} from "../registrationSession";

/**
 * @param {object} row
 * @param {Map<string, number>} rankByPlayerId
 * @param {Map<string, string>} platformByPlayerId
 * @param {number} [reserveIndex] 1-based reserve order when status is waitlist
 */
function mapRegistrationRow(row, rankByPlayerId, platformByPlayerId, reserveIndex = null) {
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
  const status = row.status ?? "confirmed";

  return {
    id: row.id ?? null,
    name: String(name),
    slug: player.slug ?? null,
    registeredAt: row.registered_at,
    points,
    rank,
    tournamentsPlayed,
    platform,
    isNewPlayer: points === 0 && tournamentsPlayed === 0 && rank == null,
    status,
    isReserve: isReserveStatus(status),
    isConfirmed: isConfirmedStatus(status),
    reserveNumber: reserveIndex,
  };
}

/**
 * Fetch confirmed + reserve registrations (registration order).
 * @param {string} tournamentId
 * @param {string | null} [gameId]
 * @returns {Promise<{
 *   confirmed: Array<object>;
 *   reserves: Array<object>;
 *   all: Array<object>;
 * }>}
 */
export async function fetchTournamentRoster(tournamentId, gameId = null) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("tournament_registrations")
    .select(
      `
      id,
      status,
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
    .in("status", ["confirmed", "pending", "waitlist"])
    .order("registered_at", { ascending: true });

  if (error) throw error;
  if (!data?.length) {
    return { confirmed: [], reserves: [], all: [] };
  }

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

  /** @type {object[]} */
  const confirmed = [];
  /** @type {object[]} */
  const reserves = [];
  let reserveIndex = 0;

  for (const row of data) {
    if (isReserveStatus(row.status)) {
      reserveIndex += 1;
      reserves.push(
        mapRegistrationRow(row, rankByPlayerId, platformByPlayerId, reserveIndex)
      );
    } else {
      confirmed.push(
        mapRegistrationRow(row, rankByPlayerId, platformByPlayerId, null)
      );
    }
  }

  return { confirmed, reserves, all: [...confirmed, ...reserves] };
}

/**
 * Back-compat: confirmed players only (registration order).
 * @param {string} tournamentId
 * @param {string | null} [gameId]
 */
export async function fetchTournamentRegistrations(tournamentId, gameId = null) {
  const roster = await fetchTournamentRoster(tournamentId, gameId);
  return roster.confirmed;
}
