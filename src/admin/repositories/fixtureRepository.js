/**
 * Admin fixture / bracket operations (Phase 2).
 * Uses SECURITY DEFINER RPCs — never raw table writes from the client.
 */

import { getSupabaseClient, getSupabaseConfigIssues } from "../../supabase";
import { fetchTournamentBracket } from "../../lib/supabase/tournamentBracket";

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
 * @param {string} tournamentId
 */
export async function loadAdminBracket(tournamentId) {
  return fetchTournamentBracket(tournamentId);
}

/**
 * @param {string} tournamentId
 * @returns {Promise<number>}
 */
export async function runGroupDraw(tournamentId) {
  const { data, error } = await requireClient().rpc("run_group_draw", {
    p_tournament_id: tournamentId,
  });
  if (error) throw error;
  return data;
}

/**
 * @param {string} fixtureId
 * @param {'scheduled' | 'live'} status
 */
export async function setFixtureStatus(fixtureId, status) {
  const { data, error } = await requireClient().rpc("dgl_set_fixture_status", {
    p_fixture_id: fixtureId,
    p_status: status,
  });
  if (error) throw error;
  return data;
}

/**
 * @param {object} params
 * @param {string} params.fixtureId
 * @param {string} params.winnerId
 * @param {number | null} [params.player1Score]
 * @param {number | null} [params.player2Score]
 */
export async function recordFixtureResult({
  fixtureId,
  winnerId,
  player1Score = null,
  player2Score = null,
}) {
  const { data, error } = await requireClient().rpc("dgl_record_fixture_result", {
    p_fixture_id: fixtureId,
    p_winner_id: winnerId,
    p_player1_score: player1Score,
    p_player2_score: player2Score,
  });
  if (error) throw error;
  return data;
}

/**
 * @param {string} fixtureId
 * @param {string | null} scheduledAtIso
 */
export async function setFixtureSchedule(fixtureId, scheduledAtIso) {
  const { data, error } = await requireClient().rpc("dgl_set_fixture_schedule", {
    p_fixture_id: fixtureId,
    p_scheduled_at: scheduledAtIso,
  });
  if (error) throw error;
  return data;
}
