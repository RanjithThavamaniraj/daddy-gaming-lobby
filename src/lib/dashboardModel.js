import { DGL_POINTS } from "../config/dglPointsConfig";
import { buildDglPointsLeaderboard } from "../config/leaderboardConfig";
import {
  formatTournamentNumber,
  getCompletedTournaments,
  getUpcomingTournaments,
} from "./tournamentModel";

/**
 * Platform statistics for the dashboard command center.
 * Future: supabase.rpc("get_platform_stats")
 */
export function buildDashboardStats() {
  const completed = getCompletedTournaments();
  const playerSet = new Set();
  let dglPointsAwarded = 0;
  let prizePoolAwarded = 0;

  for (const tournament of completed) {
    dglPointsAwarded +=
      tournament.championPlayers.length * DGL_POINTS.champion +
      tournament.runnerUpPlayers.length * DGL_POINTS.runnerUp;

    for (const name of tournament.championPlayers) playerSet.add(name);
    for (const name of tournament.runnerUpPlayers) playerSet.add(name);

    const numericPrize = parseInt(
      String(tournament.prizePool ?? "").replace(/[^\d]/g, ""),
      10
    );
    if (!Number.isNaN(numericPrize)) prizePoolAwarded += numericPrize;
  }

  const prizeDisplay =
    prizePoolAwarded > 0
      ? `₹${prizePoolAwarded.toLocaleString("en-IN")}`
      : "₹0";

  return [
    {
      id: "tournaments-hosted",
      icon: "🏆",
      label: "Tournaments Hosted",
      value: completed.length,
      suffix: "",
    },
    {
      id: "registered-players",
      icon: "👥",
      label: "Registered Players",
      value: playerSet.size,
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
      value: prizePoolAwarded,
      displayValue: prizeDisplay,
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
        text: `🥇 ${tournament.championPlayers.length} Champions earned +${DGL_POINTS.champion} DGL Points`,
        time: tournament.completedDate ?? "Recent",
        type: "win",
      },
      {
        id: `${tournament.id}-runner-up-points`,
        text: `🥈 ${tournament.runnerUpPlayers.length} Runner-up players earned +${DGL_POINTS.runnerUp} DGL Points`,
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

  const nextTournament = [...upcoming].sort((a, b) => a.number - b.number)[0];
  if (nextTournament) {
    items.push({
      id: `${nextTournament.id}-coming-soon`,
      text: `🎮 ${formatTournamentNumber(nextTournament.number)} coming soon`,
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
  const next = [...getUpcomingTournaments()].sort((a, b) => a.number - b.number)[0];
  if (!next) return null;

  return {
    id: next.id,
    tournamentNumber: formatTournamentNumber(next.number),
    status: "Coming Soon",
    announcement: "Next Tournament will be announced soon.",
    accent: next.accent,
  };
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
    name: latest.name,
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
