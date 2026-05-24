import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TopNav from "../components/TopNav";

const players = [
  { rank: 1, name: "ShadowX", game: "Valorant", points: 2450, badge: "🥇", accent: "#f59e0b" },
  { rank: 2, name: "Inferno", game: "CS2", points: 2310, badge: "🥈", accent: "#e2e8f0" },
  { rank: 3, name: "VenomYT", game: "Marvel Rivals", points: 2195, badge: "🥉", accent: "#cd7c2f" },
  { rank: 4, name: "GhostAim", game: "Apex Legends", points: 2040, accent: "#a855f7" },
  { rank: 5, name: "Nova", game: "The Finals", points: 1970, accent: "#a855f7" },
  { rank: 6, name: "FrostByte", game: "Dota 2", points: 1885, accent: "#a855f7" },
  { rank: 7, name: "RogueNinja", game: "Fortnite", points: 1810, accent: "#a855f7" },
  { rank: 8, name: "TitanSlayer", game: "FC 26", points: 1730, accent: "#a855f7" },
  { rank: 9, name: "DarkPulse", game: "Arc Raiders", points: 1695, accent: "#a855f7" },
  { rank: 10, name: "Blaze", game: "League of Legends", points: 1620, accent: "#a855f7" },
];

export default function Leaderboard() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const [activeId, setActiveId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const centerGlow = () => {
      const rect = container.getBoundingClientRect();
      const cx = rect.width / 2, cy = rect.height / 2;
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
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("resize", centerGlow); };
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
        @keyframes statusPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.85); } }
        @keyframes cardEnter { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes spinCardBorder { to { --card-border-angle: 360deg; } }

        @property --card-border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        /* ── PODIUM ── */
        .podium {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .podium-card {
          --accent: #a855f7;
          --card-border-angle: 0deg;
          position: relative; overflow: hidden;
          border-radius: 20px; padding: 1px;
          cursor: default;
          animation: cardEnter 0.55s cubic-bezier(0.22,1,0.36,1) both;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .podium-card:hover { transform: translateY(-8px) scale(1.01); }

        .podium-card .card-border {
          position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
          background: conic-gradient(from var(--card-border-angle), transparent 0%, var(--accent) 15%, rgba(255,255,255,0.4) 22%, var(--accent) 28%, transparent 45%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.4s ease; pointer-events: none; z-index: 2;
        }
        .podium-card:hover .card-border {
          opacity: 0.85;
          animation: spinCardBorder 3s linear infinite;
        }

        .podium-card .card-shine {
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s cubic-bezier(0.22,1,0.36,1);
          pointer-events: none; z-index: 3;
        }
        .podium-card:hover .card-shine { left: 150%; }

        .podium-card .card-glow {
          position: absolute; width: 180px; height: 180px;
          background: color-mix(in srgb, var(--accent) 30%, transparent);
          border-radius: 50%; filter: blur(65px);
          top: -55px; right: -55px;
          opacity: 0; transition: opacity 0.45s ease, transform 0.45s ease;
          pointer-events: none; z-index: 0;
        }
        .podium-card:hover .card-glow { opacity: 1; transform: scale(1.2); }

        .podium-inner {
          position: relative; border-radius: 19px; padding: 1.75rem;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(16px); height: 100%;
          transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .podium-inner::before {
          content: ''; position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 10%, transparent), transparent 55%);
          opacity: 0.6; transition: opacity 0.4s ease; pointer-events: none;
        }
        .podium-card:hover .podium-inner {
          border-color: color-mix(in srgb, var(--accent) 45%, transparent);
          background: rgba(255,255,255,0.04);
          box-shadow: 0 20px 48px rgba(0,0,0,0.4), 0 0 32px color-mix(in srgb, var(--accent) 18%, transparent), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .podium-card:hover .podium-inner::before { opacity: 1; }

        .podium-badge { font-size: 2rem; display: block; margin-bottom: 1rem; }
        .podium-name {
          font-family: 'Orbitron', sans-serif; font-size: 1.2rem; font-weight: 800;
          margin-bottom: 0.4rem; letter-spacing: 0.02em;
          transition: color 0.3s ease, text-shadow 0.3s ease;
        }
        .podium-card:hover .podium-name {
          color: #fff;
          text-shadow: 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent);
        }
        .podium-game {
          color: #9ca3af; font-size: 0.9rem; font-weight: 600;
          margin-bottom: 1rem; transition: color 0.3s, transform 0.3s;
        }
        .podium-card:hover .podium-game { color: #d1d5db; transform: translateX(3px); }
        .podium-points {
          font-family: 'Orbitron', sans-serif; font-size: 1.4rem; font-weight: 900;
          color: var(--accent);
          text-shadow: 0 0 16px color-mix(in srgb, var(--accent) 50%, transparent);
        }
        .podium-rp-label {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em;
          color: #6b7280; text-transform: uppercase; margin-left: 4px;
        }

        /* ── CHALLENGER LIST ── */
        .challengers-section {
          margin-top: 4rem;
        }
        .challengers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(168,85,247,0.15);
        }
        .challengers-title {
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
        .challengers-title .slash { color: var(--accent, #a855f7); font-weight: 900; }
        .challengers-filters {
          display: flex; gap: 1rem;
        }
        .filter-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: #9ca3af;
          padding: 0.4rem 1rem;
          border-radius: 4px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .filter-btn:hover, .filter-btn.active {
          background: rgba(168,85,247,0.15);
          border-color: #a855f7;
          color: #fff;
          text-shadow: 0 0 10px rgba(168,85,247,0.5);
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

        .row-inner {
          display: grid;
          grid-template-columns: 80px 1.5fr 1.5fr 150px;
          align-items: center; padding: 1rem 1.5rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 11px;
          backdrop-filter: blur(12px);
          position: relative; z-index: 2;
          transition: background 0.4s ease, border-color 0.4s ease;
        }
        .row-card:hover .row-inner, .row-card.is-active .row-inner {
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
        .row-game {
          font-size: 0.85rem; font-weight: 600; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.1em;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .row-game::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--accent);
        }

        .row-stats {
          display: flex; gap: 2rem;
        }
        .stat-box { display: flex; flex-direction: column; gap: 0.1rem; }
        .stat-label {
          font-size: 0.65rem; font-weight: 700; color: #6b7280;
          letter-spacing: 0.15em; text-transform: uppercase;
        }
        .stat-value {
          font-family: 'JetBrains Mono', 'Orbitron', monospace;
          font-size: 0.95rem; font-weight: 700; color: #d1d5db;
        }

        .row-score {
          display: flex; align-items: baseline; justify-content: flex-end; gap: 0.3rem;
        }
        .row-points {
          font-family: 'Orbitron', sans-serif; font-size: 1.4rem; font-weight: 900;
          color: #fff;
          transition: text-shadow 0.3s ease;
        }
        .row-card:hover .row-points, .row-card.is-active .row-points {
          color: var(--accent);
          text-shadow: 0 0 20px color-mix(in srgb, var(--accent) 60%, transparent);
        }
        .row-rp-label {
          font-size: 0.75rem; font-weight: 700; color: #6b7280;
          letter-spacing: 0.1em; text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .row-inner { grid-template-columns: 60px 1.5fr 1fr; gap: 1rem; }
          .row-stats { display: none; }
        }
        @media (max-width: 768px) {
          .podium { grid-template-columns: 1fr; }
          .lb-page { padding: 1.25rem 1rem 3rem; }
        }
        @media (max-width: 600px) {
          .challengers-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .row-inner { grid-template-columns: 50px 1fr; gap: 0.5rem; }
          .row-score { display: none; }
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

          {/* PODIUM — top 3 */}
          <div className="podium">
            {players.slice(0, 3).map((p, i) => (
              <div
                className="podium-card"
                key={p.rank}
                style={{ "--accent": p.accent, animationDelay: `${i * 0.08}s` }}
              >
                <div className="card-border" aria-hidden />
                <div className="card-shine" aria-hidden />
                <div className="card-glow" aria-hidden />
                <div className="podium-inner">
                  <span className="podium-badge">{p.badge}</span>
                  <div className="podium-name">{p.name}</div>
                  <div className="podium-game">{p.game}</div>
                  <div className="podium-points">
                    {p.points.toLocaleString()}
                    <span className="podium-rp-label">RP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CHALLENGERS — ranks 4–10 */}
          <div className="challengers-section">
            <div className="challengers-header">
              <h2 className="challengers-title"><span className="slash">///</span> Global Challengers</h2>
              <div className="challengers-filters">
                <button className={`filter-btn ${activeFilter === "ALL" ? "active" : ""}`} onClick={() => setActiveFilter("ALL")}>ALL</button>
                <button className={`filter-btn ${activeFilter === "FPS" ? "active" : ""}`} onClick={() => setActiveFilter("FPS")}>FPS</button>
                <button className={`filter-btn ${activeFilter === "MOBA" ? "active" : ""}`} onClick={() => setActiveFilter("MOBA")}>MOBA</button>
              </div>
            </div>

            <div className="table-wrap">
              {players.slice(3)
                .filter(p => {
                  if (activeFilter === "ALL") return true;
                  const fpsGames = ["Valorant", "CS2", "Apex Legends", "The Finals", "Fortnite", "Arc Raiders"];
                  const mobaGames = ["Marvel Rivals", "Dota 2", "League of Legends"];
                  if (activeFilter === "FPS") return fpsGames.includes(p.game);
                  if (activeFilter === "MOBA") return mobaGames.includes(p.game);
                  return true;
                })
                .map((p, i) => {
                const winRate = 75 - (p.rank * 1.5);
                const matches = 500 - p.rank * 10;
                return (
                  <div
                    className={`row-card${activeId === p.rank ? " is-active" : ""}`}
                    key={p.rank}
                    style={{ "--accent": p.accent, animationDelay: `${0.24 + i * 0.06}s` }}
                    onClick={() => setActiveId(id => id === p.rank ? null : p.rank)}
                  >
                    <div className="row-inner">
                      <div className="row-rank-box">
                        <span className="rank-hash">#</span>{p.rank}
                      </div>
                      <div className="row-info">
                        <div className="row-name">{p.name}</div>
                        <div className="row-game">{p.game}</div>
                      </div>
                      <div className="row-stats">
                        <div className="stat-box">
                          <span className="stat-label">WIN RATE</span>
                          <span className="stat-value">{winRate.toFixed(1)}%</span>
                        </div>
                        <div className="stat-box">
                          <span className="stat-label">MATCHES</span>
                          <span className="stat-value">{matches}</span>
                        </div>
                      </div>
                      <div className="row-score">
                        <div className="row-points">{p.points.toLocaleString()}</div>
                        <div className="row-rp-label">RP</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}