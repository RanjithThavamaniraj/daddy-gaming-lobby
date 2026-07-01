/**
 * Registration flow for individual players.
 *
 * Stores registrations against the existing `tournament_registrations` table
 * (migration 20260628100003). No new tables, no schema changes.
 *
 * RLS (migration 20260628100007_dgl_rls_policies.sql) allows anon INSERT on
 * `players` and `tournament_registrations` (player_id required, team_id null,
 * status in pending/confirmed). The form payload lives inside `form_data`.
 */

import { getSupabaseClient } from "../../supabase";

/**
 * Resolve or create a `players` row for a Discord username.
 * Display names are case-insensitively unique (players.display_name_key).
 *
 * @param {string} discordUsername
 * @returns {Promise<{ id: string; isNew: boolean }>}
 */
async function resolveOrCreatePlayer(discordUsername) {
  const supabase = getSupabaseClient();
  const trimmed = discordUsername.trim();
  const key = trimmed.toLowerCase();

  const { data: existing, error: selectError } = await supabase
    .from("players")
    .select("id")
    .eq("display_name_key", key)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return { id: existing.id, isNew: false };

  const { data: created, error: insertError } = await supabase
    .from("players")
    .insert({ display_name: trimmed, discord_username: trimmed })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return { id: created.id, isNew: true };
}

/**
 * Register an individual player for a tournament.
 *
 * @param {object} params
 * @param {string} params.tournamentId - Tournament UUID (tournaments.id)
 * @param {string} params.discordUsername - Required Discord username
 * @param {Record<string, unknown>} [params.extraFormData] - Future tournament fields
 * @returns {Promise<{ registrationId: string; playerId: string; duplicate: boolean }>}
 */
export async function registerForTournament({
  tournamentId,
  discordUsername,
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

  const { id: playerId } = await resolveOrCreatePlayer(trimmed);

  const formData = { discord_username: trimmed, ...extraFormData };

  const { data, error } = await supabase
    .from("tournament_registrations")
    .insert({
      tournament_id: tournamentId,
      player_id: playerId,
      status: "confirmed",
      form_data: formData,
    })
    .select("id")
    .single();

  if (error) {
    // 23505 unique violation → already registered this tournament/player.
    if (error.code === "23505") {
      return { registrationId: null, playerId, duplicate: true };
    }
    throw error;
  }

  return { registrationId: data.id, playerId, duplicate: false };
}

/**
 * Mark a tournament as registered for the current browser session.
 * Prevents duplicate Supabase registration checks during the same session.
 *
 * @param {string} tournamentId
 * @returns {void}
 */
export function markRegisteredForTournament(tournamentId) {
  if (!tournamentId) return;

  const PREFIX = "dgl:registration:";
  try {
    sessionStorage.setItem(`${PREFIX}${tournamentId}`, "1");
  } catch {
    /* sessionStorage unavailable — ignore */
  }
}

/**
 * Check if a tournament is already registered in the current browser session.
 *
 * @param {string} tournamentId
 * @returns {boolean}
 */
export function isRegisteredForTournament(tournamentId) {
  if (!tournamentId) return false;

  const PREFIX = "dgl:registration:";
  try {
    return sessionStorage.getItem(`${PREFIX}${tournamentId}`) === "1";
  } catch {
    return false;
  }
}