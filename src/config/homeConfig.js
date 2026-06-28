/**
 * Homepage data — derived from central DGL configs.
 * Future: load via Supabase and pass into home components as props.
 */

import { DGL_GAMES } from "./dglGamesConfig";
import {
  HOME_FEATURED_GAME_IDS,
  WHY_JOIN_DGL,
  WHAT_IS_DGL_INTRO,
  WHAT_IS_DGL_HIGHLIGHTS,
  FEATURED_GAMES_INTRO,
  COMMUNITY_STATS_INTRO,
  buildHomeCommunityStats,
  buildHomeHallOfChampionsPreview,
  buildDglJourney,
  buildHomeUpcomingTeaser,
} from "../lib/homeModel";

export const homeFeaturedGames = HOME_FEATURED_GAME_IDS.map((id) =>
  DGL_GAMES.find((game) => game.id === id)
).filter(Boolean);

export const homeCommunityStats = buildHomeCommunityStats();
export const whyJoinDgl = WHY_JOIN_DGL;
export const whatIsDglIntro = WHAT_IS_DGL_INTRO;
export const whatIsDglHighlights = WHAT_IS_DGL_HIGHLIGHTS;
export const featuredGamesIntro = FEATURED_GAMES_INTRO;
export const communityStatsIntro = COMMUNITY_STATS_INTRO;
export const dglJourney = buildDglJourney();
export const homeUpcomingTeaser = buildHomeUpcomingTeaser();
export const homeHallOfChampionsPreview = buildHomeHallOfChampionsPreview();

export const DISCORD_INVITE_URL = "https://discord.gg/gf7Ecat6Ka";
