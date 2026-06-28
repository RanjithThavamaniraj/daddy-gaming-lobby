/**
 * Dashboard page data — derived from tournaments, leaderboard, and games config.
 * Future: load via Supabase and pass into dashboard components as props.
 */

import { DGL_GAMES } from "./dglGamesConfig";
import {
  buildCommunityActivity,
  buildDashboardStats,
  buildHallOfChampionsPreview,
  buildLeaderboardPreview,
  buildUpcomingTournamentPreview,
} from "../lib/dashboardModel";

export const dashboardStats = buildDashboardStats();
export const communityActivity = buildCommunityActivity();
export const dglGames = DGL_GAMES;
export const upcomingTournamentPreview = buildUpcomingTournamentPreview();
export const hallOfChampionsPreview = buildHallOfChampionsPreview();
export const leaderboardPreview = buildLeaderboardPreview(5);
