import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import TopNav from "../../TopNav";
import TournamentResultsHero from "./TournamentResultsHero";
import TournamentResultsChampions from "./TournamentResultsChampions";
import TournamentResultsRunnerUp from "./TournamentResultsRunnerUp";
import TournamentResultsPlayerTier from "./TournamentResultsPlayerTier";
import RegisteredPlayersGrid from "../RegisteredPlayersGrid";
import { fetchTournamentParticipants } from "../../../lib/supabase/registrations";
import { tournamentResultsPageStyles } from "../../../styles/tournamentResultsPageStyles";
import { registeredPlayersStyles } from "../../../styles/playerProfilePageStyles";

/**
 * Reusable tournament results layout.
 * Pass a tournament results object — future Supabase fetch maps into this shape.
 *
 * @param {object} props
 * @param {import("../../../lib/tournamentModel").ReturnType<import("../../../lib/tournamentModel").enrichTournament> | null} props.tournament
 */
export default function TournamentResultsView({ tournament }) {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const [participants, setParticipants] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const tid = tournament?.tournamentId;
    if (!tid) return undefined;
    fetchTournamentParticipants(tid)
      .then((rows) => {
        if (!cancelled) setParticipants(rows);
      })
      .catch(() => {
        if (!cancelled) setParticipants([]);
      });
    return () => {
      cancelled = true;
    };
  }, [tournament?.tournamentId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !tournament) return;

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
  }, [tournament]);

  if (!tournament) {
    return (
      <>
        <style>{tournamentResultsPageStyles}</style>
        <div className="results-page">
          <div className="grid-bg" />
          <div className="glow-1" />
          <div className="glow-2" />
          <div className="results-shell">
            <TopNav />
            <div className="results-summary-card" style={{ "--accent": "#a855f7" }}>
              <div className="results-summary-inner results-not-found">
                <h1 className="results-hero-title">Tournament Not Found</h1>
                <p className="results-reward-label" style={{ marginTop: "1rem" }}>
                  The requested tournament results could not be located.
                </p>
                <div className="results-nav" style={{ marginTop: "2rem" }}>
                  <Link to="/tournaments" className="cyber-btn outline results-back-btn">
                    ← Back to Tournaments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{tournamentResultsPageStyles}</style>
      <style>{registeredPlayersStyles}</style>
      <div className="results-page" ref={containerRef}>
        <div className="grid-bg" />
        <div className="glow-cursor-trail" />
        <div className="glow-cursor" />
        <div className="glow-1" />
        <div className="glow-2" />

        <div className="results-shell">
          <TopNav />

          <TournamentResultsHero tournament={tournament} />

          <TournamentResultsChampions
            players={tournament.championPlayers}
            dglPoints={tournament.pointsAwarded?.champion ?? tournament.dglPoints}
          />

          <TournamentResultsRunnerUp
            players={tournament.runnerUpPlayers}
            dglPoints={tournament.pointsAwarded?.runnerUp ?? tournament.runnerUpDglPoints}
          />

          <TournamentResultsPlayerTier
            icon="🥉"
            heading="Semi Finalists"
            badgeLabel="Semi Finalist"
            players={tournament.semiFinalistPlayers}
            dglPoints={tournament.pointsAwarded?.semiFinalist}
          />

          <TournamentResultsPlayerTier
            icon="🎯"
            heading="Quarter Finalists"
            badgeLabel="Quarter Finalist"
            players={tournament.quarterFinalistPlayers}
            dglPoints={tournament.pointsAwarded?.quarterFinalist}
          />

          <TournamentResultsPlayerTier
            icon="👥"
            heading="Participants"
            badgeLabel="Participant"
            players={tournament.groupStagePlayers}
            dglPoints={tournament.pointsAwarded?.groupStage}
          />

          <RegisteredPlayersGrid
            players={participants}
            accent={tournament.accent}
            title="Participants"
            emptyMessage="No participants recorded."
          />

          <nav className="results-nav">
            <Link to="/tournaments" className="cyber-btn outline results-back-btn">
              ← Back to Tournaments
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
