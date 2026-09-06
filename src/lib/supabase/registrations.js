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

/**
 * Upsert Valorant rank on player_game_profiles.
 * @param {string} playerId
 * @param {string} gameId
 * @param {string} rank
 */
async function upsertPlayerGameRank(playerId, gameId, rank) {
  if (!playerId || !gameId || !rank?.trim()) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("player_game_profiles").upsert(
    {
      player_id: playerId,
      game_id: gameId,
      rank_tier: rank.trim(),
    },
    { onConflict: "player_id,game_id" }
  );
  if (error) {
    console.warn("player_game_profiles upsert:", error.message);
  }
}

/**
 * Solo registration for Valorant Championship #2 (1 player slot).
 *
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function registerValorantSolo({
  tournamentId,
  discordUsername,
  valorantRank,
  gameId,
}) {
  const rank = String(valorantRank ?? "").trim();
  if (!rank) {
    throw new Error("Valorant rank is required.");
  }

  let resolvedGameId = gameId ?? null;
  if (!resolvedGameId) {
    const tournamentGame = await resolveTournamentGame(tournamentId);
    resolvedGameId = tournamentGame.gameId;
  }

  const result = await registerForTournament({
    tournamentId,
    discordUsername,
    extraFormData: {
      registration_type: "solo",
      rank,
    },
  });

  if (!result.duplicate && result.playerId && resolvedGameId) {
    await upsertPlayerGameRank(result.playerId, resolvedGameId, rank);
  }

  return {
    ...result,
    registrationType: "solo",
  };
}

/**
 * Full 5-player team registration for Valorant Championship #2.
 *
 * @param {object} params
 * @param {string} params.tournamentId
 * @param {string} params.teamName
 * @param {Array<{ discordUsername: string; rank: string; isCaptain?: boolean }>} params.players
 * @returns {Promise<object>}
 */
export async function registerValorantTeam({
  tournamentId,
  teamName,
  players,
}) {
  const supabase = getSupabaseClient();
  const trimmedTeam = String(teamName ?? "").trim();

  if (!trimmedTeam) {
    throw new Error("Team name is required.");
  }
  if (!Array.isArray(players) || players.length !== 5) {
    throw new Error("A full team requires exactly 5 players.");
  }

  const payload = players.map((player, index) => ({
    discord_username: String(player.discordUsername ?? "").trim(),
    rank: String(player.rank ?? "").trim(),
    is_captain: Boolean(player.isCaptain ?? index === 0),
  }));

  const { data, error } = await supabase.rpc("dgl_register_valorant_team", {
    p_tournament_id: tournamentId,
    p_team_name: trimmedTeam,
    p_players: payload,
  });

  if (error) {
    const msg = error.message || "";
    if (/registrations?\s+closed/i.test(msg)) {
      throw new Error("Registrations Closed");
    }
    if (/tournament full/i.test(msg)) {
      throw new Error("Tournament Full");
    }
    if (/already registered/i.test(msg)) {
      throw new Error(msg);
    }
    if (/not enough capacity|not enough main capacity/i.test(msg)) {
      throw new Error(
        "Not enough main capacity for a full team. Teams require 5 available main player slots."
      );
    }
    throw new Error(msg || "Team registration failed. Please try again.");
  }

  const status = data?.status ?? "confirmed";
  return {
    registrationType: "team",
    teamName: data?.team_name ?? trimmedTeam,
    teamId: data?.team_id ?? null,
    registrationGroupId: data?.registration_group_id ?? null,
    registrationIds: data?.registration_ids ?? [],
    playerCount: Number(data?.player_count ?? 5),
    status,
    isReserve: Boolean(data?.is_reserve),
    duplicate: false,
  };
}

/**
 * Register a full team into a pre-created Team N slot.
 *
 * @param {object} params
 * @param {string} params.tournamentId
 * @param {string} params.teamName
 * @param {Array<{ discordUsername: string; isCaptain?: boolean }>} params.mains
 * @param {Array<{ discordUsername: string }>} [params.substitutes]
 * @returns {Promise<object>}
 */
export async function registerTeamSlot({
  tournamentId,
  teamName,
  mains,
  substitutes = [],
}) {
  const supabase = getSupabaseClient();
  const trimmedTeam = String(teamName ?? "").trim();

  if (!trimmedTeam) {
    throw new Error("Select an available team slot.");
  }
  if (!Array.isArray(mains) || mains.length === 0) {
    throw new Error("A full starting roster is required.");
  }

  const mainPayload = mains.map((player, index) => ({
    discord_username: String(player.discordUsername ?? "").trim(),
    is_captain: Boolean(player.isCaptain ?? index === 0),
  }));
  const substitutePayload = (substitutes ?? [])
    .map((player) => ({
      discord_username: String(player.discordUsername ?? "").trim(),
    }))
    .filter((player) => player.discord_username);

  const { data, error } = await supabase.rpc("dgl_register_team_slot", {
    p_tournament_id: tournamentId,
    p_team_name: trimmedTeam,
    p_mains: mainPayload,
    p_substitutes: substitutePayload,
  });

  if (error) {
    const msg = error.message || "";
    if (/registrations?\s+closed/i.test(msg)) {
      throw new Error("Registrations Closed");
    }
    if (/tournament full/i.test(msg)) {
      throw new Error("Tournament Full");
    }
    if (/already registered/i.test(msg)) {
      throw new Error(msg);
    }
    if (/already taken/i.test(msg)) {
      throw new Error(msg);
    }
    if (/not enough main capacity|not enough capacity/i.test(msg)) {
      throw new Error(msg);
    }
    throw new Error(msg || "Team registration failed. Please try again.");
  }

  return {
    registrationType: "team",
    teamName: data?.team_name ?? trimmedTeam,
    teamId: data?.team_id ?? null,
    registrationGroupId: data?.registration_group_id ?? null,
    registrationIds: data?.registration_ids ?? [],
    playerCount: Number(data?.player_count ?? mainPayload.length),
    substituteCount: Number(data?.substitute_count ?? substitutePayload.length),
    status: data?.status ?? "confirmed",
    isReserve: false,
    duplicate: false,
  };
}

/**
 * @param {object} member
 * @returns {{ role: string; name: string; slug: string | null; playerId: string | null }}
 */
function mapTeamMember(member) {
  const player = Array.isArray(member.player) ? member.player[0] : member.player;
  return {
    role: member.role,
    name: String(
      player?.discord_username || player?.display_name || "Player"
    ),
    slug: player?.slug ?? null,
    playerId: player?.id ?? member.player_id ?? null,
  };
}

/**
 * Pre-created Team 1…N shells with main / substitute members.
 *
 * @param {string} tournamentId
 * @returns {Promise<Array<{
 *   id: string;
 *   name: string;
 *   seed: number | null;
 *   mains: object[];
 *   substitutes: object[];
 *   taken: boolean;
 * }>>}
 */
export async function fetchTournamentTeamSlots(tournamentId) {
  const supabase = getSupabaseClient();
  if (!tournamentId) return [];

  const { data, error } = await supabase
    .from("tournament_teams")
    .select(
      `
      id,
      name,
      seed,
      members:tournament_team_members (
        role,
        player_id,
        player:players (
          id,
          display_name,
          discord_username,
          slug
        )
      )
    `
    )
    .eq("tournament_id", tournamentId)
    .order("seed", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const members = Array.isArray(row.members) ? row.members : [];
    const mains = [];
    const substitutes = [];
    for (const member of members) {
      const mapped = mapTeamMember(member);
      if (member.role === "substitute") {
        substitutes.push(mapped);
      } else if (member.role === "captain" || member.role === "member") {
        mains.push(mapped);
      }
    }
    mains.sort((a, b) => {
      if (a.role === "captain" && b.role !== "captain") return -1;
      if (b.role === "captain" && a.role !== "captain") return 1;
      return 0;
    });
    return {
      id: row.id,
      name: row.name,
      seed: row.seed ?? null,
      mains,
      substitutes,
      taken: mains.length > 0,
    };
  });
}

export {
  isRegisteredForTournament,
  markRegisteredForTournament,
} from "../registrationSession";

/**
 * Resolve in-game rank from registration / profile sources.
 * Does not invent values — returns null when nothing was stored.
 *
 * Priority:
 *   1. player_game_profiles.rank_tier for this tournament's game
 *   2. tournament_registrations.rocket_league_rank (Rocket League signup)
 *   3. form_data.rank (legacy registration payload)
 *
 * @param {object} row
 * @param {Map<string, string>} gameRankByPlayerId
 * @returns {string | null}
 */
function resolveGameRank(row, gameRankByPlayerId) {
  const playerId = row.player?.id;
  if (playerId && gameRankByPlayerId.has(playerId)) {
    return gameRankByPlayerId.get(playerId) ?? null;
  }
  if (row.rocket_league_rank != null && String(row.rocket_league_rank).trim()) {
    return String(row.rocket_league_rank).trim();
  }
  const formRank = row.form_data?.rank;
  if (formRank != null && String(formRank).trim()) {
    return String(formRank).trim();
  }
  return null;
}

/**
 * @param {object} row
 * @param {Map<string, number>} dglRankByPlayerId
 * @param {Map<string, string>} platformByPlayerId
 * @param {Map<string, string>} gameRankByPlayerId
 * @param {string} gameName
 * @param {number} [reserveIndex] 1-based reserve order when status is waitlist
 */
function mapRegistrationRow(
  row,
  dglRankByPlayerId,
  platformByPlayerId,
  gameRankByPlayerId,
  gameName,
  reserveIndex = null
) {
  const player = row.player ?? {};
  const summary = Array.isArray(player.points_summary)
    ? player.points_summary[0]
    : player.points_summary;
  const points = Number(summary?.total_points ?? 0);
  const tournamentsPlayed = Number(summary?.tournaments_played ?? 0);
  const dglRank = dglRankByPlayerId.get(player.id) ?? null;
  const gameRank = resolveGameRank(row, gameRankByPlayerId);
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
    playerId: player.id ?? null,
    name: String(name),
    slug: player.slug ?? null,
    registeredAt: row.registered_at,
    points,
    dglRank,
    gameRank,
    gameName,
    tournamentsPlayed,
    platform,
    isNewPlayer: points === 0 && tournamentsPlayed === 0 && dglRank == null,
    status,
    isReserve: isReserveStatus(status),
    isConfirmed: isConfirmedStatus(status),
    reserveNumber: reserveIndex,
  };
}

/**
 * @param {string} tournamentId
 * @returns {Promise<{ gameId: string | null; gameName: string; gameSlug: string | null }>}
 */
async function resolveTournamentGame(tournamentId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("game_id, games(name, slug)")
    .eq("id", tournamentId)
    .maybeSingle();

  if (error || !data) {
    return { gameId: null, gameName: "Game", gameSlug: null };
  }

  const game = Array.isArray(data.games) ? data.games[0] : data.games;
  return {
    gameId: data.game_id ?? null,
    gameName: game?.name ?? "Game",
    gameSlug: game?.slug ?? null,
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

  const tournamentGame = await resolveTournamentGame(tournamentId);
  const resolvedGameId = gameId ?? tournamentGame.gameId;
  const gameName = tournamentGame.gameName;

  const { data, error } = await supabase
    .from("tournament_registrations")
    .select(
      `
      id,
      status,
      registered_at,
      form_data,
      rocket_league_rank,
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
  const dglRankByPlayerId = new Map();
  if (playerIds.length) {
    const { data: ranks, error: rankError } = await supabase
      .from("v_player_leaderboard")
      .select("player_id, rank")
      .in("player_id", playerIds);
    if (!rankError && ranks) {
      for (const row of ranks) {
        dglRankByPlayerId.set(row.player_id, row.rank);
      }
    }
  }

  /** @type {Map<string, string>} */
  const platformByPlayerId = new Map();
  /** @type {Map<string, string>} */
  const gameRankByPlayerId = new Map();
  if (playerIds.length && resolvedGameId) {
    const { data: profiles, error: profileError } = await supabase
      .from("player_game_profiles")
      .select("player_id, platform, rank_tier")
      .eq("game_id", resolvedGameId)
      .in("player_id", playerIds);
    if (!profileError && profiles) {
      for (const row of profiles) {
        if (row.platform) platformByPlayerId.set(row.player_id, row.platform);
        if (row.rank_tier != null && String(row.rank_tier).trim()) {
          gameRankByPlayerId.set(row.player_id, String(row.rank_tier).trim());
        }
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
        mapRegistrationRow(
          row,
          dglRankByPlayerId,
          platformByPlayerId,
          gameRankByPlayerId,
          gameName,
          reserveIndex
        )
      );
    } else {
      confirmed.push(
        mapRegistrationRow(
          row,
          dglRankByPlayerId,
          platformByPlayerId,
          gameRankByPlayerId,
          gameName,
          null
        )
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

/**
 * Actual participants for a completed (or in-progress) tournament.
 * Distinct from registrations — may include walk-ons and exclude no-shows.
 * @param {string} tournamentId
 * @param {string | null} [gameId]
 * @returns {Promise<object[]>}
 */
export async function fetchTournamentParticipants(tournamentId, gameId = null) {
  const supabase = getSupabaseClient();
  if (!tournamentId) return [];

  let resolvedGameId = gameId;
  let gameName = "Game";
  if (!resolvedGameId) {
    const { data: meta } = await supabase
      .from("tournaments")
      .select("game_id, games(name)")
      .eq("id", tournamentId)
      .maybeSingle();
    resolvedGameId = meta?.game_id ?? null;
    const game = Array.isArray(meta?.games) ? meta.games[0] : meta?.games;
    gameName = game?.name ?? "Game";
  } else {
    const { data: game } = await supabase
      .from("games")
      .select("name")
      .eq("id", resolvedGameId)
      .maybeSingle();
    gameName = game?.name ?? "Game";
  }

  const { data, error } = await supabase
    .from("tournament_participants")
    .select(
      `
      id,
      added_at,
      player:players!inner (
        id,
        display_name,
        slug,
        discord_username,
        points_summary:player_points_summary (
          total_points,
          tournaments_played
        )
      )
    `
    )
    .eq("tournament_id", tournamentId)
    .order("added_at", { ascending: true });

  if (error) throw error;
  if (!data?.length) return [];

  const playerIds = data.map((row) => row.player?.id).filter(Boolean);

  /** @type {Map<string, number>} */
  const dglRankByPlayerId = new Map();
  if (playerIds.length) {
    const { data: ranks } = await supabase
      .from("v_player_leaderboard")
      .select("player_id, rank")
      .in("player_id", playerIds);
    for (const row of ranks ?? []) {
      dglRankByPlayerId.set(row.player_id, row.rank);
    }
  }

  /** @type {Map<string, string>} */
  const gameRankByPlayerId = new Map();
  if (playerIds.length && resolvedGameId) {
    const { data: profiles } = await supabase
      .from("player_game_profiles")
      .select("player_id, rank_tier")
      .eq("game_id", resolvedGameId)
      .in("player_id", playerIds);
    for (const row of profiles ?? []) {
      if (row.rank_tier != null && String(row.rank_tier).trim()) {
        gameRankByPlayerId.set(row.player_id, String(row.rank_tier).trim());
      }
    }
  }

  // Prefer registration-scoped rocket_league_rank when present
  /** @type {Map<string, string>} */
  const rlRankByPlayerId = new Map();
  if (playerIds.length) {
    const { data: regs } = await supabase
      .from("tournament_registrations")
      .select("player_id, rocket_league_rank, form_data")
      .eq("tournament_id", tournamentId)
      .in("player_id", playerIds);
    for (const row of regs ?? []) {
      if (row.rocket_league_rank != null && String(row.rocket_league_rank).trim()) {
        rlRankByPlayerId.set(row.player_id, String(row.rocket_league_rank).trim());
      } else if (row.form_data?.rank) {
        rlRankByPlayerId.set(row.player_id, String(row.form_data.rank).trim());
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
    const dglRank = dglRankByPlayerId.get(player.id) ?? null;
    const gameRank =
      gameRankByPlayerId.get(player.id) ??
      rlRankByPlayerId.get(player.id) ??
      null;
    const name =
      player.discord_username || player.display_name || "Player";

    return {
      id: row.id ?? null,
      playerId: player.id ?? null,
      name: String(name),
      slug: player.slug ?? null,
      registeredAt: row.added_at ?? null,
      points,
      dglRank,
      gameRank,
      gameName,
      tournamentsPlayed,
      platform: "Not Specified",
      isNewPlayer: points === 0 && tournamentsPlayed === 0 && dglRank == null,
      status: "confirmed",
      isReserve: false,
      isConfirmed: true,
      reserveNumber: null,
    };
  });
}
