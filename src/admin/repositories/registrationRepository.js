/**
 * Admin read access to tournament registrations.
 * Read-only — registration writes stay on the public registration flow
 * (src/lib/supabase/registrations.js). Admin pages must use this module,
 * never call Supabase tables directly.
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
 * List registrations for a tournament, newest first.
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
    .order("registered_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapAdminRegistrationRow);
}
