/**
 * Supabase data access for DGL.
 *
 * Each fetch tries Supabase first when configured, then falls back to the
 * static registry (tournamentRegistry.js, leaderboardConfig.js, etc.).
 * Failures are silent in production; development logs explain the fallback.
 */

import { getSupabaseClient } from "../../supabase";
import { fetchWithFallback } from "./fetchWithFallback";
import { formatInrPrize } from "../tournamentStats";
import {
  aggregateHallOfChampionsRows,
  mapDbTournamentStatus,
  mapEnrichedTournamentRow,
  mapLeaderboardRow,
  mapTournamentResultsRow,
  parsePlayerNameList,
} from "./mapTournament";
import {
  getCompletedTournaments,
  getTournamentBySlug,
  getUpcomingTournaments,
  selectFeaturedTournament,
  selectNextTournament,
  toCompletedCardShape,
  toFeaturedShape,
  toUpcomingCardShape,
} from "../tournamentModel";
import { buildHomeCommunityProof, buildLatestPlatformUpdate, formatNextEventTitle } from "../homeModel";
import {
  buildDashboardStats,
  buildCommunityActivity,
  buildUpcomingTournamentPreview,
  buildHallOfChampionsPreview,
  buildCompletedTournamentsPreview,
  buildDashboardGames,
} from "../dashboardModel";
import { buildDglPointsLeaderboard } from "../../config/leaderboardConfig";
import { getTournamentsPageLayout } from "../../config/tournamentConfig";
import {
  buildHomeFeaturedGames,
  HOME_FEATURED_GAME_IDS,
} from "../homeModel";
import {
  mapDashboardGamesList,
  mapFeaturedGamesList,
} from "./mapGames";

function mapCommunityProofRpc(data) {
  const stats = [
    {
      id: "tournaments-hosted",
      icon: "🏆",
      label: "Tournaments Hosted",
      value: data.stats?.tournaments_hosted ?? 0,
    },
    {
      id: "registered-players",
      icon: "👥",
      label: "Registered Players",
      value: data.stats?.registered_players ?? 0,
    },
    {
      id: "champions-crowned",
      icon: "🏅",
      label: "Champions Crowned",
      value: data.stats?.champions_crowned ?? 0,
    },
    {
      id: "prize-pool-awarded",
      icon: "💰",
      label: "Prize Pool Awarded",
      value: data.stats?.prize_pool_awarded ?? 0,
      displayValue: formatInrPrize(Number(data.stats?.prize_pool_awarded ?? 0)),
    },
  ];

  return {
    stats,
    latestChampion: data.latest_champion
      ? {
          tournamentNumber: data.latest_champion.tournament_number,
          championshipName: data.latest_champion.championship_name,
          resultsPath: data.latest_champion.results_path,
          accent: data.latest_champion.accent,
        }
      : null,
  };
}

function mapPlatformStatsRpc(data) {
  return [
    {
      id: "tournaments-hosted",
      icon: "🏆",
      label: "Tournaments Hosted",
      value: data.tournaments_hosted ?? 0,
      suffix: "",
    },
    {
      id: "registered-players",
      icon: "👥",
      label: "Registered Players",
      value: data.registered_players ?? 0,
      suffix: "",
    },
    {
      id: "dgl-points-awarded",
      icon: "🏅",
      label: "DGL Points Awarded",
      value: data.dgl_points_awarded ?? 0,
      suffix: "",
    },
    {
      id: "prize-pool-awarded",
      icon: "💰",
      label: "Prize Pool Awarded",
      value: data.prize_pool_awarded ?? 0,
      displayValue: formatInrPrize(Number(data.prize_pool_awarded ?? 0)),
      suffix: "",
    },
  ];
}

function buildPlatformUpdateFromTournaments(latestCompleted, nextUpcoming, latestResults) {
  if (!latestCompleted && !nextUpcoming) return null;

  const highlights = [];

  if (latestCompleted) {
    const completed = mapEnrichedTournamentRow(latestCompleted, latestResults);
    const championCount =
      completed.championPlayers.length ||
      parsePlayerNameList(latestResults?.champion_players).length;

    highlights.push({
      id: "tournament-completed",
      icon: "🏆",
      text: `${completed.tournamentNumber} Completed`,
    });
    highlights.push({
      id: "champions-crowned",
      icon: "👑",
      text: `${championCount} Champions Crowned`,
    });

    const prizeText =
      completed.prizePool?.replace(/\s*(Team\s+)?Prize(\s+Awarded)?$/i, "") ?? "TBA";
    highlights.push({
      id: "prize-awarded",
      icon: "💰",
      text: `${prizeText} Prize Awarded`,
    });
  }

  const next = nextUpcoming ? mapEnrichedTournamentRow(nextUpcoming) : null;

  return {
    highlights,
    nextAnnouncement: next
      ? {
          label: "NEXT EVENT",
          title: formatNextEventTitle(next),
        }
      : null,
  };
}

function mapHallPreviewFromRpc(data) {
  const latest = data?.latest_champion;
  if (!latest) return null;

  return {
    tournamentNumber: latest.tournament_number,
    championshipName: latest.championship_name,
    name: latest.championship_name,
    status: "Completed",
    completedDate: null,
    resultsPath: latest.results_path,
    accent: latest.accent,
  };
}

function mapActivityRows(data) {
  return (data ?? []).map((row) => ({
    id: row.id,
    text: row.title,
    time: row.summary ?? "Recent",
    type:
      row.activity_type === "tournament_completed" ||
      row.activity_type === "champion_crowned"
        ? "win"
        : row.activity_type === "points_awarded"
          ? "rank"
          : "join",
  }));
}

/**
 * @returns {Promise<ReturnType<typeof mapEnrichedTournamentRow>[]>}
 */
export async function fetchAllTournaments() {
  return fetchWithFallback("tournaments", async () => {
    const supabase = getSupabaseClient();

    const [{ data: tournaments, error: tournamentsError }, { data: results, error: resultsError }] =
      await Promise.all([
        supabase
          .from("v_tournaments_enriched")
          .select("*")
          .order("global_number", { ascending: true }),
        supabase.from("v_tournament_results").select("*"),
      ]);

    if (tournamentsError) throw tournamentsError;
    if (resultsError) throw resultsError;
    if (!tournaments?.length) return null;

    const resultsById = new Map(
      (results ?? []).map((row) => [row.tournament_id, row])
    );

    return tournaments.map((row) =>
      mapEnrichedTournamentRow(row, resultsById.get(row.id))
    );
  }, () => [...getCompletedTournaments(), ...getUpcomingTournaments()]);
}

/**
 * @param {ReturnType<typeof mapEnrichedTournamentRow>[]} tournaments
 */
function partitionTournaments(tournaments) {
  const completed = tournaments.filter((t) => t.status === "Completed");
  const upcoming = tournaments.filter(
    (t) =>
      t.status === "Coming Soon" ||
      t.status === "Registrations Open" ||
      t.status === "Registrations Closed" ||
      t.status === "Live"
  );
  return { completed, upcoming, all: tournaments };
}

/**
 * @returns {Promise<{ completed: object[]; upcoming: object[]; all: object[] }>}
 */
export async function fetchTournamentPartitions() {
  const all = await fetchAllTournaments();
  return partitionTournaments(all);
}

/**
 * @returns {Promise<ReturnType<typeof mapTournamentResultsRow> | null>}
 */
export async function fetchTournamentResultsBySlug(slug) {
  return fetchWithFallback("tournament-results", async () => {
    const { data, error } = await getSupabaseClient()
      .from("v_tournament_results")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapTournamentResultsRow(data);
  }, () => {
    const tournament = getTournamentBySlug(slug);
    return tournament ?? null;
  }, { allowNull: true });
}

/**
 * Single tournament fetch by slug — used for the dedicated tournament page
 * (results for completed events, registration for open/active events).
 * @returns {Promise<object | null>}
 */
export async function fetchTournamentBySlug(slug) {
  return fetchWithFallback("tournament-by-slug", async () => {
    const supabase = getSupabaseClient();

    const { data: row, error } = await supabase
      .from("v_tournaments_enriched")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!row) return null;

    let resultsRow = null;
    if (mapDbTournamentStatus(row.status) === "Completed") {
      const { data, error: resultsError } = await supabase
        .from("v_tournament_results")
        .select(
          "champion_players, runner_up_players, third_place_players, champion_points, runner_up_points"
        )
        .eq("slug", slug)
        .maybeSingle();
      if (resultsError) throw resultsError;
      resultsRow = data;
    }

    return mapEnrichedTournamentRow(row, resultsRow);
  }, () => getTournamentBySlug(slug), { allowNull: true });
}

/**
 * @returns {Promise<object[]>}
 */
export async function fetchHallOfChampions() {
  return fetchWithFallback("hall-of-champions", async () => {
    const { data, error } = await getSupabaseClient()
      .from("v_hall_of_champions")
      .select("*")
      .order("global_number", { ascending: false });

    if (error) throw error;

    return aggregateHallOfChampionsRows(data ?? []);
  }, () =>
    getCompletedTournaments().map((tournament) => ({
      slug: tournament.slug,
      tournamentNumber: tournament.tournamentNumber,
      name: tournament.name,
      game: tournament.game,
      gameSlug: tournament.gameSlug,
      championPlayers: tournament.championPlayers,
      prizePool: tournament.prizePool,
      dglPoints: tournament.pointsAwarded.champion,
      completedDate: tournament.completedDate,
      accent: tournament.accent,
      resultsPath: tournament.resultsPath,
    }))
  );
}

/**
 * @returns {Promise<object[]>}
 */
export async function fetchDglPointsLeaderboard() {
  return fetchWithFallback("leaderboard", async () => {
    const { data, error } = await getSupabaseClient()
      .from("v_player_leaderboard")
      .select("*");

    if (error) throw error;

    return (data ?? []).map((row) => mapLeaderboardRow(row));
  }, () => buildDglPointsLeaderboard());
}

/**
 * @returns {Promise<object | null>}
 */
export async function fetchHomeCommunityProof() {
  return fetchWithFallback("home-community-proof", async () => {
    const { data, error } = await getSupabaseClient().rpc(
      "get_home_community_proof"
    );

    if (error) throw error;
    if (!data) return null;

    return mapCommunityProofRpc(data);
  }, () => buildHomeCommunityProof());
}

/**
 * @returns {Promise<object | null>}
 */
export async function fetchLatestPlatformUpdate() {
  return fetchWithFallback("home-platform-update", async () => {
    const supabase = getSupabaseClient();

    const [
      { data: latestCompleted, error: completedError },
      { data: nextUpcoming, error: upcomingError },
    ] = await Promise.all([
      supabase
        .from("v_tournaments_enriched")
        .select("*")
        .eq("status", "completed")
        .order("global_number", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("v_tournaments_enriched")
        .select("*")
        .in("status", ["coming_soon", "registration_open", "active"])
        .order("global_number", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    if (completedError) throw completedError;
    if (upcomingError) throw upcomingError;

    let latestResults = null;
    if (latestCompleted?.id) {
      const { data, error: resultsError } = await supabase
        .from("v_tournament_results")
        .select("champion_players, slug")
        .eq("tournament_id", latestCompleted.id)
        .maybeSingle();

      if (resultsError) throw resultsError;
      latestResults = data;
    }

    return buildPlatformUpdateFromTournaments(
      latestCompleted,
      nextUpcoming,
      latestResults
    );
  }, () => buildLatestPlatformUpdate(), { allowNull: true });
}

/**
 * @returns {Promise<object[]>}
 */
export async function fetchDashboardStats() {
  return fetchWithFallback("dashboard-stats", async () => {
    const { data, error } = await getSupabaseClient().rpc("get_platform_stats");
    if (error) throw error;
    if (!data) return null;

    return mapPlatformStatsRpc(data);
  }, () => buildDashboardStats());
}

/**
 * @returns {Promise<object[]>}
 */
export async function fetchCommunityActivity() {
  return fetchWithFallback("community-activity", async () => {
    const { data, error } = await getSupabaseClient()
      .from("community_activity")
      .select("id, title, summary, activity_type, occurred_at")
      .eq("is_public", true)
      .order("occurred_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return mapActivityRows(data);
  }, () => buildCommunityActivity());
}

/**
 * @returns {Promise<object | null>}
 */
export async function fetchUpcomingTournamentPreview() {
  return fetchWithFallback("upcoming-tournament-preview", async () => {
    const { data, error } = await getSupabaseClient()
      .from("v_tournaments_enriched")
      .select("*")
      .in("status", ["coming_soon", "registration_open", "active"])
      .order("global_number", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const tournament = mapEnrichedTournamentRow(data);

    return {
      ...toUpcomingCardShape(tournament),
      status: tournament.status,
      accent: tournament.accent,
    };
  }, () => buildUpcomingTournamentPreview(), { allowNull: true });
}

/**
 * @returns {Promise<object | null>}
 */
export async function fetchHallOfChampionsPreview() {
  return fetchWithFallback("hall-of-champions-preview", async () => {
    const { data, error } = await getSupabaseClient().rpc(
      "get_home_community_proof"
    );

    if (error) throw error;

    return mapHallPreviewFromRpc(data);
  }, () => buildHallOfChampionsPreview(), { allowNull: true });
}

/**
 * @param {number} [limit]
 * @returns {Promise<object[]>}
 */
export async function fetchLeaderboardPreview(limit = 5) {
  const leaderboard = await fetchDglPointsLeaderboard();
  return leaderboard.slice(0, limit);
}

/**
 * @returns {Promise<ReturnType<typeof getTournamentsPageLayout>>}
 */
export async function fetchTournamentsPageLayout() {
  return fetchWithFallback("tournaments-page", async () => {
    const supabase = getSupabaseClient();

    const [{ data: tournaments, error: tournamentsError }, { data: results, error: resultsError }] =
      await Promise.all([
        supabase
          .from("v_tournaments_enriched")
          .select("*")
          .order("global_number", { ascending: true }),
        supabase.from("v_tournament_results").select("*"),
      ]);

    if (tournamentsError) throw tournamentsError;
    if (resultsError) throw resultsError;
    if (!tournaments?.length) return null;

    const resultsById = new Map(
      (results ?? []).map((row) => [row.tournament_id, row])
    );

    const all = tournaments.map((row) =>
      mapEnrichedTournamentRow(row, resultsById.get(row.id))
    );

    const { completed, upcoming } = partitionTournaments(all);

    const featuredTournament = selectFeaturedTournament(all);
    const featuredShape = featuredTournament ? toFeaturedShape(featuredTournament) : null;

    const nextTournament = selectNextTournament(all, featuredTournament);
    const nextShape = nextTournament ? toFeaturedShape(nextTournament) : null;

    const upcomingTournaments = upcoming.map(toUpcomingCardShape);
    const completedTournaments = completed.map(toCompletedCardShape);

    return getTournamentsPageLayout({
      featured: featuredShape,
      next: nextShape,
      upcoming: upcomingTournaments,
      completed: completedTournaments,
    });
  }, () => getTournamentsPageLayout());
}

/**
 * Single batched fetch for the homepage — avoids duplicate tournament/RPC queries.
 */
export async function fetchHomePageData() {
  return fetchWithFallback(
    "home-page",
    async () => {
      const supabase = getSupabaseClient();

      const [
        { data: proof, error: proofError },
        { data: latestCompleted, error: completedError },
        { data: nextUpcoming, error: upcomingError },
        { data: featuredGames, error: gamesError },
      ] = await Promise.all([
        supabase.rpc("get_home_community_proof"),
        supabase
          .from("v_tournaments_enriched")
          .select("*")
          .eq("status", "completed")
          .order("global_number", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("v_tournaments_enriched")
          .select("*")
          .in("status", ["coming_soon", "registration_open", "active"])
          .order("global_number", { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("games")
          .select("*")
          .in("slug", HOME_FEATURED_GAME_IDS),
      ]);

      if (proofError) throw proofError;
      if (completedError) throw completedError;
      if (upcomingError) throw upcomingError;
      if (gamesError) throw gamesError;

      let latestResults = null;
      if (latestCompleted?.id) {
        const { data, error: resultsError } = await supabase
          .from("v_tournament_results")
          .select("champion_players, slug")
          .eq("tournament_id", latestCompleted.id)
          .maybeSingle();

        if (resultsError) throw resultsError;
        latestResults = data;
      }

      return {
        platformUpdate: buildPlatformUpdateFromTournaments(
          latestCompleted,
          nextUpcoming,
          latestResults
        ),
        communityProof: proof ? mapCommunityProofRpc(proof) : null,
        featuredGames: mapFeaturedGamesList(featuredGames ?? []),
      };
    },
    () => ({
      platformUpdate: buildLatestPlatformUpdate(),
      communityProof: buildHomeCommunityProof(),
      featuredGames: buildHomeFeaturedGames(),
    })
  );
}

/**
 * Single batched fetch for the dashboard — one parallel round-trip per visit.
 */
export async function fetchDashboardPageData() {
  return fetchWithFallback(
    "dashboard-page",
    async () => {
      const supabase = getSupabaseClient();

      const [
        { data: stats, error: statsError },
        { data: upcoming, error: upcomingError },
        { data: proof, error: proofError },
        { data: leaderboard, error: leaderboardError },
        { data: games, error: gamesError },
        { data: completedRows, error: completedError },
      ] = await Promise.all([
        supabase.rpc("get_platform_stats"),
        supabase
          .from("v_tournaments_enriched")
          .select("*")
          .in("status", ["coming_soon", "registration_open", "active"])
          .order("global_number", { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase.rpc("get_home_community_proof"),
        supabase.from("v_player_leaderboard").select("*"),
        supabase.from("games").select("*").order("sort_order"),
        supabase
          .from("v_tournaments_enriched")
          .select("*")
          .eq("status", "completed")
          .order("global_number", { ascending: false }),
      ]);

      if (statsError) throw statsError;
      if (upcomingError) throw upcomingError;
      if (proofError) throw proofError;
      if (leaderboardError) throw leaderboardError;
      if (gamesError) throw gamesError;
      if (completedError) throw completedError;

      const mappedUpcoming = upcoming ? mapEnrichedTournamentRow(upcoming) : null;
      const upcomingTournament = mappedUpcoming
        ? {
            ...toUpcomingCardShape(mappedUpcoming),
            status: mappedUpcoming.status,
            accent: mappedUpcoming.accent,
          }
        : null;

      return {
        stats: stats ? mapPlatformStatsRpc(stats) : [],
        upcomingPreview: upcomingTournament,
        hallPreview: mapHallPreviewFromRpc(proof),
        completedPreview: (completedRows ?? []).map((row) => {
          const mapped = mapEnrichedTournamentRow(row);
          return {
            id: mapped.id,
            name: mapped.championshipName,
            completedDate: mapped.completedDate ?? null,
          };
        }),
        leaderboardPreview: (leaderboard ?? [])
          .map((row) => mapLeaderboardRow(row))
          .slice(0, 5),
        games: mapDashboardGamesList(games ?? []),
      };
    },
    () => ({
      stats: buildDashboardStats(),
      upcomingPreview: buildUpcomingTournamentPreview(),
      hallPreview: buildHallOfChampionsPreview(),
      completedPreview: buildCompletedTournamentsPreview(),
      leaderboardPreview: buildDglPointsLeaderboard().slice(0, 5),
      games: buildDashboardGames(),
    })
  );
}
