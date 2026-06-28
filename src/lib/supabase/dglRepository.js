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
  mapEnrichedTournamentRow,
  mapHallOfChampionsEntry,
  mapLeaderboardRow,
  mapTournamentResultsRow,
} from "./mapTournament";
import {
  getCompletedTournaments,
  getUpcomingTournaments,
  toCompletedCardShape,
  toFeaturedShape,
  toUpcomingCardShape,
} from "../tournamentModel";
import { buildHomeCommunityProof, buildLatestPlatformUpdate } from "../homeModel";
import {
  buildDashboardStats,
  buildCommunityActivity,
  buildUpcomingTournamentPreview,
  buildHallOfChampionsPreview,
} from "../dashboardModel";
import { buildDglPointsLeaderboard } from "../../config/leaderboardConfig";
import { getTournamentsPageLayout } from "../../config/tournamentConfig";

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
    (t) => t.status === "Coming Soon" || t.status === "Active"
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
    const tournament = getCompletedTournaments().find((t) => t.slug === slug);
    return tournament ?? null;
  });
}

/**
 * @returns {Promise<object[]>}
 */
export async function fetchHallOfChampions() {
  return fetchWithFallback("hall-of-champions", async () => {
    const { data, error } = await getSupabaseClient()
      .from("v_tournament_results")
      .select("*")
      .eq("status", "completed");

    if (error) throw error;
    if (!data?.length) return null;

    const sorted = [...data].sort((a, b) => {
      const aNum = Number.parseInt(String(a.tournament_number).replace(/\D/g, ""), 10) || 0;
      const bNum = Number.parseInt(String(b.tournament_number).replace(/\D/g, ""), 10) || 0;
      return bNum - aNum;
    });

    return sorted
      .filter((row) => Array.isArray(row.champion_players) && row.champion_players.length > 0)
      .map(mapHallOfChampionsEntry);
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
  const staticLeaderboard = buildDglPointsLeaderboard();
  const staticByName = new Map(
    staticLeaderboard.map((player) => [player.name.toLowerCase(), player])
  );

  return fetchWithFallback("leaderboard", async () => {
    const { data, error } = await getSupabaseClient()
      .from("v_player_leaderboard")
      .select("*");

    if (error) throw error;
    if (!data?.length) return null;

    return data.map((row) => {
      const meta = staticByName.get(String(row.display_name).toLowerCase()) ?? {};
      return mapLeaderboardRow(row, meta);
    });
  }, () => staticLeaderboard);
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
  }, () => buildHomeCommunityProof());
}

/**
 * @returns {Promise<object | null>}
 */
export async function fetchLatestPlatformUpdate() {
  return fetchWithFallback("home-platform-update", async () => {
    const { completed, upcoming } = await fetchTournamentPartitions();
    const latestCompleted = [...completed].sort(
      (a, b) => b.globalNumber - a.globalNumber
    )[0];
    const nextUpcoming = [...upcoming].sort(
      (a, b) => a.globalNumber - b.globalNumber
    )[0];

    if (!latestCompleted && !nextUpcoming) return null;

    const highlights = [];

    if (latestCompleted) {
      highlights.push({
        id: "tournament-completed",
        icon: "🏆",
        text: `${latestCompleted.tournamentNumber} Completed`,
      });
      highlights.push({
        id: "champions-crowned",
        icon: "👑",
        text: `${latestCompleted.championPlayers.length} Champions Crowned`,
      });

      const prizeText =
        latestCompleted.prizePool?.replace(/\s*Awarded$/i, "") ?? "TBA";
      highlights.push({
        id: "prize-awarded",
        icon: "💰",
        text: `${prizeText} Prize Awarded`,
      });
    }

    return {
      highlights,
      nextAnnouncement: nextUpcoming
        ? {
            tournamentNumber: nextUpcoming.tournamentNumber,
            message: "Announcement Coming Soon",
          }
        : null,
    };
  }, () => buildLatestPlatformUpdate());
}

/**
 * @returns {Promise<object[]>}
 */
export async function fetchDashboardStats() {
  return fetchWithFallback("dashboard-stats", async () => {
    const { data, error } = await getSupabaseClient().rpc("get_platform_stats");
    if (error) throw error;
    if (!data) return null;

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
    if (!data?.length) return null;

    return data.map((row) => ({
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
  }, () => buildCommunityActivity());
}

/**
 * @returns {Promise<object | null>}
 */
export async function fetchUpcomingTournamentPreview() {
  return fetchWithFallback("upcoming-tournament-preview", async () => {
    const { upcoming } = await fetchTournamentPartitions();
    const next = [...upcoming].sort((a, b) => a.globalNumber - b.globalNumber)[0];
    if (!next) return null;

    return {
      ...toUpcomingCardShape(next),
      status: "Coming Soon",
      accent: next.accent,
    };
  }, () => buildUpcomingTournamentPreview());
}

/**
 * @returns {Promise<object | null>}
 */
export async function fetchHallOfChampionsPreview() {
  return fetchWithFallback("hall-of-champions-preview", async () => {
    const hall = await fetchHallOfChampions();
    const latest = hall[0];
    if (!latest) return null;

    return {
      tournamentNumber: latest.tournamentNumber,
      championshipName: latest.name,
      name: latest.name,
      status: "Completed",
      completedDate: latest.completedDate,
      resultsPath: latest.resultsPath,
      accent: latest.accent,
    };
  }, () => buildHallOfChampionsPreview());
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
    const { completed, upcoming } = await fetchTournamentPartitions();

    const featuredTournament = completed.length
      ? toFeaturedShape(completed[0])
      : upcoming.length
        ? toFeaturedShape(upcoming[0])
        : null;

    const upcomingTournaments = upcoming.map(toUpcomingCardShape);
    const completedTournaments = completed.map(toCompletedCardShape);

    return getTournamentsPageLayout({
      featured: featuredTournament,
      upcoming: upcomingTournaments,
      completed: completedTournaments,
    });
  }, () => getTournamentsPageLayout());
}
