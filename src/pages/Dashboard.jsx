import { useEffect, useRef } from "react";

import TopNav from "../components/TopNav";
import AnimatedNumber from "../components/dashboard/AnimatedNumber";
import DashboardStats from "../components/dashboard/DashboardStats";
import GameRealmsGrid from "../components/dashboard/GameRealmsGrid";
import CommunityActivity from "../components/dashboard/CommunityActivity";
import UpcomingTournamentCard from "../components/dashboard/UpcomingTournamentCard";
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
import { dashboardPageStyles } from "../styles/dashboardPageStyles";

export default function Dashboard() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const parallaxRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const registeredPlayers =
    dashboardStats.find((stat) => stat.id === "registered-players")?.value ?? 0;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const centerGlow = () => {
      const rect = container.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      mouseRef.current = { x: cx, y: cy };
      glowRef.current = { x: cx, y: cy };
      trailRef.current = { x: cx, y: cy };
      container.style.setProperty("--glow-x", `${cx}px`);
      container.style.setProperty("--glow-y", `${cy}px`);
      container.style.setProperty("--glow-trail-x", `${cx}px`);
      container.style.setProperty("--glow-trail-y", `${cy}px`);
    };

    centerGlow();

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      parallaxRef.current = { x: nx * 40, y: ny * 40 };
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        container.classList.add("glow-active");
      }
    };

    const handleResize = () => centerGlow();

    let rafId;
    const animate = () => {
      const lerp = (c, t, f) => c + (t - c) * f;
      glowRef.current.x = lerp(glowRef.current.x, mouseRef.current.x, 0.1);
      glowRef.current.y = lerp(glowRef.current.y, mouseRef.current.y, 0.1);
      trailRef.current.x = lerp(trailRef.current.x, mouseRef.current.x, 0.04);
      trailRef.current.y = lerp(trailRef.current.y, mouseRef.current.y, 0.04);
      container.style.setProperty("--glow-x", `${glowRef.current.x}px`);
      container.style.setProperty("--glow-y", `${glowRef.current.y}px`);
      container.style.setProperty("--glow-trail-x", `${trailRef.current.x}px`);
      container.style.setProperty("--glow-trail-y", `${trailRef.current.y}px`);
      container.style.setProperty("--parallax-x", `${parallaxRef.current.x}px`);
      container.style.setProperty("--parallax-y", `${parallaxRef.current.y}px`);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
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
                href="https://discord.gg/gf7Ecat6Ka"
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
              <div className="online-box">
                <div className="online-label">Registered Players</div>
                <div className="online-count">
                  <AnimatedNumber value={registeredPlayers} />
                </div>
              </div>
              <div className="status-pill">
                <span className="status-dot" />
                System Online
              </div>
            </div>
          </TopNav>

          <h1 className="page-title">Titan Dashboard</h1>

          <DashboardStats stats={dashboardStats} />

          <div className="dashboard-grid">
            <GameRealmsGrid games={dglGames} />
            <CommunityActivity items={communityActivity} />
          </div>

          <div className="dashboard-widgets-row">
            <UpcomingTournamentCard tournament={upcomingTournamentPreview} />
            <HallOfChampionsWidget tournament={hallOfChampionsPreview} />
            <LeaderboardPreview players={leaderboardPreview} />
          </div>
        </div>
      </div>
    </>
  );
}
