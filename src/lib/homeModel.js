import {
  formatGlobalTournamentNumber,
  getCompletedTournaments,
  getUpcomingTournaments,
} from "./tournamentModel";
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

export const WHAT_IS_DGL_INTRO =
  "Daddy Gaming Lobby is a multi-game community esports platform. We host organized tournaments across supported titles, award DGL Points for every placement, and permanently archive every championship in the Hall of Champions.";

/** Platform pillars — what DGL is (mechanics, not player motivation). */
export const WHAT_IS_DGL_HIGHLIGHTS = [
  {
    id: "multi-game",
    icon: "🎮",
    title: "Multi-Game Tournaments",
    description:
      "Competitive events across Valorant, CS2, FC26, and the full DGL game roadmap.",
  },
  {
    id: "dgl-points",
    icon: "🏅",
    title: "DGL Points System",
    description:
      "Every tournament placement earns DGL Points that feed the official platform leaderboard.",
  },
  {
    id: "hall-archive",
    icon: "👑",
    title: "Permanent Legacy",
    description:
      "Every completed championship is archived forever in the Hall of Champions.",
  },
];

/** Player motivations — why to join (distinct from platform pillars above). */
export const WHY_JOIN_DGL = [
  {
    id: "prove-skill",
    icon: "⚔️",
    title: "Prove Your Skill",
    description:
      "Step into organized community tournaments built for players who want real competition.",
  },
  {
    id: "climb-rankings",
    icon: "📈",
    title: "Climb the Rankings",
    description:
      "Stack DGL Points across events and track your rise on the official leaderboard.",
  },
  {
    id: "make-history",
    icon: "🏆",
    title: "Make History",
    description:
      "Win a championship and earn a permanent place in DGL esports history.",
  },
  {
    id: "win-prizes",
    icon: "🎁",
    title: "Win Real Prizes",
    description:
      "Compete for official DGL prize pools in hosted championship events.",
  },
  {
    id: "join-community",
    icon: "👥",
    title: "Join the Community",
    description:
      "Connect on Discord, find teammates, and stay ready for the next DGL event.",
  },
];

export const FEATURED_GAMES_INTRO =
  "DGL tournaments span multiple competitive titles. Events are announced per game on Discord and the Tournaments page.";

export const COMMUNITY_STATS_INTRO =
  "Live platform numbers from completed DGL events. Full activity and widgets are on the Dashboard.";

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
      id: "players-competed",
      label: "Players Competed",
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

/**
 * DGL platform roadmap — completed milestones derived from tournament registry.
 * Future: supabase.from("platform_milestones").select("*").order("sort_order")
 */
export function buildDglJourney() {
  const completedTournaments = getCompletedTournaments().sort(
    (a, b) => a.globalNumber - b.globalNumber
  );
  const upcomingTournaments = getUpcomingTournaments().sort(
    (a, b) => a.globalNumber - b.globalNumber
  );

  return {
    completed: [
      { id: "website-launch", label: "DGL Website Launch" },
      ...completedTournaments.map((t) => ({
        id: t.id,
        label: t.tournamentNumber,
      })),
    ],
    upcoming: [
      ...upcomingTournaments.map((t) => ({
        id: t.id,
        label: t.tournamentNumber,
      })),
      { id: "player-profiles", label: "Player Profiles" },
      { id: "registration-system", label: "Tournament Registration System" },
    ],
  };
}

/**
 * Lightweight next-event teaser for the homepage.
 * Future: supabase.from("tournaments").select("*").eq("status", "Coming Soon").order("number").limit(1)
 */
export function buildHomeUpcomingTeaser() {
  const next = getUpcomingTournaments().sort(
    (a, b) => a.globalNumber - b.globalNumber
  )[0];
  if (!next) return null;

  return {
    tournamentNumber: next.tournamentNumber,
    championshipName: next.championshipName,
    message: "Announcement coming soon — follow Discord for the reveal.",
  };
}

export { buildHallOfChampionsPreview as buildHomeHallOfChampionsPreview };
