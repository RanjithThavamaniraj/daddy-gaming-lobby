import { useEffect, useState } from "react";
import { fetchTournamentBracket } from "../lib/supabase/tournamentBracket";

const EMPTY = {
  groups: [],
  fixtures: [],
  hasGroups: false,
  hasKnockout: false,
};

/**
 * Lazy-load bracket/group/fixture data once per tournament id.
 * Skips fetch until `enabled` is true (e.g. closed / live / completed).
 *
 * @param {string | null | undefined} tournamentId
 * @param {boolean} [enabled=true]
 */
export default function useTournamentBracket(tournamentId, enabled = true) {
  const [data, setData] = useState(enabled && tournamentId ? null : EMPTY);
  const [loading, setLoading] = useState(Boolean(enabled && tournamentId));
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled || !tournamentId) {
      return undefined;
    }

    let cancelled = false;

    fetchTournamentBracket(tournamentId)
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load tournament bracket:", err);
          setError(err?.message ?? "Failed to load bracket data");
          setData(EMPTY);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tournamentId, enabled, reloadKey]);

  if (!enabled || !tournamentId) {
    return {
      data: EMPTY,
      loading: false,
      error: null,
      reload: () => setReloadKey((k) => k + 1),
    };
  }

  return {
    data,
    loading,
    error,
    reload: () => {
      setLoading(true);
      setReloadKey((k) => k + 1);
    },
  };
}
