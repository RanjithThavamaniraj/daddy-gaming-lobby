import { useEffect, useRef } from "react";

import TopNav from "../components/TopNav";
import FeaturedTournament from "../components/tournaments/FeaturedTournament";
import UpcomingTournamentCard from "../components/tournaments/UpcomingTournamentCard";
import CompletedTournamentCard from "../components/tournaments/CompletedTournamentCard";
import {
  getTournamentsPageLayout,
} from "../config/tournamentConfig";
import { tournamentsPageStyles } from "../styles/tournamentsPageStyles";

export default function Tournaments() {
  const { mainEvent, upcomingDisplay, showCompletedArchive, archivedCompleted } =
    getTournamentsPageLayout();
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

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
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        container.classList.add("glow-active");
      }
    };

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
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", centerGlow);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", centerGlow);
    };
  }, []);

  return (
    <>
      <style>{tournamentsPageStyles}</style>

      <div className="tournaments-page" ref={containerRef}>
        <div className="grid-bg" />
        <div className="glow-cursor-trail" />
        <div className="glow-cursor" />
        <div className="glow-1" />
        <div className="glow-2" />

        <div className="content">
          <TopNav />

          <h1 className="page-title">Titan Grindhouse</h1>

          <div className="layout-grid">
            <FeaturedTournament tournament={mainEvent} />

            {upcomingDisplay.length > 0 ? (
              <section className="upcoming-section">
                <h2 className="section-heading">Upcoming Tournaments</h2>
                <div className="hub-cards-grid">
                  {upcomingDisplay.map((tournament, index) => (
                    <UpcomingTournamentCard
                      key={tournament.id}
                      tournament={{ ...tournament, index }}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {showCompletedArchive ? (
              <section className="completed-section">
                <h2 className="section-heading">Completed Tournaments</h2>
                <div className="hub-cards-grid">
                  {archivedCompleted.map((tournament, index) => (
                    <CompletedTournamentCard
                      key={tournament.id}
                      tournament={{ ...tournament, index }}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
