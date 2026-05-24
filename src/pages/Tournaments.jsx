import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TopNav from "../components/TopNav";

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

  const featured = tournaments[0];
  const schedule = tournaments.slice(1);

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

        /* Redesign Layout */
        .layout-grid {
          display: flex;
          flex-direction: column;
          gap: 4rem;
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

        /* Hero Card Cyberpunk */
        .hero-card {
          position: relative;
          padding: 2px;
          background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 60%, transparent), rgba(255,255,255,0.05));
          clip-path: polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px);
          transition: transform 0.3s ease, filter 0.3s ease;
          animation: fadeUp 0.6s ease both 0.2s;
        }

        .hero-card:hover {
          transform: translateY(-4px);
          filter: drop-shadow(0 10px 30px color-mix(in srgb, var(--accent) 30%, transparent));
        }

        .hero-inner {
          position: relative;
          background: linear-gradient(135deg, rgba(10,10,15,0.95), rgba(20,10,30,0.95));
          clip-path: polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px);
          padding: 3.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          overflow: hidden;
        }

        .hero-scanlines {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.15) 50%);
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 1;
          opacity: 0.8;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          background: color-mix(in srgb, var(--accent) 15%, transparent);
          border: 1px solid var(--accent);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-5deg);
          box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 30%, transparent);
          border-radius: 8px;
        }

        .hero-icon svg {
          width: 44px;
          height: 44px;
          transform: rotate(5deg);
        }

        .hero-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .hero-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #fff;
          text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 50%, transparent);
          margin: 0;
          line-height: 1;
        }

        .hero-badges {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .badge-live {
          background: rgba(220,38,38,0.15);
          border: 1px solid #dc2626;
          color: #f87171;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .badge-live::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
          animation: pulseRed 1.5s infinite;
        }

        @keyframes pulseRed {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .badge-mode {
          color: #c084fc;
          font-weight: 700;
          font-size: 1rem;
        }

        .hero-meta {
          color: #9ca3af;
          font-size: 1.1rem;
          font-weight: 600;
        }

        /* Cyber Button */
        .cyber-btn {
          position: relative;
          z-index: 2;
          background: transparent;
          border: none;
          color: #fff;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          padding: 1rem 3rem;
          cursor: pointer;
          clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);
          transition: transform 0.2s ease;
        }

        .cyber-btn.primary {
          background: var(--accent);
          text-shadow: 0 0 8px rgba(0,0,0,0.5);
          box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 40%, transparent);
        }

        .cyber-btn.primary:hover {
          transform: scale(1.05);
          background: color-mix(in srgb, var(--accent) 80%, white);
        }

        .cyber-btn.outline {
          border: 1px solid var(--accent);
          background: color-mix(in srgb, var(--accent) 10%, transparent);
          font-size: 0.9rem;
          padding: 0.75rem 2rem;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }

        .cyber-btn.outline:hover {
          background: var(--accent);
          transform: scale(1.05);
        }

        /* Match Schedule List */
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .schedule-row {
          position: relative;
          padding: 1px;
          border-radius: 4px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05), transparent);
          overflow: hidden;
          animation: fadeUp 0.6s ease both;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .schedule-row:hover {
          transform: translateX(8px);
          background: linear-gradient(90deg, var(--accent), transparent);
        }

        .row-inner {
          background: rgba(10,10,14,0.9);
          padding: 1.25rem 2rem;
          border-radius: 4px;
          display: grid;
          grid-template-columns: auto 1.5fr 1fr 1fr auto;
          align-items: center;
          gap: 2rem;
          position: relative;
          z-index: 2;
        }

        .row-icon {
          width: 40px;
          height: 40px;
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .row-icon svg {
          width: 24px;
          height: 24px;
        }

        .row-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .row-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #e5e7eb;
          margin: 0;
          transition: color 0.2s ease;
        }

        .row-mode {
          color: #a855f7;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .schedule-row:hover .row-title {
          color: #fff;
          animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }

        @keyframes glitch {
          0% { transform: translate(0); text-shadow: none; }
          20% { transform: translate(-2px, 1px); text-shadow: 2px 0 var(--accent), -2px 0 #00d4ff; }
          40% { transform: translate(-1px, -1px); text-shadow: -2px 0 var(--accent), 2px 0 #00d4ff; }
          60% { transform: translate(2px, 1px); text-shadow: 2px 0 var(--accent), -1px 0 #00d4ff; }
          80% { transform: translate(1px, -1px); text-shadow: -1px 0 var(--accent), 2px 0 #00d4ff; }
          100% { transform: translate(0); text-shadow: 0 0 8px var(--accent); }
        }

        .row-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .row-time {
          color: #e5e7eb;
          font-weight: 700;
          font-size: 1rem;
        }

        .row-players {
          color: #9ca3af;
          font-size: 0.85rem;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .row-inner {
            grid-template-columns: auto 1fr 1fr auto;
            gap: 1.5rem;
          }
          .row-meta {
            align-items: flex-end;
          }
        }

        @media (max-width: 768px) {
          .page-title { font-size: 2rem; }
          .hero-inner {
            flex-direction: column;
            align-items: flex-start;
            padding: 2rem;
            clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
          }
          .hero-card {
            clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
          }
          .hero-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .cyber-btn.primary {
            width: 100%;
          }
          .row-inner {
            grid-template-columns: 1fr;
            padding: 1.5rem;
            gap: 1rem;
          }
          .row-icon { display: none; }
          .row-meta { align-items: flex-start; }
          .cyber-btn.outline { width: 100%; text-align: center; }
        }
      `}</style>

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
            <section className="featured-section">
              <h2 className="section-heading">Main Event</h2>
              <div className="hero-card" style={{ "--accent": featured.accent }}>
                <div className="hero-scanlines"></div>
                <div className="hero-inner">
                  <div className="hero-content">
                    <div className="hero-icon"><GameIcon slug={featured.slug} /></div>
                    <div className="hero-details">
                      <h3 className="hero-title">{featured.game}</h3>
                      <div className="hero-badges">
                        <span className="badge-live">LIVE NOW</span>
                        <span className="badge-mode">{featured.mode}</span>
                      </div>
                      <p className="hero-meta">{featured.players} • {featured.time}</p>
                    </div>
                  </div>
                  <button className="cyber-btn primary">
                    <span>REGISTER NOW</span>
                  </button>
                </div>
              </div>
            </section>

            <section className="schedule-section">
              <h2 className="section-heading">Match Schedule</h2>
              <div className="schedule-list">
                {schedule.map((t, index) => (
                  <div 
                    className="schedule-row" 
                    key={t.id} 
                    style={{ "--accent": t.accent, animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="row-inner">
                      <div className="row-icon"><GameIcon slug={t.slug} /></div>
                      <div className="row-info">
                        <h4 className="row-title">{t.game}</h4>
                        <span className="row-mode">{t.mode}</span>
                      </div>
                      <div className="row-meta">
                        <span className="row-time">{t.time}</span>
                        <span className="row-players">{t.players}</span>
                      </div>
                      <button className="cyber-btn outline">JOIN</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
