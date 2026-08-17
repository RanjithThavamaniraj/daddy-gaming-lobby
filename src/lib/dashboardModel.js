import { buildDglPointsLeaderboard } from "../config/leaderboardConfig";
import { DGL_GAMES } from "../config/dglGamesConfig";
import { aggregateCompletedTournamentStats } from "./tournamentStats";
import {
  formatGlobalTournamentNumber,
  getCompletedTournaments,
  getUpcomingTournaments,
  toUpcomingCardShape,
  compareTournamentsByCompletedDateDesc,
} from "./tournamentModel";

/**
 * Supported games for Active Realms — every supported title is ACTIVE.
 * @returns {object[]}
 */
export function buildDashboardGames() {
  return DGL_GAMES.map((game) => ({
    ...game,
    status: "available",
    statusLabel: "Active",
  }));
}
/**
 * Platform statistics for the dashboard command center.
 * Future: supabase.rpc("get_platform_stats")
 */
export function buildDashboardStats() {
  const completed = getCompletedTournaments();
  const stats = aggregateCompletedTournamentStats(completed);
  let dglPointsAwarded = 0;

  for (const tournament of completed) {
    dglPointsAwarded +=
      tournament.championPlayers.length * tournament.pointsAwarded.champion +
      tournament.runnerUpPlayers.length * tournament.pointsAwarded.runnerUp;
  }

  return [
    {
      id: "tournaments-hosted",
      icon: "🏆",
      label: "Tournaments Hosted",
      value: stats.tournamentsHosted,
      suffix: "",
    },
    {
      id: "registered-players",
      icon: "👥",
      label: "Registered Players",
      value: stats.registeredPlayers,
      suffix: "",
    },
    {
      id: "dgl-points-awarded",
      icon: "🏅",
      label: "DGL Points Awarded",
      value: dglPointsAwarded,
      suffix: "",
    },
    {
      id: "prize-pool-awarded",
      icon: "💰",
      label: "Prize Pool Awarded",
      value: stats.prizePoolAwarded,
      displayValue: stats.prizePoolDisplay,
      suffix: "",
    },
  ];
}

/**
 * Community activity feed derived from tournament history.
 * Future: supabase.from("community_activity").select("*").order("created_at", { ascending: false })
 */
export function buildCommunityActivity() {
  const completed = getCompletedTournaments();
  const upcoming = getUpcomingTournaments();
  const items = [];

  for (const tournament of completed) {
    const participantCount =
      tournament.championPlayers.length + tournament.runnerUpPlayers.length;

    items.push(
      {
        id: `${tournament.id}-completed`,
        text: `🏆 ${tournament.name} completed`,
        time: tournament.completedDate ?? "Recent",
        type: "win",
      },
      {
        id: `${tournament.id}-champions-points`,
        text: `🥇 ${tournament.championPlayers.length} Champions earned +${tournament.pointsAwarded.champion} DGL Points`,
        time: tournament.completedDate ?? "Recent",
        type: "win",
      },
      {
        id: `${tournament.id}-runner-up-points`,
        text: `🥈 ${tournament.runnerUpPlayers.length} Runner-up players earned +${tournament.pointsAwarded.runnerUp} DGL Points`,
        time: tournament.completedDate ?? "Recent",
        type: "win",
      },
      {
        id: `${tournament.id}-hall-updated`,
        text: "🏅 Hall of Champions updated",
        time: tournament.completedDate ?? "Recent",
        type: "rank",
      },
      {
        id: `${tournament.id}-results-published`,
        text: `🌐 ${tournament.tournamentNumber} Results published`,
        time: tournament.completedDate ?? "Recent",
        type: "join",
      },
      {
        id: `${tournament.id}-participants`,
        text: `👥 ${participantCount} Players participated in ${tournament.tournamentNumber}`,
        time: tournament.completedDate ?? "Recent",
        type: "join",
      }
    );
  }

  const nextTournament = [...upcoming].sort(
    (a, b) => (a.number ?? Number.POSITIVE_INFINITY) - (b.number ?? Number.POSITIVE_INFINITY)
  )[0];
  if (nextTournament) {
    items.push({
      id: `${nextTournament.id}-coming-soon`,
      text: `🎮 ${formatGlobalTournamentNumber(nextTournament.globalNumber) ?? nextTournament.championshipName ?? "Upcoming tournament"} coming soon`,
      time: "Upcoming",
      type: "join",
    });
  }

  items.push({
    id: "website-results-update",
    text: "📢 Website updated with latest tournament results",
    time: completed[0]?.completedDate ?? "Recent",
    type: "join",
  });

  return items;
}

/**
 * Next upcoming tournament preview (game-agnostic announcement).
 * Future: supabase.from("tournaments").select("*").eq("status", "Coming Soon").order("number").limit(1)
 */
export function buildUpcomingTournamentPreview() {
  const next = [...getUpcomingTournaments()].sort(
    (a, b) => a.globalNumber - b.globalNumber
  )[0];
  if (!next) return null;

  return {
    ...toUpcomingCardShape(next),
    accent: next.accent,
  };
}

/**
 * All completed tournaments, newest first, for the dashboard
 * Completed Tournaments widget.
 * Future: supabase.from("tournaments").select("*").eq("status", "Completed").order("number", { ascending: false })
 */
export function buildCompletedTournamentsPreview() {
  return [...getCompletedTournaments()]
    .sort(compareTournamentsByCompletedDateDesc)
    .map((tournament) => ({
      id: tournament.id,
      name: tournament.championshipName,
      completedDate: tournament.completedDate ?? null,
    }));
}

/**
 * Latest completed tournament for the Hall of Champions widget.
 * Future: supabase.from("tournaments").select("*").eq("status", "Completed").order("number", { ascending: false }).limit(1)
 */
export function buildHallOfChampionsPreview() {
  const latest = [...getCompletedTournaments()].sort((a, b) => b.number - a.number)[0];
  if (!latest) return null;

  return {
    tournamentNumber: latest.tournamentNumber,
    championshipName: latest.championshipName,
    name: latest.championshipName,
    status: latest.status,
    completedDate: latest.completedDate,
    resultsPath: latest.resultsPath,
    accent: latest.accent,
  };
}

/**
 * Top N players on the DGL Points leaderboard.
 * Future: supabase.from("player_points").select("*").order("points", { ascending: false }).limit(5)
 */
export function buildLeaderboardPreview(limit = 5) {
  return buildDglPointsLeaderboard().slice(0, limit);
}
