/**
 * Supabase fetch helper with static-registry fallback.
 *
 * Production: never throws, never logs — silently uses static config on failure.
 * Development: logs why Supabase was skipped so engineers can diagnose issues.
 */

import { getSupabaseConfigIssues } from "../../supabase";
import { logSupabaseFallback } from "../supabaseErrors";

/** @type {boolean} */
let loggedConfigSkip = false;

/**
 * @template T
 * @param {string} context
 * @param {() => Promise<T | null | undefined>} fetcher
 * @param {() => T} fallback
 * @param {{ allowNull?: boolean }} [options]
 * @returns {Promise<T>}
 */
export async function fetchWithFallback(context, fetcher, fallback, options = {}) {
  const { allowNull = false } = options;
  const issues = getSupabaseConfigIssues();

  if (issues.length > 0) {
    if (!loggedConfigSkip) {
      loggedConfigSkip = true;
      logSupabaseFallback(context, "configuration", issues.join(" "));
    }
    return fallback();
  }

  try {
    const result = await fetcher();

    if (result === null || result === undefined) {
      if (allowNull) {
        return /** @type {T} */ (result ?? null);
      }
      logSupabaseFallback(context, "empty response");
      return fallback();
    }

    return result;
  } catch (error) {
    logSupabaseFallback(context, "request failed", error);
    return fallback();
  }
}

/**
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  return getSupabaseConfigIssues().length === 0;
}
