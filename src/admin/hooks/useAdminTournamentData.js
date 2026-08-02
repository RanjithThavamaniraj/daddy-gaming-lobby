import { useCallback, useEffect, useState } from "react";

import {
  getTournamentDashboardCounts,
  listTournaments,
} from "../repositories/tournamentRepository";

/**
 * Loads the admin tournament list via the repository only.
 */
export function useAdminTournamentData() {
  const [tournaments, setTournaments] = useState(
    /** @type {import("../lib/adminTournamentList").AdminTournamentRow[]} */ ([])
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await listTournaments({ includeArchived: false });
      setTournaments(list);
    } catch (err) {
      setTournaments([]);
      setError(err?.message ?? "Failed to load tournaments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tournaments, loading, error, reload };
}

/**
 * Dashboard counts only (lighter path for the overview page).
 */
export function useAdminTournamentCounts() {
  const [counts, setCounts] = useState(
    /** @type {{ draft: number, upcoming: number, active: number, completed: number, cancelled: number, total: number } | null} */ (
      null
    )
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const nextCounts = await getTournamentDashboardCounts({
          includeArchived: false,
        });
        if (!active) return;
        setCounts(nextCounts);
      } catch (err) {
        if (!active) return;
        setCounts(null);
        setError(err?.message ?? "Failed to load dashboard counts.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { counts, loading, error };
}
