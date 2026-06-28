/**
 * Dev-only Supabase diagnostics. Never surfaces errors to end users.
 */

/**
 * @param {unknown} error
 * @returns {{ message: string; details: object | null }}
 */
export function resolveSupabaseError(error) {
  if (!error) {
    return { message: "Unknown Supabase error.", details: null };
  }

  if (typeof error === "object" && (error.code || error.details || error.hint)) {
    const parts = [error.message, error.details, error.hint].filter(Boolean);
    return {
      message: parts.join(" — ") || "Supabase request failed.",
      details: {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      },
    };
  }

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return {
      message:
        "Unable to reach Supabase (network error). Check URL, anon key, and project status.",
      details: {
        name: error.name,
        message: error.message,
        cause: error.cause?.message ?? error.cause ?? null,
      },
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      details: { name: error.name, stack: error.stack },
    };
  }

  if (typeof error === "object" && error.message) {
    return {
      message: error.message,
      details: error,
    };
  }

  if (Array.isArray(error)) {
    return { message: error.join(" "), details: { issues: error } };
  }

  return { message: String(error), details: error };
}

/**
 * Logs Supabase errors in development only.
 * @param {string} context
 * @param {unknown} error
 * @returns {string}
 */
export function logSupabaseError(context, error) {
  const { message, details } = resolveSupabaseError(error);

  if (import.meta.env.DEV) {
    console.warn(`[DGL Supabase] ${context}:`, message);
    if (details) {
      console.warn(`[DGL Supabase] ${context} details:`, details);
    }
  }

  return message;
}

/**
 * Logs a static-config fallback in development only.
 * @param {string} context - e.g. "tournaments", "leaderboard"
 * @param {"configuration"|"empty response"|"request failed"|"loader rejected"} reason
 * @param {unknown} [error]
 */
export function logSupabaseFallback(context, reason, error) {
  if (!import.meta.env.DEV) return;

  if (reason === "configuration") {
    console.info(
      `[DGL Supabase] ${context}: using static registry (${error ?? "not configured"})`
    );
    return;
  }

  if (reason === "empty response") {
    console.info(
      `[DGL Supabase] ${context}: empty Supabase response — using static registry`
    );
    return;
  }

  const { message, details } = resolveSupabaseError(error);
  console.warn(
    `[DGL Supabase] ${context}: ${reason} — using static registry.`,
    message
  );
  if (details) {
    console.warn(`[DGL Supabase] ${context} details:`, details);
  }
}
