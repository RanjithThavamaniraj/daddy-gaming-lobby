import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function GameRealmIcon({ slug }) {
  const icons = {
    "arc-raiders": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M16 4L28 26H4L16 4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="18" r="3" fill="currentColor" />
      </svg>
    ),
    "apex-legends": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M16 6L26 26H6L16 6Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M10 22h12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "marvel-rivals": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="11" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
        <circle cx="21" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
        <path d="M8 26c2-4 14-4 16 0" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    valorant: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M8 26L16 6l8 20H8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M12 20h8" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "fc-26": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 16c0-4 2.5-7 6-7s6 3 6 7-2.5 7-6 7-6-3-6-7z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M16 10v12M12 13h8M12 19h8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    cs2: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect
          x="6"
          y="12"
          width="20"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M10 12V9a6 6 0 0112 0v3" stroke="currentColor" strokeWidth="2" />
        <circle cx="16" cy="18" r="2" fill="currentColor" />
      </svg>
    ),
    "dota-2": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M6 16c0-6 4.5-10 10-10s10 4 10 10-4.5 10-10 10"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M12 12l8 8M20 12l-8 8" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    lol: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M10 8h12v16H10V8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M14 12h6M14 16h4M14 20h6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    "the-finals": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M8 22V10l8-4 8 4v12" stroke="currentColor" strokeWidth="2" />
        <path d="M12 22v-6h8v6" stroke="currentColor" strokeWidth="2" />
        <circle cx="16" cy="14" r="2" fill="currentColor" />
      </svg>
    ),
  };

  return icons[slug] ?? icons.valorant;
}

const gameRealms = [
  {
    id: "arc-raiders",
    name: "Arc Raiders",
    category: "Extraction",
    accent: "#ff6b4a",
    glow: "rgba(255, 107, 74, 0.45)",
    players: "1.2k",
  },
  {
    id: "apex-legends",
    name: "Apex Legends",
    category: "Battle Royale",
    accent: "#da2f3d",
    glow: "rgba(218, 47, 61, 0.45)",
    players: "3.8k",
  },
  {
    id: "marvel-rivals",
    name: "Marvel Rivals",
    category: "Hero Shooter",
    accent: "#f5c518",
    glow: "rgba(245, 197, 24, 0.4)",
    players: "2.1k",
  },
  {
    id: "valorant",
    name: "Valorant",
    category: "Tactical FPS",
    accent: "#ff4655",
    glow: "rgba(255, 70, 85, 0.45)",
    players: "5.4k",
  },
  {
    id: "fc-26",
    name: "FC 26",
    category: "Sports",
    accent: "#00c853",
    glow: "rgba(0, 200, 83, 0.4)",
    players: "980",
  },
  {
    id: "cs2",
    name: "CS2",
    category: "Tactical FPS",
    accent: "#de9b35",
    glow: "rgba(222, 155, 53, 0.45)",
    players: "4.2k",
  },
  {
    id: "dota-2",
    name: "Dota 2",
    category: "MOBA",
    accent: "#c23c2a",
    glow: "rgba(194, 60, 42, 0.45)",
    players: "1.9k",
  },
  {
    id: "lol",
    name: "League of Legends",
    category: "MOBA",
    accent: "#c89b3c",
    glow: "rgba(200, 155, 60, 0.45)",
    players: "6.1k",
  },
  {
    id: "the-finals",
    name: "The Finals",
    category: "Arena FPS",
    accent: "#00d4ff",
    glow: "rgba(0, 212, 255, 0.4)",
    players: "1.5k",
  },
];

const liveActivity = [
  {
    activity: "ShadowX won Valorant Elite Cup",
    time: "2 mins ago",
    type: "win",
  },
  {
    activity: "TitanWolf joined CS2 Tactical Showdown",
    time: "5 mins ago",
    type: "join",
  },
  {
    activity: "Inferno reached Rank #3",
    time: "8 mins ago",
    type: "rank",
  },
  {
    activity: "GhostMode entered Arc Raiders Scrims",
    time: "12 mins ago",
    type: "join",
  },
  {
    activity: "NightFury joined FC 26 Ultimate League",
    time: "16 mins ago",
    type: "join",
  },
];

const stats = [
  { value: "12+", label: "Tournaments Hosted", icon: "◈" },
  { value: "120+", label: "Registered Players", icon: "◎" },
  { value: "9", label: "Active Games", icon: "⬡" },
  { value: "99%", label: "Server Uptime", icon: "▣" },
];

export default function Dashboard() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const parallaxRef = useRef({ x: 0, y: 0 });
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Rajdhani:wght@500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #060608;
          color: white;
          font-family: 'Rajdhani', Arial, sans-serif;
        }

        .dashboard-container {
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
          opacity: 0.35;
          z-index: 0;
          pointer-events: none;
        }

        .scanline {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
          z-index: 1;
          opacity: 0.4;
        }

        .dashboard-glow-1 {
          position: absolute;
          width: 520px;
          height: 520px;
          background: rgba(168,85,247,0.14);
          filter: blur(140px);
          border-radius: 50%;
          top: -140px;
          left: -100px;
          pointer-events: none;
          transform: translate(var(--parallax-x, 0px), var(--parallax-y, 0px));
          animation: ambientPulse 9s ease-in-out infinite;
        }

        .dashboard-glow-2 {
          position: absolute;
          width: 480px;
          height: 480px;
          background: rgba(59,130,246,0.1);
          filter: blur(140px);
          border-radius: 50%;
          bottom: -140px;
          right: -100px;
          pointer-events: none;
          transform: translate(
            calc(var(--parallax-x, 0px) * -0.7),
            calc(var(--parallax-y, 0px) * -0.7)
          );
          animation: ambientPulse 11s ease-in-out infinite reverse;
        }

        .glow-cursor {
          position: absolute;
          width: 280px;
          height: 280px;
          left: var(--glow-x, 50%);
          top: var(--glow-y, 50%);
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle,
            rgba(192,132,252,0.28) 0%,
            transparent 70%
          );
          filter: blur(55px);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .glow-cursor-trail {
          position: absolute;
          width: 480px;
          height: 480px;
          left: var(--glow-trail-x, 50%);
          top: var(--glow-trail-y, 50%);
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle,
            rgba(124,58,237,0.16) 0%,
            transparent 70%
          );
          filter: blur(85px);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .dashboard-container.glow-active .glow-cursor,
        .dashboard-container.glow-active .glow-cursor-trail {
          opacity: 1;
        }

        @keyframes ambientPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .dashboard-content {
          position: relative;
          z-index: 5;
          max-width: 1440px;
          margin: 0 auto;
        }

        /* ── Top bar ── */
        .control-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .control-logo {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #a855f7;
          text-decoration: none;
          text-shadow: 0 0 20px rgba(168,85,247,0.4);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.25);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #4ade80;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px #4ade80;
          animation: statusBlink 2s ease-in-out infinite;
        }

        @keyframes statusBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .online-box {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(168,85,247,0.2);
          padding: 1.25rem 2rem;
          border-radius: 20px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          overflow: hidden;
          min-width: 160px;
        }

        .online-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(168,85,247,0.08) 0%,
            transparent 60%
          );
          pointer-events: none;
        }

        .online-box::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(168,85,247,0.6),
            transparent
          );
        }

        .online-label {
          color: #6b7280;
          font-size: 0.7rem;
          margin-bottom: 0.35rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-weight: 700;
        }

        .online-count {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.4rem;
          font-weight: 900;
          color: #c084fc;
          line-height: 1;
          text-shadow: 0 0 24px rgba(168,85,247,0.5);
        }

        /* ── Stats ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          position: relative;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 1.75rem 1.5rem;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          overflow: hidden;
          transition:
            transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            border-color 0.35s ease,
            box-shadow 0.35s ease;
          animation: cardEnter 0.6s ease both;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.18s; }
        .stat-card:nth-child(3) { animation-delay: 0.26s; }
        .stat-card:nth-child(4) { animation-delay: 0.34s; }

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

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #a855f7, transparent);
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(168,85,247,0.35);
          box-shadow:
            0 8px 32px rgba(0,0,0,0.4),
            0 0 0 1px rgba(168,85,247,0.1),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-icon {
          font-size: 1.1rem;
          color: rgba(168,85,247,0.5);
          margin-bottom: 1rem;
        }

        .stat-number {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.2rem;
          font-weight: 900;
          color: #e9d5ff;
          margin-bottom: 0.4rem;
          line-height: 1;
          text-shadow: 0 0 20px rgba(168,85,247,0.3);
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── Main grid ── */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.5rem;
          align-items: start;
        }

        .glass-panel {
          position: relative;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          overflow: hidden;
          animation: cardEnter 0.7s ease both;
          animation-delay: 0.4s;
        }

        .glass-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(168,85,247,0.05) 0%,
            transparent 50%
          );
          pointer-events: none;
        }

        .glass-panel::after {
          content: '';
          position: absolute;
          top: 0;
          left: 1.5rem;
          right: 1.5rem;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(168,85,247,0.4),
            transparent
          );
        }

        .activity-panel {
          animation-delay: 0.5s;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
        }

        .section-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #e9d5ff;
        }

        .section-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.3rem 0.75rem;
          border-radius: 6px;
          background: rgba(168,85,247,0.12);
          border: 1px solid rgba(168,85,247,0.25);
          color: #c084fc;
        }

        @property --border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.25rem;
          position: relative;
          z-index: 1;
        }

        .game-card {
          --realm-accent: #a855f7;
          --realm-glow: rgba(168, 85, 247, 0.4);
          position: relative;
          border-radius: 20px;
          padding: 1px;
          animation: gameCardEnter 0.55s ease both;
          cursor: default;
        }

        .game-card:nth-child(1) { animation-delay: 0.45s; }
        .game-card:nth-child(2) { animation-delay: 0.5s; }
        .game-card:nth-child(3) { animation-delay: 0.55s; }
        .game-card:nth-child(4) { animation-delay: 0.6s; }
        .game-card:nth-child(5) { animation-delay: 0.65s; }
        .game-card:nth-child(6) { animation-delay: 0.7s; }
        .game-card:nth-child(7) { animation-delay: 0.75s; }
        .game-card:nth-child(8) { animation-delay: 0.8s; }
        .game-card:nth-child(9) { animation-delay: 0.85s; }

        @keyframes gameCardEnter {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .game-card-border {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: conic-gradient(
            from var(--border-angle),
            transparent 0%,
            var(--realm-accent) 12%,
            rgba(255,255,255,0.5) 18%,
            var(--realm-accent) 24%,
            transparent 40%,
            transparent 100%
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.35;
          animation: spinBorder 4s linear infinite;
          pointer-events: none;
          z-index: 0;
          transition: opacity 0.35s ease;
        }

        .game-card:hover .game-card-border {
          opacity: 1;
          animation-duration: 2.5s;
        }

        @keyframes spinBorder {
          to { --border-angle: 360deg; }
        }

        .game-card-glow {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .game-card-glow::before {
          content: '';
          position: absolute;
          width: 140px;
          height: 140px;
          top: -40px;
          right: -30px;
          background: var(--realm-glow);
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.25;
          transition:
            opacity 0.4s ease,
            transform 0.4s ease,
            width 0.4s ease,
            height 0.4s ease;
        }

        .game-card-glow::after {
          content: '';
          position: absolute;
          width: 100px;
          height: 100px;
          bottom: -30px;
          left: -20px;
          background: var(--realm-glow);
          border-radius: 50%;
          filter: blur(45px);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .game-card:hover .game-card-glow::before {
          opacity: 0.85;
          transform: scale(1.4);
          width: 180px;
          height: 180px;
        }

        .game-card:hover .game-card-glow::after {
          opacity: 0.5;
        }

        .game-card-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 0;
          min-height: 200px;
          padding: 1.25rem 1.25rem 1.1rem;
          border-radius: 19px;
          background: rgba(8, 8, 12, 0.75);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          overflow: hidden;
          transition:
            transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            border-color 0.35s ease,
            box-shadow 0.35s ease;
        }

        .game-card-inner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            165deg,
            color-mix(in srgb, var(--realm-accent) 12%, transparent) 0%,
            transparent 45%
          );
          pointer-events: none;
        }

        .game-card:hover .game-card-inner {
          transform: translateY(-6px);
          border-color: color-mix(in srgb, var(--realm-accent) 35%, transparent);
          box-shadow:
            0 20px 48px rgba(0,0,0,0.45),
            0 0 32px color-mix(in srgb, var(--realm-glow) 60%, transparent),
            inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .game-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }

        .game-index {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: color-mix(in srgb, var(--realm-accent) 70%, #6b7280);
        }

        .game-category {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #4b5563;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .game-icon-wrap {
          position: relative;
          z-index: 1;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          border-radius: 14px;
          background: linear-gradient(
            145deg,
            color-mix(in srgb, var(--realm-accent) 18%, rgba(255,255,255,0.04)),
            rgba(255,255,255,0.02)
          );
          border: 1px solid color-mix(in srgb, var(--realm-accent) 30%, transparent);
          color: var(--realm-accent);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 8px 24px color-mix(in srgb, var(--realm-glow) 35%, transparent);
          transition:
            transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.35s ease;
        }

        .game-icon-wrap svg {
          width: 28px;
          height: 28px;
        }

        .game-card:hover .game-icon-wrap {
          transform: scale(1.08) translateY(-2px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.06) inset,
            0 12px 32px color-mix(in srgb, var(--realm-glow) 55%, transparent),
            0 0 20px color-mix(in srgb, var(--realm-accent) 40%, transparent);
        }

        .game-card-body {
          flex: 1;
          position: relative;
          z-index: 1;
          margin-bottom: 1rem;
        }

        .game-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          line-height: 1.3;
          letter-spacing: 0.03em;
          color: #f9fafb;
          margin-bottom: 0.35rem;
          transition: color 0.3s ease;
        }

        .game-card:hover .game-name {
          color: #fff;
          text-shadow: 0 0 20px color-mix(in srgb, var(--realm-accent) 50%, transparent);
        }

        .game-players {
          font-size: 0.78rem;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.04em;
        }

        .game-players strong {
          color: color-mix(in srgb, var(--realm-accent) 80%, #9ca3af);
          font-weight: 700;
        }

        .game-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
          padding-top: 0.85rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .game-signal {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 12px;
        }

        .game-signal span {
          display: block;
          width: 3px;
          border-radius: 1px;
          background: var(--realm-accent);
          animation: signalBar 1.2s ease-in-out infinite;
        }

        .game-signal span:nth-child(1) { height: 3px; animation-delay: 0s; }
        .game-signal span:nth-child(2) { height: 6px; animation-delay: 0.15s; }
        .game-signal span:nth-child(3) { height: 9px; animation-delay: 0.3s; }
        .game-signal span:nth-child(4) { height: 12px; animation-delay: 0.45s; }

        @keyframes signalBar {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }

        .game-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--realm-accent) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--realm-accent) 28%, transparent);
          color: var(--realm-accent);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .game-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--realm-accent);
          box-shadow: 0 0 8px var(--realm-accent);
          animation: statusBlink 1.5s ease-in-out infinite;
        }

        /* ── Activity feed ── */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          z-index: 1;
        }

        .activity-card {
          position: relative;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 1rem 1.1rem 1rem 2.5rem;
          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            background 0.3s ease;
          animation: cardEnter 0.5s ease both;
        }

        .activity-card:nth-child(1) { animation-delay: 0.55s; }
        .activity-card:nth-child(2) { animation-delay: 0.62s; }
        .activity-card:nth-child(3) { animation-delay: 0.69s; }
        .activity-card:nth-child(4) { animation-delay: 0.76s; }
        .activity-card:nth-child(5) { animation-delay: 0.83s; }

        .activity-card::before {
          content: '';
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #a855f7;
          box-shadow: 0 0 8px rgba(168,85,247,0.6);
        }

        .activity-card.type-win::before {
          background: #fbbf24;
          box-shadow: 0 0 8px rgba(251,191,36,0.6);
        }

        .activity-card.type-rank::before {
          background: #60a5fa;
          box-shadow: 0 0 8px rgba(96,165,250,0.6);
        }

        .activity-card:hover {
          border-color: rgba(168,85,247,0.25);
          background: rgba(168,85,247,0.05);
          transform: translateX(4px);
        }

        .activity-text {
          font-weight: 700;
          font-size: 0.95rem;
          line-height: 1.45;
          margin-bottom: 0.3rem;
          color: #e5e7eb;
        }

        .activity-time {
          color: #4b5563;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .activity-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.06),
            transparent
          );
          margin: 0.25rem 0;
        }

        @media (max-width: 1100px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .activity-panel {
            animation-delay: 0.55s;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1.25rem;
          }

          .glass-panel {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className="dashboard-container" ref={containerRef}>

        <div className="grid-bg" />
        <div className="scanline" />
        <div className="glow-cursor-trail" />
        <div className="glow-cursor" />
        <div className="dashboard-glow-1" />
        <div className="dashboard-glow-2" />

        <div className="dashboard-content">

          <div className="control-topbar">
            <Link to="/" className="control-logo">
              DGL
            </Link>
            <div className="topbar-right">
              <div className="online-box">
                <div className="online-label">Players Online</div>
                <div className="online-count">18</div>
              </div>
              <div className="status-pill">
                <span className="status-dot" />
                System Online
              </div>
            </div>
          </div>

          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="dashboard-grid">

            <section className="glass-panel">
              <div className="panel-header">
                <h2 className="section-title">Active Realms</h2>
                <span className="section-badge">{gameRealms.length} Live</span>
              </div>

              <div className="games-grid">
                {gameRealms.map((realm, index) => (
                  <article
                    className="game-card"
                    key={realm.id}
                    style={{
                      "--realm-accent": realm.accent,
                      "--realm-glow": realm.glow,
                    }}
                  >
                    <div className="game-card-border" aria-hidden="true" />
                    <div className="game-card-glow" aria-hidden="true" />
                    <div className="game-card-inner">
                      <div className="game-card-header">
                        <span className="game-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="game-category">{realm.category}</span>
                      </div>

                      <div className="game-icon-wrap">
                        <GameRealmIcon slug={realm.id} />
                      </div>

                      <div className="game-card-body">
                        <h3 className="game-name">{realm.name}</h3>
                        <p className="game-players">
                          <strong>{realm.players}</strong> online
                        </p>
                      </div>

                      <div className="game-card-footer">
                        <div className="game-signal" aria-hidden="true">
                          <span /><span /><span /><span />
                        </div>
                        <div className="game-status">
                          <span className="game-status-dot" />
                          Live
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="glass-panel activity-panel">
              <div className="panel-header">
                <h2 className="section-title">Live Feed</h2>
                <span className="section-badge">Real-time</span>
              </div>

              <div className="activity-list">
                {liveActivity.map((item, index) => (
                  <div key={index}>
                    <div className={`activity-card type-${item.type}`}>
                      <div className="activity-text">{item.activity}</div>
                      <div className="activity-time">{item.time}</div>
                    </div>
                    {index < liveActivity.length - 1 && (
                      <div className="activity-divider" />
                    )}
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
