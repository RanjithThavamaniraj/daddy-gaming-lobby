import { useCallback, useEffect, useState } from "react";

import {
  getGiveawayDashboardCounts,
  listGiveaways,
} from "../repositories/giveawayRepository";

export function useAdminGiveawayList() {
  const [giveaways, setGiveaways] = useState(/** @type {object[]} */ ([]));
  const [counts, setCounts] = useState(/** @type {object | null} */ (null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, nextCounts] = await Promise.all([
        listGiveaways({ includeArchived: false }),
        getGiveawayDashboardCounts({ includeArchived: false }),
      ]);
      setGiveaways(list);
      setCounts(nextCounts);
    } catch (err) {
      setGiveaways([]);
      setCounts(null);
      setError(err?.message ?? "Failed to load giveaways.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { giveaways, counts, loading, error, reload };
}
