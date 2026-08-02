/**
 * Admin tournament data access.
 * Admin pages must use this module — never call Supabase Auth or tables directly.
 *
 * Phase 4A: list + dashboard counts
 * Phase 4B: create draft + edit
 * Phase 4C: lifecycle transitions
 * Phase 5: community_activity event pipeline for Jarvis (via logTournamentActivity)
 *           tournament_completed remains owned by the DB trigger only
 */

import { getSupabaseClient, getSupabaseConfigIssues } from "../../supabase";
import {
  createEmptyTournamentFormValues,
  dateTimeLocalToIso,
  isoToDateTimeLocal,
} from "../lib/tournamentFormDefaults";

/** @typedef {import("../lib/adminTournamentList").AdminTournamentRow} AdminTournamentRow */
/** @typedef {import("../lib/tournamentFormDefaults").TournamentFormValues} TournamentFormValues */

const ADMIN_LIST_SELECT = `
  id,
  global_number,
  slug,
  championship_label,
  game_championship_number,
  status,
  is_featured,
  is_archived,
  registration_limit,
  registration_opens_at,
  starts_at,
  created_at,
  games (
    id,
    name,
    slug
  ),
  tournament_series (
    event_type
  )
`.replace(/\s+/g, " ").trim();

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EXTERNAL_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Field-level validation failure returned to the form.
 */
export class TournamentValidationError extends Error {
  /**
   * @param {Record<string, string>} fieldErrors
   * @param {string} [message]
   */
  constructor(fieldErrors, message = "Please fix the highlighted fields.") {
    super(message);
    this.name = "TournamentValidationError";
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
 * @returns {AdminTournamentRow}
 */
function mapAdminTournamentRow(row) {
  const eventType = row.tournament_series?.event_type ?? "championship";
  const gameName = row.games?.name ?? "—";
  const championshipNumber = row.game_championship_number ?? null;

  let championshipName;
  if (eventType === "saturday_showdown") {
    championshipName = `DGL ${row.championship_label} Saturday Showdown #${championshipNumber ?? "?"}`;
  } else {
    championshipName = `DGL ${row.championship_label} Championship #${championshipNumber ?? "?"}`;
  }

  return {
    id: row.id,
    slug: row.slug ?? null,
    globalNumber: row.global_number,
    tournamentNumber: `Tournament #${row.global_number}`,
    championshipName,
    championshipLabel: row.championship_label,
    gameChampionshipNumber: championshipNumber,
    game: gameName,
    gameSlug: row.games?.slug ?? null,
    status: row.status,
    isFeatured: Boolean(row.is_featured),
    isArchived: Boolean(row.is_archived),
    registrationLimit: row.registration_limit ?? null,
    registrationOpensAt: row.registration_opens_at ?? null,
    startsAt: row.starts_at ?? null,
    createdAt: row.created_at ?? null,
    eventType,
  };
}

/**
 * @param {object} row
 * @returns {{ values: TournamentFormValues, meta: object }}
 */
function mapRowToForm(row) {
  const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata : {};

  return {
    values: {
      championshipLabel: row.championship_label ?? "",
      gameId: row.game_id ?? "",
      seriesId: row.series_id ?? "",
      externalId: row.external_id ?? "",
      slug: row.slug ?? "",
      participationMode: row.participation_mode === "solo" ? "solo" : "team",
      format: row.format ?? "",
      matchType: row.match_type ?? "",
      prizePoolDisplay: row.prize_pool_display ?? "",
      prizePoolAmount:
        row.prize_pool_amount == null ? "" : String(row.prize_pool_amount),
      accentColor: row.accent_color ?? "",
      registrationLimit:
        row.registration_limit == null ? "" : String(row.registration_limit),
      registrationOpensAt: isoToDateTimeLocal(row.registration_opens_at),
      registrationClosesAt: isoToDateTimeLocal(row.registration_closes_at),
      startsAt: isoToDateTimeLocal(row.starts_at),
      entryFee: metadata.entry_fee != null ? String(metadata.entry_fee) : "",
    },
    meta: {
      id: row.id,
      globalNumber: row.global_number,
      tournamentNumber: `Tournament #${row.global_number}`,
      status: row.status,
      isFeatured: Boolean(row.is_featured),
      isArchived: Boolean(row.is_archived),
    },
  };
}

/**
 * Normalize + validate form values. Throws TournamentValidationError.
 * @param {TournamentFormValues} input
 * @param {{ excludeId?: string | null }} [options]
 * @returns {Promise<object>} DB-ready payload (without attribution / status)
 */
async function normalizeAndValidateTournamentInput(input, { excludeId = null } = {}) {
  /** @type {Record<string, string>} */
  const fieldErrors = {};

  const championshipLabel = String(input.championshipLabel ?? "").trim();
  const gameId = String(input.gameId ?? "").trim();
  const seriesId = String(input.seriesId ?? "").trim();
  const externalId = String(input.externalId ?? "").trim().toLowerCase();
  const slug = String(input.slug ?? "").trim().toLowerCase();
  const participationMode =
    input.participationMode === "solo" ? "solo" : "team";
  const format = String(input.format ?? "").trim();
  const matchType = String(input.matchType ?? "").trim();
  const prizePoolDisplay = String(input.prizePoolDisplay ?? "").trim();
  const accentColor = String(input.accentColor ?? "").trim();
  const entryFee = String(input.entryFee ?? "").trim();
  const prizePoolAmountRaw = String(input.prizePoolAmount ?? "").trim();
  const registrationLimitRaw = String(input.registrationLimit ?? "").trim();

  if (!championshipLabel) {
    fieldErrors.championshipLabel = "Championship label is required.";
  } else if (championshipLabel.length > 80) {
    fieldErrors.championshipLabel = "Keep the championship label under 80 characters.";
  }

  if (!gameId) {
    fieldErrors.gameId = "Select a game.";
  }

  if (!externalId) {
    fieldErrors.externalId = "External ID is required.";
  } else if (!EXTERNAL_ID_PATTERN.test(externalId)) {
    fieldErrors.externalId =
      "Use lowercase letters, numbers, and hyphens only (e.g. dgl-valorant-championship-1).";
  }

  if (!slug) {
    fieldErrors.slug = "Slug is required.";
  } else if (!SLUG_PATTERN.test(slug)) {
    fieldErrors.slug =
      "Use lowercase letters, numbers, and hyphens only (e.g. valorant-1).";
  }

  let prizePoolAmount = null;
  if (prizePoolAmountRaw) {
    prizePoolAmount = Number(prizePoolAmountRaw);
    if (!Number.isFinite(prizePoolAmount) || prizePoolAmount < 0) {
      fieldErrors.prizePoolAmount = "Prize pool amount must be a non-negative number.";
    }
  }

  let registrationLimit = null;
  if (registrationLimitRaw) {
    registrationLimit = Number.parseInt(registrationLimitRaw, 10);
    if (
      !Number.isInteger(registrationLimit) ||
      registrationLimit <= 0
    ) {
      fieldErrors.registrationLimit =
        "Registration limit must be a whole number greater than 0.";
    }
  }

  const registrationOpensAt = dateTimeLocalToIso(input.registrationOpensAt);
  const registrationClosesAt = dateTimeLocalToIso(input.registrationClosesAt);
  const startsAt = dateTimeLocalToIso(input.startsAt);

  if (input.registrationOpensAt?.trim() && !registrationOpensAt) {
    fieldErrors.registrationOpensAt = "Enter a valid registration opens date.";
  }
  if (input.registrationClosesAt?.trim() && !registrationClosesAt) {
    fieldErrors.registrationClosesAt = "Enter a valid registration closes date.";
  }
  if (input.startsAt?.trim() && !startsAt) {
    fieldErrors.startsAt = "Enter a valid tournament start date.";
  }

  if (registrationOpensAt && registrationClosesAt) {
    if (new Date(registrationOpensAt) > new Date(registrationClosesAt)) {
      fieldErrors.registrationClosesAt =
        "Registration must close on or after it opens.";
    }
  }

  if (registrationOpensAt && startsAt) {
    if (new Date(registrationOpensAt) > new Date(startsAt)) {
      fieldErrors.startsAt =
        "Tournament start must be on or after registration opens.";
    }
  }

  if (registrationClosesAt && startsAt) {
    if (new Date(registrationClosesAt) > new Date(startsAt)) {
      fieldErrors.startsAt =
        "Tournament start must be on or after registration closes.";
    }
  }

  if (accentColor && !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(accentColor)) {
    fieldErrors.accentColor = "Accent color must be a hex value like #a855f7.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new TournamentValidationError(fieldErrors);
  }

  const client = requireClient();

  const { data: game, error: gameError } = await client
    .from("games")
    .select("id, accent_color")
    .eq("id", gameId)
    .maybeSingle();

  if (gameError) throw gameError;
  if (!game) {
    throw new TournamentValidationError({
      gameId: "Selected game was not found.",
    });
  }

  if (seriesId) {
    const { data: series, error: seriesError } = await client
      .from("tournament_series")
      .select("id, game_id")
      .eq("id", seriesId)
      .maybeSingle();

    if (seriesError) throw seriesError;
    if (!series) {
      throw new TournamentValidationError({
        seriesId: "Selected series was not found.",
      });
    }
    if (series.game_id !== gameId) {
      throw new TournamentValidationError({
        seriesId: "Series must belong to the selected game.",
      });
    }
  }

  const { data: externalConflict, error: externalError } = await client
    .from("tournaments")
    .select("id")
    .eq("external_id", externalId)
    .maybeSingle();

  if (externalError) throw externalError;
  if (externalConflict && externalConflict.id !== excludeId) {
    throw new TournamentValidationError({
      externalId: "This external ID is already in use.",
    });
  }

  const { data: slugConflict, error: slugError } = await client
    .from("tournaments")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (slugError) throw slugError;
  if (slugConflict && slugConflict.id !== excludeId) {
    throw new TournamentValidationError({
      slug: "This slug is already in use.",
    });
  }

  const metadata = {};
  if (entryFee) metadata.entry_fee = entryFee;

  return {
    championship_label: championshipLabel,
    game_id: gameId,
    series_id: seriesId || null,
    external_id: externalId,
    slug,
    participation_mode: participationMode,
    format: format || null,
    match_type: matchType || null,
    prize_pool_display: prizePoolDisplay || null,
    prize_pool_amount: prizePoolAmount,
    prize_pool_currency: "INR",
    accent_color: accentColor || game.accent_color || null,
    registration_limit: registrationLimit,
    registration_opens_at: registrationOpensAt,
    registration_closes_at: registrationClosesAt,
    starts_at: startsAt,
    metadata,
  };
}

/**
 * @returns {Promise<number>}
 */
async function nextGlobalNumber() {
  const { data, error } = await requireClient()
    .from("tournaments")
    .select("global_number")
    .order("global_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.global_number ?? 0) + 1;
}

/**
 * Games available for the tournament form.
 * @returns {Promise<{ id: string, name: string, slug: string, accentColor: string, defaultParticipationMode: string }[]>}
 */
export async function listGamesForTournamentForm() {
  const { data, error } = await requireClient()
    .from("games")
    .select("id, name, slug, accent_color, default_participation_mode, sort_order")
    .neq("status", "archived")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    accentColor: row.accent_color,
    defaultParticipationMode: row.default_participation_mode,
  }));
}

/**
 * Optional series picker for the tournament form.
 * @returns {Promise<{ id: string, name: string, gameId: string, eventType: string }[]>}
 */
export async function listSeriesForTournamentForm() {
  const { data, error } = await requireClient()
    .from("tournament_series")
    .select("id, name, game_id, event_type")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    gameId: row.game_id,
    eventType: row.event_type ?? "championship",
  }));
}

/**
 * List tournaments for the admin management screen (includes drafts).
 * @param {object} [options]
 * @param {boolean} [options.includeArchived=false]
 * @returns {Promise<AdminTournamentRow[]>}
 */
export async function listTournaments({ includeArchived = false } = {}) {
  let query = requireClient()
    .from("tournaments")
    .select(ADMIN_LIST_SELECT)
    .order("global_number", { ascending: false });

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapAdminTournamentRow);
}

/**
 * Lightweight status counts for dashboard cards (non-archived by default).
 * @param {object} [options]
 * @param {boolean} [options.includeArchived=false]
 */
export async function getTournamentDashboardCounts({ includeArchived = false } = {}) {
  let query = requireClient().from("tournaments").select("status");

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;
  if (error) throw error;

  const counts = {
    draft: 0,
    upcoming: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  };

  for (const row of data ?? []) {
    counts.total += 1;
    const status = row.status;

    if (status === "draft") {
      counts.draft += 1;
    } else if (
      status === "coming_soon" ||
      status === "registration_open" ||
      status === "registration_closed"
    ) {
      counts.upcoming += 1;
    } else if (status === "active") {
      counts.active += 1;
    } else if (status === "completed") {
      counts.completed += 1;
    } else if (status === "cancelled") {
      counts.cancelled += 1;
    }
  }

  return counts;
}

/**
 * @param {string} id
 * @returns {Promise<object | null>}
 */
export async function getTournamentById(id) {
  if (!id) return null;

  const { data, error } = await requireClient()
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

/**
 * Load a tournament shaped for TournamentForm.
 * @param {string} id
 * @returns {Promise<{ values: TournamentFormValues, meta: object } | null>}
 */
export async function getTournamentFormById(id) {
  const row = await getTournamentById(id);
  if (!row) return null;
  return mapRowToForm(row);
}

/**
 * @param {string} slug
 * @returns {Promise<object | null>}
 */
export async function getTournamentBySlug(slug) {
  if (!slug) return null;

  const { data, error } = await requireClient()
    .from("tournaments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

/**
 * @param {string} status
 * @param {object} [options]
 * @param {boolean} [options.includeArchived=false]
 * @returns {Promise<AdminTournamentRow[]>}
 */
export async function listTournamentsByStatus(status, { includeArchived = false } = {}) {
  const all = await listTournaments({ includeArchived });
  return all.filter((row) => row.status === status);
}

/**
 * Create a new tournament as a draft.
 * @param {TournamentFormValues} input
 * @param {{ userId?: string | null }} [options]
 * @returns {Promise<{ id: string, globalNumber: number, status: string }>}
 */
export async function createTournamentDraft(input, { userId = null } = {}) {
  const payload = await normalizeAndValidateTournamentInput(input);
  const globalNumber = await nextGlobalNumber();

  const { data, error } = await requireClient()
    .from("tournaments")
    .insert({
      ...payload,
      global_number: globalNumber,
      status: "draft",
      is_featured: false,
      is_archived: false,
      created_by: userId,
      updated_by: userId,
    })
    .select("id, global_number, status")
    .single();

  if (error) {
    if (error.code === "23505") {
      const message = String(error.message ?? "");
      if (message.includes("external_id")) {
        throw new TournamentValidationError({
          externalId: "This external ID is already in use.",
        });
      }
      if (message.includes("slug")) {
        throw new TournamentValidationError({
          slug: "This slug is already in use.",
        });
      }
      if (message.includes("global_number")) {
        throw new Error("Could not assign a tournament number. Please try again.");
      }
    }
    throw error;
  }

  const fresh = await getTournamentById(data.id);
  if (fresh) {
    await logTournamentActivity("tournament_created", fresh);
  }

  return {
    id: data.id,
    globalNumber: data.global_number,
    status: data.status,
  };
}

/**
 * Update an existing tournament's editable fields.
 * Does not publish, archive, feature, cancel, or change status.
 * @param {string} id
 * @param {TournamentFormValues} input
 * @param {{ userId?: string | null }} [options]
 * @returns {Promise<{ id: string, globalNumber: number, status: string }>}
 */
export async function updateTournamentDraft(id, input, { userId = null } = {}) {
  if (!id) {
    throw new Error("Tournament id is required.");
  }

  const existing = await getTournamentById(id);
  if (!existing) {
    throw new Error("Tournament not found.");
  }

  const payload = await normalizeAndValidateTournamentInput(input, {
    excludeId: id,
  });

  const existingMetadata =
    existing.metadata && typeof existing.metadata === "object"
      ? existing.metadata
      : {};
  const nextMetadata = { ...existingMetadata, ...payload.metadata };
  if (!String(input.entryFee ?? "").trim()) {
    delete nextMetadata.entry_fee;
  }

  const { data, error } = await requireClient()
    .from("tournaments")
    .update({
      ...payload,
      metadata: nextMetadata,
      updated_by: userId,
    })
    .eq("id", id)
    .select("id, global_number, status")
    .single();

  if (error) {
    if (error.code === "23505") {
      const message = String(error.message ?? "");
      if (message.includes("external_id")) {
        throw new TournamentValidationError({
          externalId: "This external ID is already in use.",
        });
      }
      if (message.includes("slug")) {
        throw new TournamentValidationError({
          slug: "This slug is already in use.",
        });
      }
    }
    throw error;
  }

  return {
    id: data.id,
    globalNumber: data.global_number,
    status: data.status,
  };
}

/**
 * @returns {TournamentFormValues}
 */
export function getEmptyTournamentFormValues() {
  return createEmptyTournamentFormValues();
}

// ---------------------------------------------------------------------------
// Phase 5 — community_activity event pipeline (Jarvis / site feed)
// ---------------------------------------------------------------------------

/** One-shot types: at most one row per (tournament_id, activity_type). */
const IDEMPOTENT_ACTIVITY_TYPES = new Set([
  "tournament_created",
  "tournament_announced",
  "registration_opened",
  "registration_closed",
  "tournament_started",
  "tournament_cancelled",
  "tournament_archived",
]);

/** @type {Record<string, { title: (row: object, game: string) => string, summary: (row: object) => string }>} */
const ACTIVITY_COPY = {
  tournament_created: {
    title: (row) => `Draft created · Tournament #${row.global_number}`,
    summary: (row) => `${row.championship_label} saved as a draft`,
  },
  tournament_announced: {
    title: (row) => `📢 ${row.championship_label} announced`,
    summary: (row) => `Tournament #${row.global_number} is now coming soon`,
  },
  registration_opened: {
    title: (row) => `Registration open · ${row.championship_label}`,
    summary: (row) => `Tournament #${row.global_number} is accepting registrations`,
  },
  registration_closed: {
    title: (row) => `Registration closed · ${row.championship_label}`,
    summary: (row) => `Tournament #${row.global_number} registrations are closed`,
  },
  tournament_started: {
    title: (row) => `🔴 Live · ${row.championship_label}`,
    summary: (row) => `Tournament #${row.global_number} has started`,
  },
  tournament_cancelled: {
    title: (row) => `Cancelled · ${row.championship_label}`,
    summary: (row) => `Tournament #${row.global_number} was cancelled`,
  },
  tournament_archived: {
    title: (row) => `Archived · ${row.championship_label}`,
    summary: (row) => `Tournament #${row.global_number} was archived`,
  },
  tournament_featured: {
    title: (row) => `⭐ Featured · ${row.championship_label}`,
    summary: (row) => `Tournament #${row.global_number} is the Main Event`,
  },
};

/**
 * Stable Jarvis payload contract (one shape for all lifecycle events).
 * @param {object} row - tournaments row (post-transition)
 * @param {string} gameName
 */
function buildTournamentActivityPayload(row, gameName) {
  return {
    tournament_id: row.id,
    global_number: row.global_number,
    slug: row.slug ?? null,
    external_id: row.external_id ?? null,
    game: gameName || null,
    game_id: row.game_id ?? null,
    championship_label: row.championship_label ?? null,
    status: row.status ?? null,
    registration_limit: row.registration_limit ?? null,
    prize_pool_display: row.prize_pool_display ?? null,
    start_at: row.starts_at ?? null,
    registration_opens_at: row.registration_opens_at ?? null,
    registration_closes_at: row.registration_closes_at ?? null,
    featured: Boolean(row.is_featured),
    is_archived: Boolean(row.is_archived),
    game_championship_number: row.game_championship_number ?? null,
  };
}

/**
 * @param {string | null | undefined} gameId
 * @returns {Promise<string>}
 */
async function resolveGameName(gameId) {
  if (!gameId) return "";
  const { data, error } = await requireClient()
    .from("games")
    .select("name")
    .eq("id", gameId)
    .maybeSingle();
  if (error) throw error;
  return data?.name ?? "";
}

/**
 * Central insert for tournament lifecycle → community_activity.
 * Does NOT handle tournament_completed (owned by DB trigger).
 *
 * @param {string} activityType
 * @param {object} tournamentRow - row after the lifecycle write
 * @returns {Promise<{ id: string } | null>} inserted row, or null if idempotent skip
 */
async function logTournamentActivity(activityType, tournamentRow) {
  if (!tournamentRow?.id) {
    throw new Error("logTournamentActivity requires a tournament row with id.");
  }

  if (activityType === "tournament_completed") {
    // Completion is owned exclusively by dgl_log_tournament_completed_activity.
    return null;
  }

  const copy = ACTIVITY_COPY[activityType];
  if (!copy) {
    throw new Error(`Unsupported activity type for logging: ${activityType}`);
  }

  const client = requireClient();

  if (IDEMPOTENT_ACTIVITY_TYPES.has(activityType)) {
    const { data: existing, error: existingError } = await client
      .from("community_activity")
      .select("id")
      .eq("tournament_id", tournamentRow.id)
      .eq("activity_type", activityType)
      .limit(1)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing?.id) {
      return { id: existing.id };
    }
  }

  const gameName = await resolveGameName(tournamentRow.game_id);
  const payload = buildTournamentActivityPayload(tournamentRow, gameName);

  const { data, error } = await client
    .from("community_activity")
    .insert({
      activity_type: activityType,
      title: copy.title(tournamentRow, gameName),
      summary: copy.summary(tournamentRow),
      tournament_id: tournamentRow.id,
      payload,
      occurred_at: new Date().toISOString(),
      is_public: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}

/**
 * Reload full tournament row after a patch/insert for activity logging.
 * @param {string} id
 */
async function loadTournamentForActivity(id) {
  return requireTournamentRow(id);
}

// ---------------------------------------------------------------------------
// Phase 4C — lifecycle actions (explicit transitions only)
// ---------------------------------------------------------------------------

/**
 * @param {string} id
 * @returns {Promise<object>}
 */
async function requireTournamentRow(id) {
  if (!id) {
    throw new TournamentValidationError(
      {},
      "Tournament id is required."
    );
  }
  const row = await getTournamentById(id);
  if (!row) {
    throw new TournamentValidationError({}, "Tournament not found.");
  }
  return row;
}

/**
 * @param {object} row
 * @param {string} actionLabel
 */
function assertNotArchived(row, actionLabel) {
  if (row.is_archived) {
    throw new TournamentValidationError(
      {},
      `Cannot ${actionLabel}: this tournament is archived.`
    );
  }
}

/**
 * @param {object} row
 * @param {string[]} allowed
 * @param {string} actionLabel
 */
function assertStatusIn(row, allowed, actionLabel) {
  if (!allowed.includes(row.status)) {
    const expected = allowed.join(" or ");
    throw new TournamentValidationError(
      {},
      `Cannot ${actionLabel}: status must be ${expected} (currently ${row.status}).`
    );
  }
}

/**
 * @param {string} id
 * @param {object} patch
 * @param {{ userId?: string | null }} [options]
 * @returns {Promise<{ id: string, globalNumber: number, status: string, isFeatured: boolean, isArchived: boolean }>}
 */
async function applyTournamentPatch(id, patch, { userId = null } = {}) {
  const { data, error } = await requireClient()
    .from("tournaments")
    .update({
      ...patch,
      updated_by: userId,
    })
    .eq("id", id)
    .select("id, global_number, status, is_featured, is_archived")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    globalNumber: data.global_number,
    status: data.status,
    isFeatured: Boolean(data.is_featured),
    isArchived: Boolean(data.is_archived),
  };
}

/**
 * Publish a draft → coming_soon.
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function publishTournament(id, { userId = null } = {}) {
  const row = await requireTournamentRow(id);
  assertNotArchived(row, "publish");
  assertStatusIn(row, ["draft"], "publish");

  if (!row.championship_label?.trim() || !row.game_id || !row.external_id || !row.slug) {
    throw new TournamentValidationError(
      {},
      "Cannot publish: championship label, game, external ID, and slug are required."
    );
  }

  const result = await applyTournamentPatch(
    id,
    { status: "coming_soon" },
    { userId }
  );
  const fresh = await loadTournamentForActivity(id);
  await logTournamentActivity("tournament_announced", fresh);
  return result;
}

/**
 * Feature this tournament as Main Event.
 * Relies on enforce_single_featured_tournament to unfeature others.
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function featureTournament(id, { userId = null } = {}) {
  const row = await requireTournamentRow(id);
  assertNotArchived(row, "feature");

  if (row.is_featured) {
    throw new TournamentValidationError(
      {},
      "This tournament is already featured."
    );
  }

  assertStatusIn(
    row,
    ["coming_soon", "registration_open", "registration_closed", "active"],
    "feature"
  );

  const result = await applyTournamentPatch(id, { is_featured: true }, { userId });
  const fresh = await loadTournamentForActivity(id);
  await logTournamentActivity("tournament_featured", fresh);
  return result;
}

/**
 * Archive without changing status.
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function archiveTournament(id, { userId = null } = {}) {
  const row = await requireTournamentRow(id);

  if (row.is_archived) {
    throw new TournamentValidationError(
      {},
      "This tournament is already archived."
    );
  }

  const result = await applyTournamentPatch(
    id,
    { is_archived: true, is_featured: false },
    { userId }
  );
  const fresh = await loadTournamentForActivity(id);
  await logTournamentActivity("tournament_archived", fresh);
  return result;
}

/**
 * Cancel → cancelled status.
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function cancelTournament(id, { userId = null } = {}) {
  const row = await requireTournamentRow(id);
  assertNotArchived(row, "cancel");

  if (row.status === "cancelled") {
    throw new TournamentValidationError(
      {},
      "This tournament is already cancelled."
    );
  }

  if (row.status === "completed") {
    throw new TournamentValidationError(
      {},
      "Cannot cancel a completed tournament."
    );
  }

  assertStatusIn(
    row,
    ["draft", "coming_soon", "registration_open", "registration_closed", "active"],
    "cancel"
  );

  const result = await applyTournamentPatch(
    id,
    { status: "cancelled", is_featured: false },
    { userId }
  );
  const fresh = await loadTournamentForActivity(id);
  await logTournamentActivity("tournament_cancelled", fresh);
  return result;
}

/**
 * coming_soon → registration_open
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function openRegistration(id, { userId = null } = {}) {
  const row = await requireTournamentRow(id);
  assertNotArchived(row, "open registration");
  assertStatusIn(row, ["coming_soon"], "open registration");

  const result = await applyTournamentPatch(
    id,
    { status: "registration_open" },
    { userId }
  );
  const fresh = await loadTournamentForActivity(id);
  await logTournamentActivity("registration_opened", fresh);
  return result;
}

/**
 * registration_open → registration_closed
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function closeRegistration(id, { userId = null } = {}) {
  const row = await requireTournamentRow(id);
  assertNotArchived(row, "close registration");
  assertStatusIn(row, ["registration_open"], "close registration");

  const result = await applyTournamentPatch(
    id,
    { status: "registration_closed" },
    { userId }
  );
  const fresh = await loadTournamentForActivity(id);
  await logTournamentActivity("registration_closed", fresh);
  return result;
}

/**
 * registration_open | registration_closed → active
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function startTournament(id, { userId = null } = {}) {
  const row = await requireTournamentRow(id);
  assertNotArchived(row, "start");
  assertStatusIn(
    row,
    ["registration_open", "registration_closed"],
    "start"
  );

  const result = await applyTournamentPatch(id, { status: "active" }, { userId });
  const fresh = await loadTournamentForActivity(id);
  await logTournamentActivity("tournament_started", fresh);
  return result;
}

/**
 * active → completed.
 * Does NOT write community_activity — DB trigger owns tournament_completed.
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 */
export async function completeTournament(id, { userId = null } = {}) {
  const row = await requireTournamentRow(id);
  assertNotArchived(row, "complete");
  assertStatusIn(row, ["active"], "complete");

  const completedAt = new Date().toISOString();
  const completedDateLabel = new Date(completedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return applyTournamentPatch(
    id,
    {
      status: "completed",
      completed_at: completedAt,
      completed_date_label: completedDateLabel,
      is_featured: false,
    },
    { userId }
  );
}

/**
 * @param {string} base
 * @param {"external_id" | "slug"} column
 * @returns {Promise<string>}
 */
async function allocateUniqueCopyValue(base, column) {
  const client = requireClient();
  const normalized = String(base || "tournament")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "tournament";

  for (let attempt = 1; attempt <= 50; attempt += 1) {
    const candidate =
      attempt === 1 ? `${normalized}-copy` : `${normalized}-copy-${attempt}`;

    const { data, error } = await client
      .from("tournaments")
      .select("id")
      .eq(column, candidate)
      .maybeSingle();

    if (error) throw error;
    if (!data) return candidate;
  }

  throw new TournamentValidationError(
    {},
    `Could not allocate a unique ${column.replace("_", " ")} for the duplicate.`
  );
}

/**
 * Duplicate as a new draft with new global number, external ID, and slug.
 * @param {string} id
 * @param {{ userId?: string | null }} [options]
 * @returns {Promise<{ id: string, globalNumber: number, status: string, isFeatured: boolean, isArchived: boolean }>}
 */
export async function duplicateTournament(id, { userId = null } = {}) {
  const row = await requireTournamentRow(id);
  const globalNumber = await nextGlobalNumber();
  const externalId = await allocateUniqueCopyValue(row.external_id, "external_id");
  const slug = await allocateUniqueCopyValue(row.slug || row.external_id, "slug");

  const metadata =
    row.metadata && typeof row.metadata === "object" ? { ...row.metadata } : {};

  const { data, error } = await requireClient()
    .from("tournaments")
    .insert({
      global_number: globalNumber,
      game_championship_number: null,
      external_id: externalId,
      slug,
      game_id: row.game_id,
      series_id: row.series_id,
      championship_label: row.championship_label,
      participation_mode: row.participation_mode,
      format: row.format,
      match_type: row.match_type,
      status: "draft",
      prize_pool_display: row.prize_pool_display,
      prize_pool_amount: row.prize_pool_amount,
      prize_pool_currency: row.prize_pool_currency ?? "INR",
      accent_color: row.accent_color,
      registration_limit: row.registration_limit,
      registration_opens_at: row.registration_opens_at,
      registration_closes_at: row.registration_closes_at,
      starts_at: row.starts_at,
      completed_at: null,
      completed_date_label: null,
      is_featured: false,
      is_archived: false,
      metadata,
      created_by: userId,
      updated_by: userId,
    })
    .select("id, global_number, status, is_featured, is_archived")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new TournamentValidationError(
        {},
        "Duplicate conflicted with an existing tournament ID. Please try again."
      );
    }
    throw error;
  }

  const fresh = await loadTournamentForActivity(data.id);
  await logTournamentActivity("tournament_created", fresh);

  return {
    id: data.id,
    globalNumber: data.global_number,
    status: data.status,
    isFeatured: Boolean(data.is_featured),
    isArchived: Boolean(data.is_archived),
  };
}
