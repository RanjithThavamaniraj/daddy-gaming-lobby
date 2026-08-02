/**
 * Entity-agnostic community_activity helpers.
 * Always inserts a NEW row (new id + occurred_at).
 * Used by giveaway republish now; tournaments/leagues/events can reuse later.
 *
 * Does NOT implement lifecycle idempotency — callers that need "once per entity"
 * (e.g. publish) must check before calling insertCommunityActivity.
 */

import { getSupabaseClient, getSupabaseConfigIssues } from "../../supabase";

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
 * Force-insert a community_activity row for Jarvis / site feed.
 *
 * @param {{
 *   activityType: string,
 *   title: string,
 *   summary?: string | null,
 *   payload?: Record<string, unknown>,
 *   tournamentId?: string | null,
 *   isPublic?: boolean,
 *   occurredAt?: string | null,
 * }} input
 * @returns {Promise<{ id: string }>}
 */
export async function insertCommunityActivity({
  activityType,
  title,
  summary = null,
  payload = {},
  tournamentId = null,
  isPublic = true,
  occurredAt = null,
}) {
  if (!activityType || !String(activityType).trim()) {
    throw new Error("insertCommunityActivity requires activityType.");
  }
  if (!title || !String(title).trim()) {
    throw new Error("insertCommunityActivity requires title.");
  }

  const { data, error } = await requireClient()
    .from("community_activity")
    .insert({
      activity_type: String(activityType).trim(),
      title: String(title).trim(),
      summary: summary == null || summary === "" ? null : String(summary),
      tournament_id: tournamentId || null,
      payload: payload && typeof payload === "object" ? payload : {},
      occurred_at: occurredAt || new Date().toISOString(),
      is_public: Boolean(isPublic),
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}

/**
 * Append-only admin audit entry.
 *
 * @param {{
 *   adminUserId?: string | null,
 *   action: string,
 *   entityType: string,
 *   entityId?: string | null,
 *   tournamentId?: string | null,
 *   oldValue?: Record<string, unknown>,
 *   newValue?: Record<string, unknown>,
 * }} input
 * @returns {Promise<{ id: string } | null>}
 */
export async function writeAdminAuditLog({
  adminUserId = null,
  action,
  entityType,
  entityId = null,
  tournamentId = null,
  oldValue = {},
  newValue = {},
}) {
  if (!action || !entityType) {
    throw new Error("writeAdminAuditLog requires action and entityType.");
  }

  const { data, error } = await requireClient()
    .from("admin_audit_log")
    .insert({
      admin_user_id: adminUserId || null,
      action: String(action).trim(),
      entity_type: String(entityType).trim(),
      entity_id: entityId || null,
      tournament_id: tournamentId || null,
      old_value: oldValue && typeof oldValue === "object" ? oldValue : {},
      new_value: newValue && typeof newValue === "object" ? newValue : {},
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}
