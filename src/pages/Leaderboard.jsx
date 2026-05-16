import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

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

        .top-bar { margin-bottom: 2.5rem; }

        .nav-logo {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem; font-weight: 800;
          letter-spacing: 0.2em; color: #a855f7;
          text-decoration: none;
          text-shadow: 0 0 20px rgba(168,85,247,0.4);
          display: inline-block;
          transition: color 0.3s ease, text-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .nav-logo:hover {
          color: #e9d5ff;
          text-shadow: 0 0 28px rgba(168,85,247,0.65);
          transform: scale(1.05);
        }

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

        /* ── TABLE ROWS ── */
        .table-wrap {
          display: flex; flex-direction: column; gap: 0.6rem;
        }

        .row-card {
          --accent: #a855f7;
          --card-border-angle: 0deg;
          position: relative; overflow: hidden;
          border-radius: 14px; padding: 1px;
          cursor: pointer; outline: none;
          animation: cardEnter 0.5s cubic-bezier(0.22,1,0.36,1) both;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .row-card:hover { transform: translateX(6px) scale(1.005); }
        .row-card.is-active { transform: translateX(8px) scale(1.008); }

        .row-card .card-border {
          position: absolute; inset: 0; border-radius: inherit; padding: 1px;
          background: conic-gradient(from var(--card-border-angle), transparent 0%, var(--accent) 15%, rgba(255,255,255,0.4) 22%, var(--accent) 28%, transparent 45%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.4s ease; pointer-events: none; z-index: 2;
        }
        .row-card:hover .card-border,
        .row-card.is-active .card-border {
          opacity: 0.7;
          animation: spinCardBorder 3s linear infinite;
        }

        .row-card .card-shine {
          position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s cubic-bezier(0.22,1,0.36,1);
          pointer-events: none; z-index: 3;
        }
        .row-card:hover .card-shine,
        .row-card.is-active .card-shine { left: 150%; }

        .row-inner {
          display: grid;
          grid-template-columns: 80px 1.5fr 1fr 120px 100px;
          align-items: center; padding: 1.1rem 1.5rem;
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 13px;
          backdrop-filter: blur(12px);
          transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
          position: relative;
        }
        .row-inner::before {
          content: ''; position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 8%, transparent), transparent 60%);
          opacity: 0; transition: opacity 0.4s ease; pointer-events: none;
        }
        .row-card:hover .row-inner,
        .row-card.is-active .row-inner {
          background: rgba(255,255,255,0.04);
          border-color: color-mix(in srgb, var(--accent) 35%, transparent);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3), 0 0 20px color-mix(in srgb, var(--accent) 10%, transparent);
        }
        .row-card:hover .row-inner::before,
        .row-card.is-active .row-inner::before { opacity: 1; }

        .row-rank {
          font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: 900;
          color: #6b7280; letter-spacing: 0.05em;
          transition: color 0.3s ease;
        }
        .row-card:hover .row-rank,
        .row-card.is-active .row-rank { color: var(--accent); }

        .row-name {
          font-family: 'Orbitron', sans-serif; font-size: 0.95rem; font-weight: 800;
          letter-spacing: 0.02em;
          transition: color 0.3s ease, text-shadow 0.3s ease, transform 0.3s ease;
        }
        .row-card:hover .row-name,
        .row-card.is-active .row-name {
          color: #fff;
          text-shadow: 0 0 16px color-mix(in srgb, var(--accent) 40%, transparent);
          transform: translateX(3px);
        }

        .row-game {
          font-size: 0.9rem; font-weight: 600; color: #9ca3af;
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .row-card:hover .row-game,
        .row-card.is-active .row-game { color: #d1d5db; transform: translateX(3px); }

        .row-points {
          font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: 900;
          color: var(--accent);
          transition: text-shadow 0.3s ease;
        }
        .row-card:hover .row-points,
        .row-card.is-active .row-points {
          text-shadow: 0 0 12px color-mix(in srgb, var(--accent) 60%, transparent);
        }

        .row-status {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.3rem 0.65rem; border-radius: 6px;
          font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25);
          color: #c084fc; width: fit-content;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        .row-status::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: #a855f7; box-shadow: 0 0 6px #a855f7;
          animation: statusPulse 2s ease-in-out infinite;
        }
        .row-card:hover .row-status,
        .row-card.is-active .row-status {
          transform: scale(1.05);
          box-shadow: 0 0 16px rgba(168,85,247,0.2);
        }

        .table-header-row {
          display: grid;
          grid-template-columns: 80px 1.5fr 1fr 120px 100px;
          padding: 0.5rem 1.5rem 1rem;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #52526b;
          font-family: 'Rajdhani', sans-serif;
        }

        @media (max-width: 768px) {
          .podium { grid-template-columns: 1fr; }
          .table-header-row { display: none; }
          .row-inner { grid-template-columns: 60px 1fr 1fr; gap: 0.5rem; }
          .row-points, .row-status { display: none; }
          .lb-page { padding: 1.25rem 1rem 3rem; }
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
          <div className="top-bar">
            <Link to="/" className="nav-logo">DGL</Link>
          </div>

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

          {/* TABLE — ranks 4–10 */}
          <div className="table-header-row">
            <div>Rank</div>
            <div>Player</div>
            <div>Main Game</div>
            <div>RP</div>
            <div>Status</div>
          </div>

          <div className="table-wrap">
            {players.slice(3).map((p, i) => (
              <div
                className={`row-card${activeId === p.rank ? " is-active" : ""}`}
                key={p.rank}
                style={{ "--accent": p.accent, animationDelay: `${0.24 + i * 0.06}s` }}
                onClick={() => setActiveId(id => id === p.rank ? null : p.rank)}
              >
                <div className="card-border" aria-hidden />
                <div className="card-shine" aria-hidden />
                <div className="row-inner">
                  <div className="row-rank">#{p.rank}</div>
                  <div className="row-name">{p.name}</div>
                  <div className="row-game">{p.game}</div>
                  <div className="row-points">{p.points.toLocaleString()}</div>
                  <div className="row-status">Active</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}