import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function validateSupabaseConfig() {
  const issues = [];

  if (!supabaseUrl) {
    issues.push(
      "Missing Supabase URL. Set VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL."
    );
  } else {
    try {
      const parsed = new URL(supabaseUrl);
      if (!parsed.hostname.endsWith(".supabase.co")) {
        issues.push(
          `Supabase URL hostname looks unexpected: ${parsed.hostname}`
        );
      }
    } catch {
      issues.push(`Supabase URL is not a valid URL: ${supabaseUrl}`);
    }
  }

  if (!supabaseAnonKey) {
    issues.push(
      "Missing Supabase anon key. Set VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  } else if (
    !supabaseAnonKey.startsWith("eyJ") &&
    !supabaseAnonKey.startsWith("sb_publishable_")
  ) {
    issues.push(
      "Supabase anon key format looks invalid. Expected a JWT (eyJ...) from Project Settings → API."
    );
  }

  return issues;
}

/** @type {import("@supabase/supabase-js").SupabaseClient | null} */
let supabaseClient = null;

/**
 * Returns config issues without logging to the console.
 * Call when wiring Supabase in dev or CI.
 */
export function getSupabaseConfigIssues() {
  return validateSupabaseConfig();
}

/** Lazy Supabase client — never logs in production. */
export function getSupabaseClient() {
  if (!supabaseClient) {
    const issues = validateSupabaseConfig();
    if (issues.length > 0 && import.meta.env.DEV) {
      console.info(
        "[DGL Supabase] Not configured — static registry will be used:",
        issues
      );
    }
    supabaseClient = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
  }
  return supabaseClient;
}

export async function verifySupabaseConnection() {
  const issues = getSupabaseConfigIssues();
  if (issues.length > 0) {
    return {
      ok: false,
      error: issues.join(" "),
    };
  }

  try {
    const { error } = await getSupabaseClient()
      .from("games")
      .select("id", { count: "exact", head: true });

    if (error) {
      return {
        ok: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error?.message ?? String(error),
      cause: error?.cause?.message ?? null,
    };
  }
}
