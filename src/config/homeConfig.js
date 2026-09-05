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

/** Confirmed Discord community giveaway winners — homepage milestone only. */
export const giveawayWinners = [
  {
    id: "150-member",
    event: "150 Member Giveaway",
    winner: "thelonewolf",
    prize: "₹1,000 Steam Gift Card",
  },
  {
    id: "300-member",
    event: "300 Member Giveaway",
    winner: "Shinigami Ishigami",
    prize: "₹1,000 Steam Gift Card",
  },
];

export { DISCORD_INVITE_URL } from "./siteConfig";
