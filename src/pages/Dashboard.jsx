import { useRef } from "react";

import TopNav from "../components/TopNav";
import PageMeta from "../components/PageMeta";
import useCursorGlow from "../hooks/useCursorGlow";
import useSupabaseData from "../hooks/useSupabaseData";
import DashboardStats from "../components/dashboard/DashboardStats";
import GameRealmsGrid from "../components/dashboard/GameRealmsGrid";
import CommunityActivity from "../components/dashboard/CommunityActivity";
import DashboardUpcomingWidget from "../components/dashboard/DashboardUpcomingWidget";
import HallOfChampionsWidget from "../components/dashboard/HallOfChampionsWidget";
import LeaderboardPreview from "../components/dashboard/LeaderboardPreview";
import {
  communityActivity,
  dashboardStats,
  dglGames,
  hallOfChampionsPreview,
  leaderboardPreview,
  upcomingTournamentPreview,
} from "../config/dashboardConfig";
import { fetchDashboardPageData } from "../lib/supabase/dglRepository";
import { DISCORD_INVITE_URL, PAGE_META } from "../config/siteConfig";
import { dashboardPageStyles } from "../styles/dashboardPageStyles";

export default function Dashboard() {
  const dashboardData = useSupabaseData(
    {
      stats: dashboardStats,
      activity: communityActivity,
      upcomingPreview: upcomingTournamentPreview,
      hallPreview: hallOfChampionsPreview,
      leaderboardPreview,
      games: dglGames,
    },
    fetchDashboardPageData
  );
  const {
    stats,
    activity,
    upcomingPreview,
    hallPreview,
    leaderboardPreview: leaderboardTop,
    games,
  } = dashboardData;
  const containerRef = useRef(null);

  useCursorGlow(containerRef, {
    parallaxStrength: 40,
    glowLerp: 0.1,
    trailLerp: 0.04,
  });

  return (
    <>
      <PageMeta {...PAGE_META.dashboard} />
      <style>{dashboardPageStyles}</style>

      <div className="dashboard-container" ref={containerRef}>
        <div className="grid-bg" />
        <div className="scanline" />
        <div className="glow-cursor-trail" />
        <div className="glow-cursor" />
        <div className="dashboard-glow-1" />
        <div className="dashboard-glow-2" />

        <div className="dashboard-content">
          <TopNav>
            <div className="topbar-right">
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-join-btn"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Quick Match
              </a>
              <div className="status-pill">
                <span className="status-dot" />
                System Online
              </div>
            </div>
          </TopNav>

          <h1 className="page-title">Titan Dashboard</h1>

          <DashboardStats stats={stats} />

          <div className="dashboard-grid">
            <GameRealmsGrid games={games} />
            <CommunityActivity items={activity} />
          </div>

          <div className="dashboard-widgets-row">
            <DashboardUpcomingWidget tournament={upcomingPreview} />
            <HallOfChampionsWidget tournament={hallPreview} />
            <LeaderboardPreview players={leaderboardTop} />
          </div>
        </div>
      </div>
    </>
  );
}
