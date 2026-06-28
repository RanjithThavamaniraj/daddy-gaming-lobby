import { useEffect, useState } from "react";

import { logSupabaseFallback } from "../lib/supabaseErrors";

/**
 * Hydrates page data from Supabase when available; keeps static registry otherwise.
 * Initial render always uses `initialValue` (static config) so UX is instant and
 * never shows loading or error states to end users.
 *
 * @template T
 * @param {T} initialValue - Static registry / config fallback
 * @param {() => Promise<T>} loader - Supabase fetch (should use fetchWithFallback)
 * @param {unknown[]} [deps]
 */
export default function useSupabaseData(initialValue, loader, deps = []) {
  const [data, setData] = useState(initialValue);

  useEffect(() => {
    let cancelled = false;

    loader()
      .then((next) => {
        if (!cancelled && next !== undefined) {
          setData(next);
        }
      })
      .catch((error) => {
        logSupabaseFallback("useSupabaseData", "loader rejected", error);
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return data;
}
