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

  if (issues.length > 0) {
    console.error("[Supabase] Configuration issues:", issues);
  } else {
    console.info("[Supabase] Client configured for:", supabaseUrl);
  }

  return issues;
}

export const supabaseConfigIssues = validateSupabaseConfig();

export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);

export async function verifySupabaseConnection() {
  if (supabaseConfigIssues.length > 0) {
    return {
      ok: false,
      error: supabaseConfigIssues.join(" "),
    };
  }

  try {
    const { error } = await supabase
      .from("registrations")
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
