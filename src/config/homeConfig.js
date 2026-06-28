/**
 * Homepage data — derived from central DGL configs.
 * Future: load via Supabase and pass into home components as props.
 */

import {
  WHY_DGL_PILLARS,
  buildHomeFeaturedGames,
  buildLatestPlatformUpdate,
  buildHomeCommunityProof,
} from "../lib/homeModel";

export const whyDglPillars = WHY_DGL_PILLARS;
export const homeFeaturedGames = buildHomeFeaturedGames();
export const latestPlatformUpdate = buildLatestPlatformUpdate();
export const homeCommunityProof = buildHomeCommunityProof();

export { DISCORD_INVITE_URL } from "./siteConfig";
