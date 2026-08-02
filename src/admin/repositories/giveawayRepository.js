/**
 * Admin giveaway data access.
 * Pages must never call Supabase directly — use this repository only.
 *
 * Phase G1: CRUD, lifecycle, eligibility, CSV export, community_activity.
 * Winner is recorded via recordWinner() after an external Wheel of Names draw.
 */

import { getSupabaseClient, getSupabaseConfigIssues } from "../../supabase";
import {
  createEmptyGiveawayFormValues,
  dateTimeLocalToIso,
  isoToDateTimeLocal,
} from "../lib/giveawayFormDefaults";
import {
  insertCommunityActivity,
  writeAdminAuditLog,
} from "./communityActivity";

/** @typedef {import("../lib/giveawayFormDefaults").GiveawayFormValues} GiveawayFormValues */

const ACTIVE_REG_STATUSES = ["pending", "confirmed", "waitlist"];

/**
 * Field-level validation failure returned to the form.
 */
export class GiveawayValidationError extends Error {
  /**
   * @param {Record<string, string>} fieldErrors
   * @param {string} [message]
   */
  constructor(fieldErrors, message = "Please fix the highlighted fields.") {
    super(message);
    this.name = "GiveawayValidationError";
    this.fieldErrors = fieldErrors;
  }
}

/**
 * @returns {import("@supabase/supabase-js").SupabaseClient}
 */
function requireClient() {
  const issues = getSupabaseConfigIssues();
  if (issues.length > 0) {
    throw new Error(issues.join(" "));
  }
  return getSupabaseClient();
}

/**
 * @param {object} row
 */
function mapGiveawayListRow(row) {
  return {
    id: row.id,
    title: row.title,
    reason: row.reason ?? "",
    prize: row.prize,
    status: row.status,
    isArchived: Boolean(row.is_archived),
    eligibleTournamentCount: Array.isArray(row.eligible_tournament_ids)
      ? row.eligible_tournament_ids.length
      : 0,
    entriesCloseAt: row.entries_close_at ?? null,
    drawAt: row.draw_at ?? null,
    winnerName: row.winner_name ?? null,
    publishedAt: row.published_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at ?? null,
  };
}

/**
 * @param {object} row
 */
function mapRowToForm(row) {
  return {
    values: {
      title: row.title ?? "",
      reason: row.reason ?? "",
      description: row.description ?? "",
      prize: row.prize ?? "",
      rules: row.rules ?? "",
      eligibleTournamentIds: Array.isArray(row.eligible_tournament_ids)
        ? [...row.eligible_tournament_ids]
        : [],
      entriesCloseAt: isoToDateTimeLocal(row.entries_close_at),
      drawAt: isoToDateTimeLocal(row.draw_at),
      winnerNotes: row.winner_notes ?? "",
    },
    meta: {
      id: row.id,
      status: row.status,
      isArchived: Boolean(row.is_archived),
      winnerPlayerId: row.winner_player_id ?? null,
      winnerName: row.winner_name ?? null,
      winnerDiscordName: row.winner_discord_name ?? null,
      publishedAt: row.published_at ?? null,
      completedAt: row.completed_at ?? null,
    },
  };
}

/**
 * @param {GiveawayFormValues} input
 * @returns {Promise<object>}
 */
async function normalizeAndValidateGiveawayInput(input) {
  /** @type {Record<string, string>} */
  const fieldErrors = {};

  const title = String(input.title ?? "").trim();
  const reason = String(input.reason ?? "").trim();
  const description = String(input.description ?? "").trim();
  const prize = String(input.prize ?? "").trim();
  const rules = String(input.rules ?? "").trim();
  const eligibleTournamentIds = Array.isArray(input.eligibleTournamentIds)
    ? [...new Set(input.eligibleTournamentIds.filter(Boolean))]
    : [];

  if (!title) fieldErrors.title = "Title is required.";
  if (!prize) fieldErrors.prize = "Prize is required.";

  const entriesCloseAt = dateTimeLocalToIso(input.entriesCloseAt);
  const drawAt = dateTimeLocalToIso(input.drawAt);

  if (input.entriesCloseAt?.trim() && !entriesCloseAt) {
    fieldErrors.entriesCloseAt = "Enter a valid entries close date.";
  }
  if (input.drawAt?.trim() && !drawAt) {
    fieldErrors.drawAt = "Enter a valid draw date.";
  }
  if (entriesCloseAt && drawAt && new Date(entriesCloseAt) > new Date(drawAt)) {
    fieldErrors.drawAt = "Draw date must be on or after entries close.";
  }

  if (eligibleTournamentIds.length > 0) {
    const { data: tournaments, error } = await requireClient()
      .from("tournaments")
      .select("id")
      .in("id", eligibleTournamentIds);

    if (error) throw error;
    const found = new Set((tournaments ?? []).map((t) => t.id));
    const missing = eligibleTournamentIds.filter((id) => !found.has(id));
    if (missing.length > 0) {
      fieldErrors.eligibleTournamentIds =
        "One or more selected tournaments were not found.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new GiveawayValidationError(fieldErrors);
  }

  return {
    title,
    reason: reason || null,
    description: description || null,
    prize,
    rules: rules || null,
    eligible_tournament_ids: eligibleTournamentIds,
    entries_close_at: entriesCloseAt,
    draw_at: drawAt,
  };
}

/**
 * @returns {GiveawayFormValues}
 */
export function getEmptyGiveawayFormValues() {
  return createEmptyGiveawayFormValues();
}

/**
 * @param {object} [options]
 * @param {boolean} [options.includeArchived=false]
 */
export async function listGiveaways({ includeArchived = false } = {}) {
  let query = requireClient()
    .from("giveaways")
    .select(
      "id, title, reason, prize, status, is_archived, eligible_tournament_ids, entries_close_at, draw_at, winner_name, published_at, completed_at, created_at"
    )
    .order("created_at", { ascending: false });

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapGiveawayListRow);
}

/**
 * @param {object} [options]
 * @param {boolean} [options.includeArchived=false]
 */
export async function getGiveawayDashboardCounts({ includeArchived = false } = {}) {
  let query = requireClient().from("giveaways").select("status");
  if (!includeArchived) query = query.eq("is_archived", false);

  const { data, error } = await query;
  if (error) throw error;

  const counts = {
    draft: 0,
    published: 0,
    entriesClosed: 0,
    completed: 0,
    winnerSelected: 0,
    cancelled: 0,
    total: 0,
  };

  for (const row of data ?? []) {
    counts.total += 1;
    if (row.status === "draft") counts.draft += 1;
    else if (row.status === "published") counts.published += 1;
    else if (row.status === "entries_closed") counts.entriesClosed += 1;
    else if (row.status === "winner_selected") counts.winnerSelected += 1;
    else if (row.status === "completed") counts.completed += 1;
    else if (row.status === "cancelled") counts.cancelled += 1;
  }

  return counts;
}

/**
 * @param {string} id
 */
export async function getGiveaway(id) {
  if (!id) return null;
  const { data, error } = await requireClient()
    .from("giveaways")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

/**
 * @param {string} id
 */
export async function getGiveawayFormById(id) {
  const row = await getGiveaway(id);
  if (!row) return null;
  return mapRowToForm(row);
}

/**
 * @param {string} id
 */
async function requireGiveaway(id) {
  if (!id) {
    throw new GiveawayValidationError({}, "Giveaway id is required.");
  }
  const row = await getGiveaway(id);
  if (!row) {
    throw new GiveawayValidationError({}, "Giveaway not found.");
  }
  return row;
}

/**
 * @param {string} id
 * @param {object} patch
 * @param {{ userId?: string | null }} [options]
 */
async function applyGiveawayPatch(id, patch, { userId = null } = {}) {
  const { data, error } = await requireClient()
    .from("giveaways")
    .update({ ...patch, updated_by: userId })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Tournaments available for eligibility selection.
 */
export async function listTournamentsForGiveawaySelector() {
  const { data, error } = await requireClient()
    .from("tournaments")
    .select(
      "id, global_number, championship_label, status, is_archived, games ( name )"
    )
    .eq("is_archived", false)
    .order("global_number", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    globalNumber: row.global_number,
    label: `Tournament #${row.global_number} · ${row.championship_label}`,
    championshipLabel: row.championship_label,
    game: row.games?.name ?? "—",
    status: row.status,
  }));
}

/**
 * Compute distinct eligible players + stats from tournament registrations.
 * @param {string[]} tournamentIds
 * @returns {Promise<{
 *   players: Array<{
 *     playerId: string,
 *     playerName: string,
 *     discordName: string | null,
 *     tournamentIds: string[],
 *     tournamentLabels: string[],
 *   }>,
 *   stats: {
 *     selectedTournaments: number,
 *     totalRegistrations: number,
 *     duplicatePlayersRemoved: number,
 *     uniqueEligiblePlayers: number,
 *   },
 *   tournamentLabelsById: Record<string, string>,
 * }>}
 */
export async function computeEligibility(tournamentIds) {
  const ids = [...new Set((tournamentIds ?? []).filter(Boolean))];
  const empty = {
    players: [],
    stats: {
      selectedTournaments: ids.length,
      totalRegistrations: 0,
      duplicatePlayersRemoved: 0,
      uniqueEligiblePlayers: 0,
    },
    tournamentLabelsById: {},
  };

  if (ids.length === 0) return empty;

  const client = requireClient();

  const { data: tournaments, error: tError } = await client
    .from("tournaments")
    .select("id, global_number, championship_label")
    .in("id", ids);

  if (tError) throw tError;

  /** @type {Record<string, string>} */
  const tournamentLabelsById = {};
  for (const t of tournaments ?? []) {
    tournamentLabelsById[t.id] =
      `Tournament #${t.global_number} · ${t.championship_label}`;
  }

  const { data: registrations, error: rError } = await client
    .from("tournament_registrations")
    .select("tournament_id, player_id, team_id, status")
    .in("tournament_id", ids)
    .in("status", ACTIVE_REG_STATUSES);

  if (rError) throw rError;

  const regs = registrations ?? [];
  const teamIds = [
    ...new Set(regs.map((r) => r.team_id).filter(Boolean)),
  ];

  /** @type {Map<string, string[]>} teamId → playerIds */
  const teamMembers = new Map();
  if (teamIds.length > 0) {
    const { data: members, error: mError } = await client
      .from("tournament_team_members")
      .select("team_id, player_id")
      .in("team_id", teamIds);
    if (mError) throw mError;
    for (const member of members ?? []) {
      const list = teamMembers.get(member.team_id) ?? [];
      list.push(member.player_id);
      teamMembers.set(member.team_id, list);
    }
  }

  /** @type {Map<string, Set<string>>} playerId → tournamentIds */
  const playerTournaments = new Map();
  let totalRegistrations = 0;

  for (const reg of regs) {
    /** @type {string[]} */
    let playerIds = [];
    if (reg.player_id) {
      playerIds = [reg.player_id];
    } else if (reg.team_id) {
      playerIds = teamMembers.get(reg.team_id) ?? [];
    }

    for (const playerId of playerIds) {
      totalRegistrations += 1;
      const set = playerTournaments.get(playerId) ?? new Set();
      set.add(reg.tournament_id);
      playerTournaments.set(playerId, set);
    }
  }

  const playerIds = [...playerTournaments.keys()];
  /** @type {Map<string, { display_name: string, discord_username: string | null }>} */
  const playerInfo = new Map();

  if (playerIds.length > 0) {
    const { data: players, error: pError } = await client
      .from("players")
      .select("id, display_name, discord_username")
      .in("id", playerIds);
    if (pError) throw pError;
    for (const p of players ?? []) {
      playerInfo.set(p.id, {
        display_name: p.display_name,
        discord_username: p.discord_username ?? null,
      });
    }
  }

  const players = playerIds
    .map((playerId) => {
      const info = playerInfo.get(playerId);
      const tIds = [...(playerTournaments.get(playerId) ?? [])];
      return {
        playerId,
        playerName: info?.display_name ?? "Unknown player",
        discordName: info?.discord_username ?? null,
        tournamentIds: tIds,
        tournamentLabels: tIds.map(
          (tid) => tournamentLabelsById[tid] ?? tid
        ),
      };
    })
    .sort((a, b) => a.playerName.localeCompare(b.playerName));

  const uniqueEligiblePlayers = players.length;
  const duplicatePlayersRemoved = Math.max(
    0,
    totalRegistrations - uniqueEligiblePlayers
  );

  return {
    players,
    stats: {
      selectedTournaments: ids.length,
      totalRegistrations,
      duplicatePlayersRemoved,
      uniqueEligiblePlayers,
    },
    tournamentLabelsById,
  };
}

/**
 * @param {string} giveawayId
 */
export async function getEligibilityForGiveaway(giveawayId) {
  const row = await requireGiveaway(giveawayId);
  return computeEligibility(row.eligible_tournament_ids ?? []);
}

/**
 * CSV for Wheel of Names import — one row per eligible player.
 * @param {string[]} tournamentIds
 */
export async function buildEligiblePlayersCsv(tournamentIds) {
  const { players } = await computeEligibility(tournamentIds);
  const header = ["Player Name", "Discord Name", "Tournaments"];
  const lines = [header.join(",")];

  for (const player of players) {
    const cells = [
      csvEscape(player.playerName),
      csvEscape(player.discordName ?? ""),
      csvEscape(player.tournamentLabels.join("; ")),
    ];
    lines.push(cells.join(","));
  }

  return lines.join("\n");
}

/**
 * @param {string} value
 */
function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

// ---------------------------------------------------------------------------
// Community activity
// ---------------------------------------------------------------------------

const IDEMPOTENT_GIVEAWAY_ACTIVITY = new Set([
  "giveaway_created",
  "giveaway_completed",
]);

/**
 * @param {object} row
 */
function buildGiveawayActivityPayload(row) {
  return {
    giveaway_id: row.id,
    title: row.title ?? null,
    reason: row.reason ?? null,
    prize: row.prize ?? null,
    status: row.status ?? null,
    eligible_tournament_ids: row.eligible_tournament_ids ?? [],
    entries_close_at: row.entries_close_at ?? null,
    draw_at: row.draw_at ?? null,
    winner_player_id: row.winner_player_id ?? null,
    winner_name: row.winner_name ?? null,
    winner_discord_name: row.winner_discord_name ?? null,
    published_at: row.published_at ?? null,
    completed_at: row.completed_at ?? null,
  };
}

/**
 * @param {string} activityType
 * @param {object} giveawayRow
 */
function buildGiveawayActivityCopy(activityType, giveawayRow) {
  if (activityType === "giveaway_created") {
    return {
      title: `🎉 Giveaway published · ${giveawayRow.title}`,
      summary: giveawayRow.prize ?? null,
    };
  }
  if (activityType === "giveaway_completed") {
    return {
      title: `🏆 Giveaway completed · ${giveawayRow.title}`,
      summary: `Winner: ${giveawayRow.winner_name ?? "Announced"}`,
    };
  }
  throw new Error(`Unsupported giveaway activity type: ${activityType}`);
}

/**
 * @param {string} activityType
 * @param {object} giveawayRow
 */
async function logGiveawayActivity(activityType, giveawayRow) {
  if (!giveawayRow?.id) {
    throw new Error("logGiveawayActivity requires a giveaway row with id.");
  }

  const client = requireClient();

  if (IDEMPOTENT_GIVEAWAY_ACTIVITY.has(activityType)) {
    const { data: recent, error: recentError } = await client
      .from("community_activity")
      .select("id, payload")
      .eq("activity_type", activityType)
      .order("occurred_at", { ascending: false })
      .limit(100);
    if (recentError) throw recentError;
    const hit = (recent ?? []).find(
      (row) => row.payload?.giveaway_id === giveawayRow.id
    );
    if (hit) return { id: hit.id };
  }

  const copy = buildGiveawayActivityCopy(activityType, giveawayRow);
  return insertCommunityActivity({
    activityType,
    title: copy.title,
    summary: copy.summary,
    payload: buildGiveawayActivityPayload(giveawayRow),
    tournamentId: null,
    isPublic: true,
  });
}

/** Status → activity_type for admin republish (current lifecycle expectation). */
const REPUBLISH_ACTIVITY_BY_STATUS = {
  published: "giveaway_created",
  entries_closed: "giveaway_created",
  winner_selected: "giveaway_completed",
  completed: "giveaway_completed",
};

/**
 * Insert a NEW community_activity row so Jarvis posts again.
 * Does not change giveaway status or Jarvis local state.
 * Bypasses lifecycle idempotency (always creates a new activity id).
 *
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function republishAnnouncement(id, { userId = null } = {}) {
  const row = await requireGiveaway(id);

  if (row.is_archived) {
    throw new GiveawayValidationError(
      {},
      "Cannot republish an archived giveaway."
    );
  }

  if (row.status === "draft") {
    throw new GiveawayValidationError(
      {},
      "Cannot republish a draft giveaway. Publish it first."
    );
  }

  const activityType = REPUBLISH_ACTIVITY_BY_STATUS[row.status];
  if (!activityType) {
    throw new GiveawayValidationError(
      {},
      `Cannot republish announcement for status "${row.status}".`
    );
  }

  if (
    activityType === "giveaway_completed" &&
    (!row.winner_player_id || !row.winner_name)
  ) {
    throw new GiveawayValidationError(
      {},
      "Cannot republish completion announcement: winner has not been recorded."
    );
  }

  const copy = buildGiveawayActivityCopy(activityType, row);
  const activity = await insertCommunityActivity({
    activityType,
    title: copy.title,
    summary: copy.summary,
    payload: buildGiveawayActivityPayload(row),
    tournamentId: null,
    isPublic: true,
  });

  await writeAdminAuditLog({
    adminUserId: userId,
    action: "Announcement republished",
    entityType: "giveaway",
    entityId: row.id,
    tournamentId: null,
    oldValue: {},
    newValue: {
      giveaway_id: row.id,
      giveaway_status: row.status,
      activity_type: activityType,
      community_activity_id: activity.id,
      republished_at: new Date().toISOString(),
    },
  });

  return {
    id: row.id,
    status: row.status,
    activityId: activity.id,
    activityType,
  };
}

// ---------------------------------------------------------------------------
// CRUD + lifecycle
// ---------------------------------------------------------------------------

/**
 * @param {GiveawayFormValues} input
 * @param {{ userId?: string | null }} [options]
 */
export async function createDraft(input, { userId = null } = {}) {
  const payload = await normalizeAndValidateGiveawayInput(input);

  const { data, error } = await requireClient()
    .from("giveaways")
    .insert({
      ...payload,
      status: "draft",
      is_archived: false,
      created_by: userId,
      updated_by: userId,
    })
    .select("id, status")
    .single();

  if (error) throw error;
  return { id: data.id, status: data.status };
}

/**
 * @param {string} id
 * @param {GiveawayFormValues} input
 * @param {{ userId?: string | null }} [options]
 */
export async function updateGiveaway(id, input, { userId = null } = {}) {
  const existing = await requireGiveaway(id);
  if (existing.is_archived) {
    throw new GiveawayValidationError(
      {},
      "Cannot edit an archived giveaway."
    );
  }
  if (existing.status === "completed" || existing.status === "cancelled") {
    throw new GiveawayValidationError(
      {},
      "Cannot edit a completed or cancelled giveaway."
    );
  }

  const payload = await normalizeAndValidateGiveawayInput(input);
  // Do not clear winner fields via form update
  const row = await applyGiveawayPatch(id, payload, { userId });
  return { id: row.id, status: row.status };
}

/**
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function publish(id, { userId = null } = {}) {
  const row = await requireGiveaway(id);
  if (row.is_archived) {
    throw new GiveawayValidationError({}, "Cannot publish an archived giveaway.");
  }
  if (row.status !== "draft") {
    throw new GiveawayValidationError(
      {},
      `Cannot publish: status must be draft (currently ${row.status}).`
    );
  }
  if (!row.title?.trim() || !row.prize?.trim()) {
    throw new GiveawayValidationError(
      {},
      "Cannot publish: title and prize are required."
    );
  }
  if (!Array.isArray(row.eligible_tournament_ids) || row.eligible_tournament_ids.length === 0) {
    throw new GiveawayValidationError(
      {},
      "Cannot publish: select at least one eligible tournament."
    );
  }

  const eligibility = await computeEligibility(row.eligible_tournament_ids);
  if (eligibility.stats.uniqueEligiblePlayers < 1) {
    throw new GiveawayValidationError(
      {},
      "Cannot publish: selected tournaments have no eligible registered players."
    );
  }

  const fresh = await applyGiveawayPatch(
    id,
    {
      status: "published",
      published_at: new Date().toISOString(),
    },
    { userId }
  );
  await logGiveawayActivity("giveaway_created", fresh);
  return { id: fresh.id, status: fresh.status };
}

/**
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function closeEntries(id, { userId = null } = {}) {
  const row = await requireGiveaway(id);
  if (row.is_archived) {
    throw new GiveawayValidationError({}, "Cannot close entries on an archived giveaway.");
  }
  if (row.status !== "published") {
    throw new GiveawayValidationError(
      {},
      `Cannot close entries: status must be published (currently ${row.status}).`
    );
  }

  const fresh = await applyGiveawayPatch(
    id,
    { status: "entries_closed" },
    { userId }
  );
  return { id: fresh.id, status: fresh.status };
}

/**
 * Record the official winner after an external Wheel of Names draw.
 * Snapshots player name/discord from the eligible list — no manual typing.
 *
 * @param {string} id
 * @param {{ playerId: string, notes?: string, userId?: string | null }} options
 */
export async function recordWinner(id, { playerId, notes = "", userId = null }) {
  const row = await requireGiveaway(id);
  if (row.is_archived) {
    throw new GiveawayValidationError({}, "Cannot record a winner on an archived giveaway.");
  }
  if (row.status !== "entries_closed" && row.status !== "winner_selected") {
    throw new GiveawayValidationError(
      {},
      `Cannot record winner: status must be entries_closed (currently ${row.status}).`
    );
  }
  if (!playerId) {
    throw new GiveawayValidationError(
      { winnerPlayerId: "Select a winner from the eligible player list." },
      "Select a winner from the eligible player list."
    );
  }

  const eligibility = await computeEligibility(row.eligible_tournament_ids ?? []);
  const eligible = eligibility.players.find((p) => p.playerId === playerId);
  if (!eligible) {
    throw new GiveawayValidationError(
      { winnerPlayerId: "Winner must be chosen from the eligible player list." },
      "Winner must be chosen from the eligible player list."
    );
  }

  const fresh = await applyGiveawayPatch(
    id,
    {
      status: "winner_selected",
      winner_player_id: eligible.playerId,
      winner_name: eligible.playerName,
      winner_discord_name: eligible.discordName,
      winner_notes: String(notes ?? "").trim() || null,
    },
    { userId }
  );

  return {
    id: fresh.id,
    status: fresh.status,
    winnerName: fresh.winner_name,
  };
}

/**
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function complete(id, { userId = null } = {}) {
  const row = await requireGiveaway(id);
  if (row.is_archived) {
    throw new GiveawayValidationError({}, "Cannot complete an archived giveaway.");
  }
  if (row.status !== "winner_selected") {
    throw new GiveawayValidationError(
      {},
      `Cannot complete: status must be winner_selected (currently ${row.status}).`
    );
  }
  if (!row.winner_player_id || !row.winner_name) {
    throw new GiveawayValidationError(
      {},
      "Cannot complete: record a winner first."
    );
  }

  const fresh = await applyGiveawayPatch(
    id,
    {
      status: "completed",
      completed_at: new Date().toISOString(),
    },
    { userId }
  );
  await logGiveawayActivity("giveaway_completed", fresh);
  return { id: fresh.id, status: fresh.status };
}

/**
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function cancel(id, { userId = null } = {}) {
  const row = await requireGiveaway(id);
  if (row.is_archived) {
    throw new GiveawayValidationError({}, "Cannot cancel an archived giveaway.");
  }
  if (row.status === "cancelled") {
    throw new GiveawayValidationError({}, "This giveaway is already cancelled.");
  }
  if (row.status === "completed") {
    throw new GiveawayValidationError({}, "Cannot cancel a completed giveaway.");
  }

  const fresh = await applyGiveawayPatch(
    id,
    { status: "cancelled" },
    { userId }
  );
  return { id: fresh.id, status: fresh.status };
}

/**
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function archive(id, { userId = null } = {}) {
  const row = await requireGiveaway(id);
  if (row.is_archived) {
    throw new GiveawayValidationError({}, "This giveaway is already archived.");
  }

  const fresh = await applyGiveawayPatch(
    id,
    { is_archived: true },
    { userId }
  );
  return { id: fresh.id, status: fresh.status, isArchived: true };
}
