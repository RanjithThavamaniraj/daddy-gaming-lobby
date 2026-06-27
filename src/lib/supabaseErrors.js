/**
 * Normalize Supabase / network errors into a readable message and log details.
 */
export function resolveSupabaseError(error) {
  if (!error) {
    return { message: "Unknown Supabase error.", details: null };
  }

  // PostgREST / Supabase API error object
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

  // Browser network failure (project paused, bad URL, CORS, offline)
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return {
      message:
        "Unable to reach Supabase (network error). Verify the Supabase URL, anon key, and that the project is active.",
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

  return { message: String(error), details: error };
}

export function logSupabaseError(context, error) {
  const { message, details } = resolveSupabaseError(error);
  console.error(`[Supabase] ${context}:`, message);
  if (details) {
    console.error(`[Supabase] ${context} details:`, details);
  }
  return message;
}
