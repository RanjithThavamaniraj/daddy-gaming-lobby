/**
 * Admin registration + reserve actions (Phase 3A).
 */

import { getSupabaseClient, getSupabaseConfigIssues } from "../../supabase";

/** @typedef {{ id: string, playerName: string, rocketLeagueRank: string | null, teamName: string | null, needsTeammate: boolean, teammateDisplayName: string | null, epicId: string | null, status: string, registeredAt: string }} AdminRegistrationRow */

function requireClient() {
  const issues = getSupabaseConfigIssues();
  if (issues.length > 0) {
    throw new Error(issues.join(" "));
  }
  return getSupabaseClient();
}

/**
 * @param {object} row
 * @returns {AdminRegistrationRow}
 */
function mapAdminRegistrationRow(row) {
  return {
    id: row.id,
    playerName: row.players?.display_name ?? row.form_data?.discord_username ?? "—",
    rocketLeagueRank: row.rocket_league_rank ?? null,
    teamName: row.team_name ?? null,
    needsTeammate: Boolean(row.needs_teammate),
    teammateDisplayName: row.teammate_display_name ?? null,
    epicId: row.epic_id ?? null,
    status: row.status,
    registeredAt: row.registered_at,
  };
}

/**
 * @param {string} status
 * @returns {string}
 */
export function formatRegistrationStatus(status) {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "waitlist":
      return "Reserve";
    case "withdrawn":
      return "Withdrawn";
    case "checked_in":
      return "Checked In";
    case "pending":
      return "Pending";
    default:
      return status || "—";
  }
}

/**
 * List registrations for a tournament (oldest first for reserve order).
 * @param {string} tournamentId
 * @returns {Promise<AdminRegistrationRow[]>}
 */
export async function listRegistrationsForTournament(tournamentId) {
  if (!tournamentId) return [];

  const { data, error } = await requireClient()
    .from("tournament_registrations")
    .select(
      `
      id,
      status,
      registered_at,
      form_data,
      epic_id,
      rocket_league_rank,
      team_name,
      needs_teammate,
      teammate_display_name,
      players ( display_name )
    `
    )
    .eq("tournament_id", tournamentId)
    .order("registered_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map(mapAdminRegistrationRow);
}

/**
 * @param {string} registrationId
 */
export async function promoteReserveRegistration(registrationId) {
  const { data, error } = await requireClient().rpc(
    "dgl_promote_reserve_registration",
    { p_registration_id: registrationId }
  );
  if (error) throw error;
  return data;
}

/**
 * @param {string} registrationId
 */
export async function withdrawRegistration(registrationId) {
  const { data, error } = await requireClient().rpc("dgl_withdraw_registration", {
    p_registration_id: registrationId,
  });
  if (error) throw error;
  return data;
}

/**
 * @param {string} registrationId
 * @param {'up' | 'down'} direction
 */
export async function swapReserveOrder(registrationId, direction) {
  const { error } = await requireClient().rpc("dgl_swap_reserve_order", {
    p_registration_id: registrationId,
    p_direction: direction,
  });
  if (error) throw error;
}
