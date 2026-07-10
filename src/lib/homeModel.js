import { DGL_GAMES } from "../config/dglGamesConfig";
import {
  getCompletedTournaments,
  getUpcomingTournaments,
} from "./tournamentModel";
import { buildHallOfChampionsPreview } from "./dashboardModel";
import { aggregateCompletedTournamentStats } from "./tournamentStats";

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

/** One-line game blurbs — no tournament details. */
export const HOME_GAME_TAGLINES = {
  valorant: "Tactical 5v5 shooter on the DGL competitive circuit.",
  cs2: "Classic tactical FPS built for community championships.",
  "fc-26": "Competitive football joining the DGL roster.",
  "marvel-rivals": "Hero team battles in the multi-game lineup.",
  "apex-legends": "Battle royale squads on the DGL roadmap.",
  "delta-force": "Tactical military FPS scheduled for DGL events.",
  "rocket-league": "High-speed sports action on the DGL roadmap.",
  "arc-raiders": "Extraction co-op title planned for DGL play.",
};

/** Combined platform value props — short copy only. */
export const WHY_DGL_PILLARS = [
  {
    id: "community-tournaments",
    icon: "🏆",
    title: "Community Tournaments",
    description: "Organized DGL championships open to the community.",
  },
  {
    id: "dgl-points",
    icon: "🏅",
    title: "Earn DGL Points",
    description: "Every placement earns points on the official leaderboard.",
  },
  {
    id: "competitive-community",
    icon: "👥",
    title: "Competitive Community",
    description: "Find teammates and compete with driven players on Discord.",
  },
  {
    id: "multi-game",
    icon: "🎮",
    title: "Multi-Game Platform",
    description: "One home for shooters, sports, and the full DGL roadmap.",
  },
  {
    id: "player-history",
    icon: "📈",
    title: "Build Your Player History",
    description: "Track results and legacy across every event you enter.",
  },
  {
    id: "prize-pools",
    icon: "🎁",
    title: "Win Real Prize Pools",
    description: "Official DGL prize pools in hosted championship events.",
  },
];

/**
 * @param {string} gameSlug
 * @returns {{ status: string; label: string }}
 */
function deriveGameRoadmapStatus(gameSlug) {
  const hasCompleted = getCompletedTournaments().some((t) => t.gameSlug === gameSlug);
  const hasUpcoming = getUpcomingTournaments().some((t) => t.gameSlug === gameSlug);

  if (hasCompleted) {
    return { status: "available", label: "Available" };
  }
  if (hasUpcoming) {
    return { status: "coming-soon", label: "Coming Soon" };
  }
  return { status: "planned", label: "Planned" };
}

/**
 * Featured games with roadmap status — no tournament details.
 * Future: supabase.from("games").select("*").eq("featured", true).order("sort_order")
 */
export function buildHomeFeaturedGames() {
  return HOME_FEATURED_GAME_IDS.map((id) => {
    const game = DGL_GAMES.find((g) => g.id === id);
    if (!game) return null;

    const { status, label } = deriveGameRoadmapStatus(id);

    return {
      ...game,
      tagline: HOME_GAME_TAGLINES[id] ?? game.category,
      status,
      statusLabel: label,
    };
  }).filter(Boolean);
}

/**
 * Compact announcement strip below the hero.
 * Future: supabase.from("platform_updates").select("*").order("created_at", { ascending: false }).limit(1)
 */
export function buildLatestPlatformUpdate() {
  const latestCompleted = [...getCompletedTournaments()].sort(
    (a, b) => b.globalNumber - a.globalNumber
  )[0];
  const nextUpcoming = [...getUpcomingTournaments()].sort(
    (a, b) => a.globalNumber - b.globalNumber
  )[0];

  if (!latestCompleted && !nextUpcoming) return null;

  /** @type {{ id: string; icon: string; text: string }[]} */
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

    const prizeText = latestCompleted.prizePool?.replace(/\s*Awarded$/i, "") ?? "TBA";
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
          label: "NEXT EVENT",
          title: `⚽ ${(nextUpcoming.championshipLabel ?? nextUpcoming.game).replace(/\s+/g, '')} TOURNAMENT #${nextUpcoming.globalNumber}`,
          time: "Tomorrow • 9:30 PM IST",
        }
      : null,
  };
}

/**
 * Aggregated proof stats from completed DGL events.
 * Future: supabase.rpc("get_home_community_proof_stats")
 */
function buildCommunityProofStats() {
  const stats = aggregateCompletedTournamentStats();

  return [
    {
      id: "tournaments-hosted",
      icon: "🏆",
      label: "Tournaments Hosted",
      value: stats.tournamentsHosted,
    },
    {
      id: "registered-players",
      icon: "👥",
      label: "Registered Players",
      value: stats.registeredPlayers,
    },
    {
      id: "champions-crowned",
      icon: "🏅",
      label: "Champions Crowned",
      value: stats.championsCrowned,
    },
    {
      id: "prize-pool-awarded",
      icon: "💰",
      label: "Prize Pool Awarded",
      value: stats.prizePoolAwarded,
      displayValue: stats.prizePoolDisplay,
    },
  ];
}

/**
 * Community proof — stats plus latest Hall of Champions highlight.
 * Future: supabase.rpc("get_home_community_proof")
 */
export function buildHomeCommunityProof() {
  const hallPreview = buildHallOfChampionsPreview();
  const stats = buildCommunityProofStats();

  return {
    stats,
    latestChampion: hallPreview
      ? {
          tournamentNumber: hallPreview.tournamentNumber,
          championshipName: hallPreview.championshipName ?? hallPreview.name,
          resultsPath: hallPreview.resultsPath,
          accent: hallPreview.accent,
        }
      : null,
  };
}
