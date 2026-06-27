import { useEffect, useRef, useState } from "react";

import TopNav from "../components/TopNav";
import HallOfChampions from "../components/leaderboard/HallOfChampions";
import DGLPointsLeaderboard from "../components/leaderboard/DGLPointsLeaderboard";
import {
  hallOfChampions,
  dglPointsLeaderboard,
} from "../config/leaderboardConfig";

export default function Leaderboard() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const [activeRank, setActiveRank] = useState(null);

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
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Rajdhani:wght@500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #060608; color: white; font-family: 'Rajdhani', Arial, sans-serif; }

        .lb-page {
          min-height: 100vh;
          background: #060608;
          position: relative;
          overflow: hidden;
          padding: clamp(1.25rem,3vw,2.5rem) clamp(1.25rem,4vw,3.5rem) 5rem;
        }

        .grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.3; pointer-events: none; z-index: 0;
        }

        .glow-1, .glow-2 {
          position: absolute; border-radius: 50%; filter: blur(140px); pointer-events: none;
        }
        .glow-1 { width: 500px; height: 500px; background: rgba(168,85,247,0.12); top: -120px; left: -100px; }
        .glow-2 { width: 450px; height: 450px; background: rgba(124,58,237,0.1); bottom: -120px; right: -100px; }

        .glow-cursor, .glow-cursor-trail {
          position: absolute; border-radius: 50%; pointer-events: none;
          opacity: 0; transition: opacity 0.5s ease;
        }
        .glow-cursor {
          width: 260px; height: 260px;
          left: var(--glow-x,50%); top: var(--glow-y,50%);
          transform: translate(-50%,-50%);
          background: radial-gradient(circle, rgba(192,132,252,0.25), transparent 70%);
          filter: blur(50px); z-index: 1;
        }
        .glow-cursor-trail {
          width: 440px; height: 440px;
          left: var(--glow-trail-x,50%); top: var(--glow-trail-y,50%);
          transform: translate(-50%,-50%);
          background: radial-gradient(circle, rgba(124,58,237,0.14), transparent 70%);
          filter: blur(80px); z-index: 0;
        }
        .lb-page.glow-active .glow-cursor,
        .lb-page.glow-active .glow-cursor-trail { opacity: 1; }

        .content { position: relative; z-index: 5; max-width: 1280px; margin: 0 auto; }

        .page-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2.2rem,6vw,3.5rem); font-weight: 900;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: #a855f7; margin-bottom: 2.5rem;
          text-shadow: 0 0 12px rgba(168,85,247,0.45), 0 0 40px rgba(168,85,247,0.12);
          animation: fadeUp 0.6s ease both, titleGlow 4s ease-in-out infinite;
        }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes titleGlow {
          0%,100% { text-shadow: 0 0 12px rgba(168,85,247,0.45), 0 0 40px rgba(168,85,247,0.12); }
          50% { text-shadow: 0 0 20px rgba(168,85,247,0.65), 0 0 50px rgba(168,85,247,0.25); }
        }
        @keyframes cardEnter { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes spinCardBorder { to { --card-border-angle: 360deg; } }

        @property --card-border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        .section-heading {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.25rem;
          color: #d1d5db;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: fadeUp 0.6s ease both 0.1s;
        }

        .section-heading::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(168,85,247,0.3), transparent);
        }

        .hall-section-heading {
          color: #fcd34d;
          text-shadow: 0 0 12px rgba(245,158,11,0.25);
        }

        .hall-section-heading::after {
          background: linear-gradient(90deg, rgba(245,158,11,0.35), transparent);
        }

        .hall-section { margin-bottom: 4rem; }

        .hall-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 900px) {
          .hall-grid { grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); }
        }

        .hall-card {
          --accent: #a855f7;
          --card-border-angle: 0deg;
          position: relative; overflow: hidden;
          border-radius: 20px; padding: 1px;
          cursor: default;
          animation: cardEnter 0.55s cubic-bezier(0.22,1,0.36,1) both;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .hall-card:hover { transform: translateY(-8px) scale(1.01); }

        .hall-card .card-border {
          position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
          background: conic-gradient(from var(--card-border-angle), transparent 0%, var(--accent) 15%, rgba(255,255,255,0.4) 22%, var(--accent) 28%, transparent 45%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.4s ease; pointer-events: none; z-index: 2;
        }
        .hall-card:hover .card-border {
          opacity: 0.85;
          animation: spinCardBorder 3s linear infinite;
        }

        .hall-card .card-shine {
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s cubic-bezier(0.22,1,0.36,1);
          pointer-events: none; z-index: 3;
        }
        .hall-card:hover .card-shine { left: 150%; }

        .hall-card .card-glow {
          position: absolute; width: 180px; height: 180px;
          background: color-mix(in srgb, var(--accent) 30%, transparent);
          border-radius: 50%; filter: blur(65px);
          top: -55px; right: -55px;
          opacity: 0; transition: opacity 0.45s ease, transform 0.45s ease;
          pointer-events: none; z-index: 0;
        }
        .hall-card:hover .card-glow { opacity: 1; transform: scale(1.2); }

        .hall-card-inner {
          position: relative; border-radius: 19px; padding: 1.75rem;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(16px); height: 100%;
          transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .hall-card-inner::before {
          content: ''; position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 10%, transparent), transparent 55%);
          opacity: 0.6; transition: opacity 0.4s ease; pointer-events: none;
        }
        .hall-card:hover .hall-card-inner {
          border-color: color-mix(in srgb, var(--accent) 45%, transparent);
          background: rgba(255,255,255,0.04);
          box-shadow: 0 20px 48px rgba(0,0,0,0.4), 0 0 32px color-mix(in srgb, var(--accent) 18%, transparent), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .hall-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          position: relative;
          z-index: 2;
        }

        .hall-tournament-badge {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #c084fc;
          background: rgba(168,85,247,0.12);
          border: 1px solid rgba(168,85,247,0.35);
          padding: 0.3rem 0.65rem;
          border-radius: 4px;
        }

        .hall-view-results {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          text-decoration: none;
          transition: text-shadow 0.2s ease;
        }
        .hall-view-results:hover {
          text-shadow: 0 0 12px color-mix(in srgb, var(--accent) 50%, transparent);
        }

        .hall-card-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 1.25rem;
          position: relative;
          z-index: 2;
          transition: text-shadow 0.3s ease;
        }
        .hall-card:hover .hall-card-title {
          text-shadow: 0 0 20px color-mix(in srgb, var(--accent) 45%, transparent);
        }

        .hall-meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          position: relative;
          z-index: 2;
        }

        .hall-meta-box {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 4px;
          padding: 0.65rem 0.85rem;
        }

        .hall-meta-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 0.2rem;
        }

        .hall-meta-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          color: #fff;
        }

        .hall-meta-value.hall-accent {
          color: var(--accent);
          text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 40%, transparent);
        }

        .hall-meta-inline {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .hall-champions-block {
          position: relative;
          z-index: 2;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 1rem;
        }

        .hall-champions-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #fcd34d;
          margin-bottom: 0.75rem;
        }

        .hall-players-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.35rem 1rem;
        }

        .hall-players-list li {
          font-weight: 700;
          font-size: 0.95rem;
          color: #e5e7eb;
          padding-left: 0.85rem;
          position: relative;
        }

        .hall-players-list li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--accent);
        }

        /* ── DGL POINTS LEADERBOARD ── */
        .dgl-section { margin-top: 1rem; }

        .dgl-header {
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(168,85,247,0.15);
        }

        .dgl-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dgl-title .slash { color: #a855f7; font-weight: 900; }

        .dgl-table-head {
          display: grid;
          grid-template-columns: 70px 1.4fr 1fr 110px 120px 130px;
          gap: 1rem;
          padding: 0 1.5rem 0.75rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6b7280;
        }

        .table-wrap {
          display: flex; flex-direction: column; gap: 0.75rem;
        }

        .row-card {
          --accent: #a855f7;
          position: relative; overflow: hidden;
          border-radius: 12px; padding: 1px;
          cursor: pointer; outline: none;
          animation: cardEnter 0.5s cubic-bezier(0.22,1,0.36,1) both;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .row-card:hover { transform: translateX(8px) scale(1.01); }
        .row-card.is-active { transform: translateX(12px) scale(1.015); }

        .row-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, var(--accent), transparent 40%);
          opacity: 0; transition: opacity 0.4s ease; z-index: 0;
        }
        .row-card:hover::before, .row-card.is-active::before { opacity: 0.15; }

        .dgl-row-inner {
          display: grid;
          grid-template-columns: 70px 1.4fr 1fr 110px 120px 130px;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 11px;
          backdrop-filter: blur(12px);
          position: relative; z-index: 2;
          transition: background 0.4s ease, border-color 0.4s ease;
        }
        .row-card:hover .dgl-row-inner, .row-card.is-active .dgl-row-inner {
          background: rgba(13, 13, 18, 0.6);
          border-color: color-mix(in srgb, var(--accent) 50%, transparent);
          box-shadow: inset 4px 0 0 var(--accent);
        }

        .row-rank-box {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem; font-weight: 900;
          color: rgba(255,255,255,0.2);
          font-style: italic;
          transition: color 0.3s ease, text-shadow 0.3s ease;
        }
        .row-card:hover .row-rank-box, .row-card.is-active .row-rank-box {
          color: var(--accent);
          text-shadow: 0 0 15px color-mix(in srgb, var(--accent) 60%, transparent);
        }
        .rank-hash { font-size: 1rem; opacity: 0.5; margin-right: 2px; }

        .row-info { display: flex; flex-direction: column; gap: 0.2rem; }
        .row-name {
          font-family: 'Orbitron', sans-serif; font-size: 1.1rem; font-weight: 800;
          letter-spacing: 0.05em; color: #e5e7eb;
          transition: color 0.3s ease;
        }
        .row-card:hover .row-name, .row-card.is-active .row-name { color: #fff; }

        .row-game-cell {
          font-size: 0.85rem; font-weight: 600; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.08em;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .row-game-cell::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent);
        }

        .row-points-cell {
          display: flex; align-items: baseline; gap: 0.3rem;
        }
        .row-points {
          font-family: 'Orbitron', sans-serif; font-size: 1.35rem; font-weight: 900;
          color: #fff;
          transition: text-shadow 0.3s ease, color 0.3s ease;
        }
        .row-card:hover .row-points, .row-card.is-active .row-points {
          color: var(--accent);
          text-shadow: 0 0 20px color-mix(in srgb, var(--accent) 60%, transparent);
        }
        .row-points-label {
          font-size: 0.65rem; font-weight: 700; color: #6b7280;
          letter-spacing: 0.12em; text-transform: uppercase;
        }

        .row-stat-cell { display: flex; flex-direction: column; gap: 0.1rem; }
        .stat-label {
          font-size: 0.62rem; font-weight: 700; color: #6b7280;
          letter-spacing: 0.12em; text-transform: uppercase;
        }
        .stat-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.95rem; font-weight: 700; color: #d1d5db;
        }

        @media (max-width: 900px) {
          .dgl-table-head { display: none; }
          .dgl-row-inner {
            grid-template-columns: 56px 1fr auto;
            grid-template-rows: auto auto auto auto;
          }
          .row-rank-box { grid-row: 1 / 3; align-self: center; }
          .row-info { grid-column: 2; grid-row: 1; }
          .row-game-cell { grid-column: 2; grid-row: 2; font-size: 0.8rem; }
          .row-points-cell { grid-column: 3; grid-row: 1 / 3; align-self: center; }
          .row-stat-cell {
            grid-column: 1 / -1;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(255,255,255,0.05);
            padding-top: 0.5rem;
          }
          .row-stat-cell:first-of-type { margin-top: 0.35rem; }
          .row-stat-cell:last-of-type { border-top: none; padding-top: 0; }
        }

        @media (max-width: 768px) {
          .lb-page { padding: 1.25rem 1rem 3rem; }
          .hall-players-list { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
          .dgl-row-inner { grid-template-columns: 50px 1fr; }
          .row-points-cell { grid-column: 1 / -1; justify-self: start; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="lb-page" ref={containerRef}>
        <div className="grid-bg" />
        <div className="glow-cursor-trail" />
        <div className="glow-cursor" />
        <div className="glow-1" />
        <div className="glow-2" />

        <div className="content">
          <TopNav />

          <h1 className="page-title">Hall of Titans</h1>

          <HallOfChampions tournaments={hallOfChampions} />

          <DGLPointsLeaderboard
            players={dglPointsLeaderboard}
            activeRank={activeRank}
            onToggleRank={(rank) => setActiveRank((current) => (current === rank ? null : rank))}
          />
        </div>
      </div>
    </>
  );
}
