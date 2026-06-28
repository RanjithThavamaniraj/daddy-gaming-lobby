import { getCompletedTournaments } from "./tournamentModel";
import { buildHallOfChampionsPreview } from "./dashboardModel";

/** Game slugs featured on the homepage (subset of DGL roadmap). */
export const HOME_FEATURED_GAME_IDS = [
  "valorant",
  "cs2",
  "fc-26",
  "marvel-rivals",
  "apex-legends",
  "delta-force",
  "rocket-league",
  "arc-raiders",
];

/**
 * High-level platform stats for the homepage.
 * Future: supabase.rpc("get_home_platform_stats")
 */
export function buildHomeCommunityStats() {
  const completed = getCompletedTournaments();
  const playerSet = new Set();
  const championSet = new Set();
  let prizePoolAwarded = 0;

  for (const tournament of completed) {
    for (const name of tournament.championPlayers) championSet.add(name);
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
      label: "Tournaments Hosted",
      value: completed.length,
    },
    {
      id: "registered-players",
      label: "Registered Players",
      value: playerSet.size,
    },
    {
      id: "champions-crowned",
      label: "Champions Crowned",
      value: championSet.size,
    },
    {
      id: "prize-pool-awarded",
      label: "Prize Pool Awarded",
      value: prizePoolAwarded,
      displayValue: prizeDisplay,
    },
  ];
}

/** @type {{ id: string; icon: string; title: string; description: string }[]} */
export const WHY_JOIN_DGL = [
  {
    id: "earn-points",
    icon: "🏆",
    title: "Earn DGL Points",
    description:
      "Compete in community tournaments and earn DGL Points for every placement.",
  },
  {
    id: "community-tournaments",
    icon: "👥",
    title: "Join Community Tournaments",
    description:
      "Battle across multiple titles in organized DGL community events.",
  },
  {
    id: "climb-leaderboard",
    icon: "📈",
    title: "Climb the Leaderboard",
    description:
      "Track your progress on the official DGL Points leaderboard.",
  },
  {
    id: "hall-of-champions",
    icon: "🏅",
    title: "Become a Hall of Champion",
    description:
      "Win a tournament and earn a permanent place in DGL history.",
  },
  {
    id: "prize-pools",
    icon: "🎁",
    title: "Win Prize Pools",
    description:
      "Compete for real rewards in officially hosted DGL championships.",
  },
];

/** @type {{ id: string; icon: string; title: string; description: string }[]} */
export const WHAT_IS_DGL_HIGHLIGHTS = [
  {
    id: "tournaments",
    icon: "🏆",
    title: "Community Tournaments",
    description: "Organized multi-game events for competitive players.",
  },
  {
    id: "dgl-points",
    icon: "🏅",
    title: "DGL Points",
    description: "A permanent ranking system that rewards tournament performance.",
  },
  {
    id: "hall",
    icon: "👑",
    title: "Hall of Champions",
    description: "Every championship becomes a lasting part of DGL history.",
  },
  {
    id: "community",
    icon: "👥",
    title: "Competitive Community",
    description: "A growing esports platform built for players who want to compete.",
  },
];

/**
 * DGL platform roadmap timeline.
 * Future: supabase.from("platform_milestones").select("*").order("sort_order")
 */
export const DGL_JOURNEY = {
  completed: [
    { id: "website-launch", label: "DGL Website Launch" },
    { id: "tournament-1", label: "Tournament #1" },
  ],
  upcoming: [
    { id: "tournament-2", label: "Tournament #2" },
    { id: "player-profiles", label: "Player Profiles" },
    { id: "registration-system", label: "Tournament Registration System" },
  ],
};

export { buildHallOfChampionsPreview as buildHomeHallOfChampionsPreview };
