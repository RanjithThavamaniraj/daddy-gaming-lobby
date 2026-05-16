import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function GameIcon({ slug }) {
  const icons = {
    "arc-raiders": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 4L28 26H4L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="16" cy="18" r="3" fill="currentColor" />
      </svg>
    ),
    "apex-legends": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 6L26 26H6L16 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 22h12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "marvel-rivals": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="11" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
        <circle cx="21" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    valorant: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M8 26L16 6l8 20H8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    cs2: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="6" y="12" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M10 12V9a6 6 0 0112 0v3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    lol: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M10 8h12v16H10V8z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "dota-2": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M6 16c0-6 4.5-10 10-10s10 4 10 10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "fc-26": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "the-finals": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M8 22V10l8-4 8 4v12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  };
  return icons[slug] ?? icons.valorant;
}

const tournaments = [
  {
    id: "arc-raiders",
    game: "Arc Raiders",
    slug: "arc-raiders",
    mode: "Extraction Cup",
    players: "18/24 Players",
    time: "Today • 7:00 PM",
    accent: "#ff6b4a",
  },
  {
    id: "apex-legends",
    game: "Apex Legends",
    slug: "apex-legends",
    mode: "Ranked Clash",
    players: "42/60 Players",
    time: "Today • 8:30 PM",
    accent: "#da2f3d",
  },
  {
    id: "marvel-rivals",
    game: "Marvel Rivals",
    slug: "marvel-rivals",
    mode: "Global Scrims",
    players: "16/20 Players",
    time: "Tomorrow • 6:00 PM",
    accent: "#f5c518",
  },
  {
    id: "valorant",
    game: "Valorant",
    slug: "valorant",
    mode: "Elite Cup",
    players: "8/10 Teams",
    time: "Tonight • 9:00 PM",
    accent: "#ff4655",
  },
  {
    id: "cs2",
    game: "CS2",
    slug: "cs2",
    mode: "Tactical Showdown",
    players: "12/16 Teams",
    time: "Today • 10:00 PM",
    accent: "#de9b35",
  },
  {
    id: "lol",
    game: "League of Legends",
    slug: "lol",
    mode: "Nexus Wars",
    players: "20/24 Players",
    time: "Tomorrow • 5:00 PM",
    accent: "#c89b3c",
  },
  {
    id: "dota-2",
    game: "Dota 2",
    slug: "dota-2",
    mode: "Ancient Clash",
    players: "10/10 Teams",
    time: "Tonight • 11:00 PM",
    accent: "#c23c2a",
  },
  {
    id: "fc-26",
    game: "FC 26",
    slug: "fc-26",
    mode: "Ultimate League",
    players: "24/32 Players",
    time: "Tomorrow • 8:00 PM",
    accent: "#00c853",
  },
  {
    id: "the-finals",
    game: "The Finals",
    slug: "the-finals",
    mode: "Cashout Chaos",
    players: "14/18 Teams",
    time: "Today • 9:30 PM",
    accent: "#00d4ff",
  },
];

export default function Tournaments() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const [activeCardId, setActiveCardId] = useState(null);

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Rajdhani:wght@500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #060608;
          color: white;
          font-family: 'Rajdhani', Arial, sans-serif;
        }

        .tournaments-page {
          min-height: 100vh;
          background: #060608;
          position: relative;
          overflow: hidden;
          padding: clamp(1.25rem, 3vw, 2.5rem) clamp(1.25rem, 4vw, 3.5rem);
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        }

        .glow-1, .glow-2 {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
        }
        .glow-1 {
          width: 500px; height: 500px;
          background: rgba(168,85,247,0.12);
          top: -120px; left: -100px;
        }
        .glow-2 {
          width: 450px; height: 450px;
          background: rgba(124,58,237,0.1);
          bottom: -120px; right: -100px;
        }

        .glow-cursor, .glow-cursor-trail {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .glow-cursor {
          width: 260px; height: 260px;
          left: var(--glow-x, 50%); top: var(--glow-y, 50%);
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(192,132,252,0.25), transparent 70%);
          filter: blur(50px);
          z-index: 1;
        }
        .glow-cursor-trail {
          width: 440px; height: 440px;
          left: var(--glow-trail-x, 50%); top: var(--glow-trail-y, 50%);
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(124,58,237,0.14), transparent 70%);
          filter: blur(80px);
          z-index: 0;
        }
        .tournaments-page.glow-active .glow-cursor,
        .tournaments-page.glow-active .glow-cursor-trail { opacity: 1; }

        .content {
          position: relative;
          z-index: 5;
          max-width: 1280px;
          margin: 0 auto;
        }

        .top-bar {
          margin-bottom: 2.5rem;
        }

        .nav-logo {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          color: #a855f7;
          text-decoration: none;
          text-shadow: 0 0 20px rgba(168,85,247,0.4);
          display: inline-block;
          transition:
            color 0.3s ease,
            text-shadow 0.3s ease,
            transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nav-logo:hover {
          color: #e9d5ff;
          text-shadow: 0 0 28px rgba(168,85,247,0.65);
          transform: scale(1.05);
        }

        .nav-logo:active {
          transform: scale(0.98);
          transition-duration: 0.1s;
        }

        .page-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2.2rem, 6vw, 3.5rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #a855f7;
          text-shadow:
            0 0 12px rgba(168,85,247,0.45),
            0 0 40px rgba(168,85,247,0.12);
          margin-bottom: 2.5rem;
          animation: fadeUp 0.6s ease both, titleGlow 4s ease-in-out infinite;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes titleGlow {
          0%, 100% {
            text-shadow:
              0 0 12px rgba(168,85,247,0.45),
              0 0 40px rgba(168,85,247,0.12);
          }
          50% {
            text-shadow:
              0 0 20px rgba(168,85,247,0.65),
              0 0 50px rgba(168,85,247,0.25);
          }
        }

        @property --card-border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        .tournament-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        .card {
          --accent: #a855f7;
          --card-border-angle: 0deg;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          padding: 1px;
          cursor: pointer;
          outline: none;
          animation: cardEnter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .card-border {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: conic-gradient(
            from var(--card-border-angle),
            transparent 0%,
            var(--accent) 15%,
            rgba(255,255,255,0.4) 22%,
            var(--accent) 28%,
            transparent 45%
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 2;
        }

        .card:hover .card-border,
        .card.is-active .card-border {
          opacity: 0.85;
          animation: spinCardBorder 3s linear infinite;
        }

        .card.is-active .card-border {
          opacity: 1;
          animation-duration: 2s;
        }

        @keyframes spinCardBorder {
          to { --card-border-angle: 360deg; }
        }

        .card-inner {
          position: relative;
          border-radius: 19px;
          padding: 1.5rem;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          height: 100%;
          transition:
            background 0.4s ease,
            border-color 0.4s ease,
            box-shadow 0.4s ease;
        }

        .card-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            145deg,
            color-mix(in srgb, var(--accent) 10%, transparent),
            transparent 55%
          );
          opacity: 0.6;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .card-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.06),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
          z-index: 3;
        }

        .card:hover .card-shine,
        .card.is-active .card-shine {
          left: 150%;
        }

        .card:hover {
          transform: translateY(-8px) scale(1.01);
        }

        .card:hover .card-inner,
        .card.is-active .card-inner {
          border-color: color-mix(in srgb, var(--accent) 45%, transparent);
          background: rgba(255,255,255,0.04);
          box-shadow:
            0 20px 48px rgba(0,0,0,0.4),
            0 0 32px color-mix(in srgb, var(--accent) 18%, transparent),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .card:hover .card-inner::before,
        .card.is-active .card-inner::before {
          opacity: 1;
        }

        .card:active {
          transform: translateY(-4px) scale(0.99);
          transition-duration: 0.12s;
        }

        .card.is-active {
          transform: translateY(-8px) scale(1.02);
        }

        .card:focus-visible {
          outline: 2px solid color-mix(in srgb, var(--accent) 60%, #a855f7);
          outline-offset: 3px;
        }

        .card-glow {
          position: absolute;
          width: 180px;
          height: 180px;
          background: color-mix(in srgb, var(--accent) 30%, transparent);
          border-radius: 50%;
          filter: blur(65px);
          top: -55px;
          right: -55px;
          opacity: 0;
          transition:
            opacity 0.45s ease,
            transform 0.45s ease;
          pointer-events: none;
          z-index: 0;
        }

        .card:hover .card-glow,
        .card.is-active .card-glow {
          opacity: 1;
          transform: scale(1.2);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.25rem;
          position: relative;
          z-index: 1;
        }

        .card-game-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .card-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
          color: var(--accent);
          transition:
            transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.4s ease,
            border-color 0.4s ease;
        }

        .card-icon svg {
          width: 22px;
          height: 22px;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .card:hover .card-icon,
        .card.is-active .card-icon {
          transform: scale(1.1) translateY(-2px);
          border-color: color-mix(in srgb, var(--accent) 50%, transparent);
          box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 25%, transparent);
        }

        .card:hover .card-icon svg,
        .card.is-active .card-icon svg {
          transform: scale(1.05);
        }

        .game-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          line-height: 1.2;
          transition:
            color 0.35s ease,
            text-shadow 0.35s ease,
            transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .card:hover .game-title,
        .card.is-active .game-title {
          color: #fff;
          text-shadow: 0 0 20px color-mix(in srgb, var(--accent) 45%, transparent);
          transform: translateX(2px);
        }

        .status {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #4ade80;
          transition:
            transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.35s ease,
            background 0.35s ease;
        }

        .status::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px #4ade80;
          animation: statusPulse 2s ease-in-out infinite;
        }

        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        .card:hover .status,
        .card.is-active .status {
          transform: scale(1.05);
          background: rgba(34,197,94,0.18);
          box-shadow: 0 0 16px rgba(34,197,94,0.2);
        }

        .card.is-active .status {
          border-color: rgba(34,197,94,0.45);
        }

        .mode {
          position: relative;
          z-index: 1;
          color: #c084fc;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          transition:
            color 0.35s ease,
            transform 0.35s ease;
        }

        .card:hover .mode,
        .card.is-active .mode {
          color: #e9d5ff;
          transform: translateX(4px);
        }

        .meta {
          position: relative;
          z-index: 1;
          color: #9ca3af;
          font-size: 0.92rem;
          font-weight: 600;
          margin-bottom: 0.45rem;
          transition:
            color 0.35s ease,
            transform 0.35s ease;
          opacity: 0.85;
        }

        .card:hover .meta,
        .card.is-active .meta {
          color: #d1d5db;
          transform: translateX(4px);
          opacity: 1;
        }

        .meta:last-child {
          margin-bottom: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .card,
          .card-border,
          .card-shine,
          .nav-logo,
          .page-title,
          .status::before {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }

          .card:hover,
          .card.is-active {
            transform: none;
          }
        }

        @media (max-width: 768px) {
          .page-title { font-size: 2rem; }
        }
      `}</style>

      <div className="tournaments-page" ref={containerRef}>
        <div className="grid-bg" />
        <div className="glow-cursor-trail" />
        <div className="glow-cursor" />
        <div className="glow-1" />
        <div className="glow-2" />

        <div className="content">
          <div className="top-bar">
            <Link to="/" className="nav-logo">
              DGL
            </Link>
          </div>

          <h1 className="page-title">Titan Grindhouse</h1>

          <div className="tournament-grid">
            {tournaments.map((tournament, index) => (
              <article
                className={`card${activeCardId === tournament.id ? " is-active" : ""}`}
                key={tournament.id}
                role="button"
                tabIndex={0}
                style={{
                  "--accent": tournament.accent,
                  animationDelay: `${0.06 * index}s`,
                }}
                onClick={() =>
                  setActiveCardId((id) =>
                    id === tournament.id ? null : tournament.id,
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveCardId((id) =>
                      id === tournament.id ? null : tournament.id,
                    );
                  }
                }}
              >
                <div className="card-border" aria-hidden />
                <div className="card-shine" aria-hidden />
                <div className="card-glow" aria-hidden />
                <div className="card-inner">
                  <div className="card-header">
                    <div className="card-game-row">
                      <div className="card-icon">
                        <GameIcon slug={tournament.slug} />
                      </div>
                      <h2 className="game-title">{tournament.game}</h2>
                    </div>
                    <span className="status">Open</span>
                  </div>

                  <p className="mode">{tournament.mode}</p>
                  <p className="meta">{tournament.players}</p>
                  <p className="meta">{tournament.time}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
