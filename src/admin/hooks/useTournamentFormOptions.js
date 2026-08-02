import { useEffect, useState } from "react";

import {
  listGamesForTournamentForm,
  listSeriesForTournamentForm,
} from "../repositories/tournamentRepository";

/**
 * Loads game/series options for TournamentForm via the repository.
 */
export function useTournamentFormOptions() {
  const [games, setGames] = useState(
    /** @type {{ id: string, name: string, slug: string, accentColor: string, defaultParticipationMode: string }[]} */ ([])
  );
  const [series, setSeries] = useState(
    /** @type {{ id: string, name: string, gameId: string, eventType: string }[]} */ ([])
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [nextGames, nextSeries] = await Promise.all([
          listGamesForTournamentForm(),
          listSeriesForTournamentForm(),
        ]);
        if (!active) return;
        setGames(nextGames);
        setSeries(nextSeries);
      } catch (err) {
        if (!active) return;
        setGames([]);
        setSeries([]);
        setError(err?.message ?? "Failed to load form options.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { games, series, loading, error };
}
