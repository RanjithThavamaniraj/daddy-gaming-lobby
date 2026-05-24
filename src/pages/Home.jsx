import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const featuredGames = ["Valorant", "CS2", "Marvel Rivals", "Arc Raiders", "The Finals"];

const topPlayers = [
  { name: "ShadowX", rank: "#1" },
  { name: "Inferno", rank: "#2" },
  { name: "VenomYT", rank: "#3" },
];

export default function Home() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const parallaxRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const canvasRef = useRef(null);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setTitleVisible(true), 100);
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }));
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.pulse += 0.01;
        const a = p.alpha + Math.sin(p.pulse) * 0.08;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,85,247,${a})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  // Mouse glow
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
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      parallaxRef.current = { x: nx * 48, y: ny * 48 };
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        container.classList.add("glow-active");
      }
    };
    let rafId;
    const animate = () => {
      const lerp = (c, t, f) => c + (t - c) * f;
      glowRef.current.x = lerp(glowRef.current.x, mouseRef.current.x, 0.12);
      glowRef.current.y = lerp(glowRef.current.y, mouseRef.current.y, 0.12);
      trailRef.current.x = lerp(trailRef.current.x, mouseRef.current.x, 0.05);
      trailRef.current.y = lerp(trailRef.current.y, mouseRef.current.y, 0.05);
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
    window.addEventListener("resize", centerGlow);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("resize", centerGlow); };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Rajdhani:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --purple: #a855f7;
          --purple-dim: #7c3aed;
          --purple-glow: rgba(168,85,247,0.25);
          --bg: #060608;
          --bg2: #0d0d12;
          --white: #f0f0f5;
          --muted: #6b7280;
          --border: rgba(168,85,247,0.12);
          --ease-spring: cubic-bezier(0.34,1.56,0.64,1);
          --ease-smooth: cubic-bezier(0.22,1,0.36,1);
          --space-section: clamp(4rem,8vw,6rem);
          --space-inline: clamp(1.25rem,5vw,4rem);
        }

        body { background: var(--bg); color: var(--white); font-family: 'Rajdhani', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--purple-dim); border-radius: 2px; }

        /* ── KEYFRAMES ── */
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes scanline { 0% { transform:translateY(-100%); } 100% { transform:translateY(100vh); } }
        @keyframes ambientGlow { 0%,100% { opacity:.85; filter:blur(140px); } 50% { opacity:1; filter:blur(155px); } }
        @keyframes cursorPulse { 0%,100% { transform:translate(-50%,-50%) scale(1); } 50% { transform:translate(-50%,-50%) scale(1.12); } }
        @keyframes titleReveal { 0% { clip-path:inset(0 100% 0 0); opacity:0; } 100% { clip-path:inset(0 0% 0 0); opacity:1; } }
        @keyframes glitchShift { 0%,90%,100% { transform:translate(0); opacity:0; } 92% { transform:translate(-3px,1px); opacity:.6; } 95% { transform:translate(3px,-1px); opacity:.6; } }
        @keyframes borderRun { 0% { background-position:0% 50%; } 100% { background-position:200% 50%; } }
        @keyframes cardFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
        @keyframes shockwaveWhite { 0%,100% { text-shadow:0 0 5px rgba(255,255,255,.18),0 0 10px rgba(168,85,247,.08); } 50% { text-shadow:0 0 12px rgba(255,255,255,.45),0 0 30px rgba(168,85,247,.18),0 0 60px rgba(168,85,247,.08); } }
        @keyframes shockwavePurple { 0%,100% { text-shadow:0 0 6px rgba(168,85,247,.25),0 0 12px rgba(168,85,247,.08); } 50% { text-shadow:0 0 18px rgba(168,85,247,.7),0 0 40px rgba(168,85,247,.28),0 0 70px rgba(168,85,247,.1); } }
        @keyframes statCount { from { opacity:0; transform:translateY(12px) scale(.9); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes ringPulse { 0%,100% { transform:scale(1); opacity:.5; } 50% { transform:scale(1.2); opacity:.1; } }
        @keyframes scanBar { 0% { top:-2px; } 100% { top:100%; } }

        /* ── CONTAINER ── */
        .home-container {
          min-height: 100vh;
          background: var(--bg);
          position: relative;
          overflow-x: hidden;
        }

        /* SCANLINE OVERLAY */
        .scanline-overlay {
          position: fixed; inset: 0; z-index: 999; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
        }

        /* GRID */
        .grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(168,85,247,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.035) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: .28; z-index: 0; pointer-events: none;
        }

        /* CANVAS */
        canvas.bg-particles {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .6;
        }

        /* GLOWS */
        .glow-one {
          position: absolute; width: 500px; height: 500px;
          background: rgba(168,85,247,0.16); filter: blur(140px); border-radius: 50%;
          top: -180px; left: -120px; pointer-events: none;
          transform: translate(var(--parallax-x,0px),var(--parallax-y,0px));
          animation: ambientGlow 8s ease-in-out infinite;
        }
        .glow-two {
          position: absolute; width: 450px; height: 450px;
          background: rgba(124,58,237,0.14); filter: blur(140px); border-radius: 50%;
          bottom: -180px; right: -120px; pointer-events: none;
          transform: translate(calc(var(--parallax-x,0px)*-.6),calc(var(--parallax-y,0px)*-.6));
          animation: ambientGlow 10s ease-in-out infinite reverse;
        }
        .glow-cursor {
          position: absolute; width: 320px; height: 320px;
          left: var(--glow-x,50%); top: var(--glow-y,50%);
          transform: translate(-50%,-50%);
          background: radial-gradient(circle, rgba(192,132,252,.35) 0%, rgba(168,85,247,.12) 40%, transparent 70%);
          filter: blur(50px); border-radius: 50%; pointer-events: none; z-index: 1;
          opacity: 0; transition: opacity .6s ease;
          animation: cursorPulse 4s ease-in-out infinite;
        }
        .glow-cursor-trail {
          position: absolute; width: 520px; height: 520px;
          left: var(--glow-trail-x,50%); top: var(--glow-trail-y,50%);
          transform: translate(-50%,-50%);
          background: radial-gradient(circle, rgba(124,58,237,.2) 0%, rgba(88,28,135,.08) 45%, transparent 70%);
          filter: blur(90px); border-radius: 50%; pointer-events: none; z-index: 0;
          opacity: 0; transition: opacity .6s ease;
        }
        .home-container.glow-active .glow-cursor,
        .home-container.glow-active .glow-cursor-trail { opacity: 1; }

        /* ── SHELL ── */
        .page-shell {
          position: relative; z-index: 5;
          max-width: 1320px; margin: 0 auto;
          padding-inline: var(--space-inline);
        }

        /* ── NAV ── */
        .navbar {
          display: flex; align-items: center; justify-content: space-between;
          padding-block: clamp(1.5rem,3vw,2.25rem);
          border-bottom: 1px solid rgba(168,85,247,0.08);
          animation: fadeIn .6s ease both;
        }
        .nav-left { display: flex; align-items: center; gap: clamp(2rem,5vw,4rem); }
        .logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: transform .35s var(--ease-spring);
        }
        .logo-link:hover { transform: scale(1.02); }
        .logo-icon {
          height: clamp(32px, 5vw, 44px);
          width: auto;
          mix-blend-mode: screen;
          filter: drop-shadow(0 0 12px rgba(168,85,247,0.25));
          transition: filter .35s ease, transform .35s var(--ease-spring);
          object-fit: contain;
        }
        .logo-text {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1rem,2vw,1.25rem); font-weight: 900;
          text-transform: uppercase; letter-spacing: .14em; white-space: nowrap;
          color: #f9fafb; line-height: 1.2;
          text-shadow: 0 0 24px rgba(168,85,247,.15);
          transition: text-shadow .35s ease;
        }
        .logo-text span { color: var(--purple); text-shadow: 0 0 16px rgba(168,85,247,.4); }
        .logo-link:hover .logo-icon { filter: drop-shadow(0 0 20px rgba(168,85,247,0.45)); }
        .logo-link:hover .logo-text { text-shadow: 0 0 32px rgba(168,85,247,.5); }

        .nav-links { display: flex; align-items: center; gap: clamp(1.5rem,3vw,2.75rem); }
        .nav-links a {
          position: relative; text-decoration: none; color: #9ca3af;
          font-size: .92rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          padding: .35rem 0; transition: color .3s ease;
        }
        .nav-links a::after {
          content: ''; position: absolute; left: 0; bottom: 0;
          width: 100%; height: 2px;
          background: linear-gradient(90deg, var(--purple), var(--purple-dim));
          transform: scaleX(0); transform-origin: right;
          transition: transform .35s var(--ease-smooth); border-radius: 1px;
        }
        .nav-links a:hover { color: #e9d5ff; }
        .nav-links a:hover::after { transform: scaleX(1); transform-origin: left; }

        /* ── HERO ── */
        .hero-section {
          display: flex; flex-direction: column;
          justify-content: center; align-items: center; text-align: center;
          min-height: min(88vh,920px);
          padding-block: clamp(2rem,6vw,4rem);
          position: relative;
        }

        /* horizontal scan bar */
        .hero-section::after {
          content: '';
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.4), transparent);
          animation: scanBar 4s ease-in-out infinite;
          pointer-events: none;
        }

        .hero-eyebrow {
          font-size: .72rem; font-weight: 700; letter-spacing: .28em;
          text-transform: uppercase; color: #6b7280;
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 1rem;
          animation: fadeUp .7s var(--ease-smooth) both;
        }
        .hero-eyebrow::before, .hero-eyebrow::after {
          content: ''; width: clamp(24px,6vw,48px); height: 1px;
          background: linear-gradient(90deg,transparent,rgba(168,85,247,.5));
        }
        .hero-eyebrow::after { background: linear-gradient(90deg,rgba(168,85,247,.5),transparent); }

        /* TITLE */
        .hero-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2.75rem,10vw,6.5rem); font-weight: 900;
          line-height: .92; text-transform: uppercase; letter-spacing: .02em;
          margin-bottom: clamp(1.25rem,3vw,2rem);
        }

        .hero-white {
          color: white; display: block; position: relative;
          animation: shockwaveWhite 2s infinite ease-in-out, fadeUp .75s var(--ease-smooth) .08s both;
        }
        .hero-white::before {
          content: 'DOMINATE';
          position: absolute; top: 0; left: 0; right: 0;
          color: #c084fc; opacity: 0;
          animation: glitchShift 4s infinite;
        }

        .hero-purple {
          color: var(--purple); display: block;
          animation: shockwavePurple 2s infinite ease-in-out, fadeUp .75s var(--ease-smooth) .16s both;
        }

        .hero-text {
          max-width: 42rem; color: #9ca3af;
          font-size: clamp(1rem,2.2vw,1.15rem); line-height: 1.75; font-weight: 500;
          margin-bottom: clamp(2rem,4vw,3rem);
          animation: fadeUp .75s var(--ease-smooth) .24s both;
        }

        .hero-buttons {
          display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
          animation: fadeUp .75s var(--ease-smooth) .32s both;
        }

        /* BUTTONS */
        .primary-btn, .secondary-btn {
          position: relative; overflow: hidden; text-decoration: none;
          padding: .95rem 2rem; border-radius: 12px;
          font-size: .88rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
          transition: transform .35s var(--ease-spring), box-shadow .35s ease, border-color .35s ease, color .35s ease, background .35s ease;
        }
        .primary-btn {
          background: linear-gradient(135deg, var(--purple), var(--purple-dim));
          color: #fff; border: 1px solid rgba(168,85,247,.4);
        }
        .primary-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.18) 50%, transparent 60%);
          transform: translateX(-100%); transition: transform .55s ease;
        }
        .primary-btn:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(168,85,247,.4); }
        .primary-btn:hover::before { transform: translateX(100%); }
        .primary-btn:active { transform: translateY(-1px) scale(.98); }

        .secondary-btn {
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.1);
          color: #e5e7eb; backdrop-filter: blur(12px);
        }
        .secondary-btn:hover {
          border-color: rgba(168,85,247,.45); color: #e9d5ff;
          background: rgba(168,85,247,.08); transform: translateY(-4px);
          box-shadow: 0 8px 28px rgba(0,0,0,.25);
        }

        /* ── SECTIONS ── */
        .section { padding-block: var(--space-section); }
        .section:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,.04); }
        .section-header { margin-bottom: clamp(2rem,4vw,3rem); max-width: 36rem; }
        .section-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: .7rem; font-weight: 700; letter-spacing: .22em;
          text-transform: uppercase; color: var(--purple);
          margin-bottom: .65rem;
          display: flex; align-items: center; gap: .75rem;
        }
        .section-eyebrow::before { content: ''; display: block; width: 20px; height: 1px; background: var(--purple); }
        .section-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1.5rem,4vw,2.25rem); font-weight: 900;
          letter-spacing: .06em; text-transform: uppercase;
          color: #e9d5ff; line-height: 1.15;
        }
        .section-title span { color: var(--purple); text-shadow: 0 0 24px rgba(168,85,247,.35); }

        /* ── GAME CARDS ── */
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
          gap: 1rem;
        }

        .game-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 1.75rem;
          backdrop-filter: blur(14px);
          transition: transform .4s var(--ease-spring), border-color .35s ease, box-shadow .35s ease;
          animation: fadeUp .6s var(--ease-smooth) both;
          cursor: default;
        }

        /* animated border on hover */
        .game-card::before {
          content: ''; position: absolute;
          inset: 0; border-radius: 16px;
          padding: 1px;
          background: linear-gradient(90deg, var(--purple), #06b6d4, var(--purple));
          background-size: 200% 100%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity .35s ease;
          animation: borderRun 3s linear infinite;
        }
        .game-card::after {
          content: ''; position: absolute; inset: 0; border-radius: 16px;
          background: linear-gradient(160deg,rgba(168,85,247,.08),transparent 50%);
          opacity: 0; transition: opacity .35s ease; pointer-events: none;
        }
        .game-card:hover { transform: translateY(-8px); box-shadow: 0 20px 48px rgba(0,0,0,.4), 0 0 32px rgba(168,85,247,.1); }
        .game-card:hover::before, .game-card:hover::after { opacity: 1; }

        /* scan line inside card on hover */
        .game-card-scan {
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), transparent);
          top: -2px; opacity: 0; transition: opacity .2s;
          animation: scanBar 2s ease-in-out infinite;
        }
        .game-card:hover .game-card-scan { opacity: 1; }

        .game-name {
          position: relative; z-index: 1;
          font-family: 'Orbitron', sans-serif; font-size: 1.1rem; font-weight: 800;
          letter-spacing: .03em; margin-bottom: 1.25rem;
          transition: color .3s ease, text-shadow .3s ease;
        }
        .game-card:hover .game-name { color: #fff; text-shadow: 0 0 20px rgba(168,85,247,.4); }

        .game-status {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .35rem .85rem; border-radius: 999px;
          background: rgba(168,85,247,.1); border: 1px solid rgba(168,85,247,.25);
          color: #c084fc; font-size: .65rem; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          transition: transform .35s var(--ease-spring), box-shadow .35s ease;
        }
        .game-status::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: var(--purple); box-shadow: 0 0 8px var(--purple);
          animation: ringPulse 1.5s ease-in-out infinite;
        }
        .game-card:hover .game-status { transform: scale(1.04); box-shadow: 0 0 16px rgba(168,85,247,.25); }

        /* ── STATS ── */
        .stats-bar {
          display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 1.25rem;
        }
        .stat-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px; padding: 2rem 1.5rem; text-align: center;
          transition: transform .4s var(--ease-spring), border-color .35s ease, box-shadow .35s ease;
          animation: statCount .6s var(--ease-smooth) both;
        }
        .stat-card::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--purple), transparent);
          opacity: 0; transition: opacity .35s ease;
        }
        .stat-card:hover { transform: translateY(-6px); border-color: rgba(168,85,247,.3); box-shadow: 0 16px 40px rgba(0,0,0,.3), 0 0 20px rgba(168,85,247,.08); }
        .stat-card:hover::before { opacity: 1; }

        .stat-number {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2rem,4vw,2.5rem); font-weight: 900; color: #c084fc;
          line-height: 1; margin-bottom: .5rem;
          text-shadow: 0 0 24px rgba(168,85,247,.25);
          transition: text-shadow .35s ease;
        }
        .stat-card:hover .stat-number { text-shadow: 0 0 32px rgba(168,85,247,.55); }
        .stat-label { color: #6b7280; font-size: .85rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }

        /* ── PLAYERS ── */
        .players-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap: 1.25rem; }

        .player-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px; padding: 1.75rem 2rem;
          transition: transform .4s var(--ease-spring), border-color .35s ease, box-shadow .35s ease;
          animation: fadeUp .6s var(--ease-smooth) both;
        }
        .player-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: var(--purple); opacity: .5;
          transition: opacity .35s ease, box-shadow .35s ease;
        }
        /* avatar placeholder */
        .player-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: rgba(168,85,247,.1); border: 2px solid rgba(168,85,247,.3);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', sans-serif; font-size: .9rem; font-weight: 900;
          color: var(--purple); margin-bottom: .75rem;
          position: relative; transition: box-shadow .35s ease;
        }
        .player-avatar::after {
          content: ''; position: absolute; inset: -4px; border-radius: 50%;
          border: 1px solid var(--purple); opacity: .3;
          animation: ringPulse 2s ease-in-out infinite;
        }

        .player-card.rank-gold .player-avatar { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,.1); }
        .player-card.rank-gold .player-avatar::after { border-color: #f59e0b; }
        .player-card.rank-silver .player-avatar { border-color: #e2e8f0; color: #e2e8f0; background: rgba(226,232,240,.08); }
        .player-card.rank-silver .player-avatar::after { border-color: #e2e8f0; }
        .player-card.rank-bronze .player-avatar { border-color: #cd7c2f; color: #cd7c2f; background: rgba(205,124,47,.1); }
        .player-card.rank-bronze .player-avatar::after { border-color: #cd7c2f; }

        .player-card:hover { transform: translateY(-6px) translateX(4px); border-color: rgba(168,85,247,.35); box-shadow: 0 16px 40px rgba(0,0,0,.3); }
        .player-card:hover::before { opacity: 1; box-shadow: 0 0 12px var(--purple); }
        .player-card.rank-gold::before { background: #f59e0b; }
        .player-card.rank-gold:hover::before { box-shadow: 0 0 12px #f59e0b; }
        .player-card.rank-silver::before { background: #9ca3af; }
        .player-card.rank-bronze::before { background: #d97706; }

        .player-card:hover .player-avatar { box-shadow: 0 0 16px currentColor; }

        .player-rank {
          font-family: 'JetBrains Mono', monospace; color: var(--purple);
          font-weight: 900; font-size: .85rem; letter-spacing: .14em; margin-bottom: .4rem;
        }
        .player-card.rank-gold .player-rank { color: #f59e0b; }
        .player-card.rank-silver .player-rank { color: #d1d5db; }
        .player-card.rank-bronze .player-rank { color: #f59e0b; }

        .player-name {
          font-family: 'Orbitron', sans-serif; font-size: 1.35rem; font-weight: 800; letter-spacing: .02em;
          transition: color .3s ease;
        }
        .player-card:hover .player-name { color: #fff; }

        /* ── FOOTER ── */
        .home-footer {
          margin-top: 6rem;
          padding: 4rem 2rem 2rem;
          background: linear-gradient(180deg, transparent, rgba(168,85,247,0.04));
          border-top: 1px solid rgba(168,85,247,0.15);
          position: relative;
          z-index: 10;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          max-width: 1200px;
          margin: 0 auto;
          margin-bottom: 3rem;
        }
        .footer-brand .logo-link {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          margin-bottom: 1rem;
        }
        .footer-brand .logo-icon {
          height: 32px;
          mix-blend-mode: screen;
          filter: drop-shadow(0 0 12px rgba(168,85,247,0.4));
        }
        .footer-brand .logo-text {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.1em;
        }
        .footer-brand .logo-text span {
          color: #a855f7;
        }
        .footer-desc {
          color: #9ca3af;
          line-height: 1.6;
          font-size: 0.95rem;
          max-width: 320px;
        }
        .footer-col-title {
          font-family: 'Orbitron', sans-serif;
          color: #fff;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .footer-links a {
          color: #9ca3af;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-flex;
        }
        .footer-links a:hover {
          color: #c084fc;
          transform: translateX(4px);
        }
        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .footer-socials {
          display: flex;
          gap: 1.25rem;
        }
        .footer-socials a {
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s ease;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .footer-socials a:hover {
          color: #a855f7;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .nav-left { flex-direction: column; align-items: flex-start; gap: 1.25rem; }
          .nav-links { gap: 1.25rem 1.5rem; flex-wrap: wrap; }
          .hero-section { min-height: auto; padding-block: 3rem 2rem; }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* SCANLINE */}
      <div className="scanline-overlay" />

      <div className="home-container" ref={containerRef}>
        <div className="grid-bg" />
        <canvas className="bg-particles" ref={canvasRef} />
        <div className="glow-cursor-trail" />
        <div className="glow-cursor" />
        <div className="glow-one" />
        <div className="glow-two" />

        <div className="page-shell">

          {/* NAV */}
          <nav className="navbar">
            <div className="nav-left">
              <Link to="/" className="logo-link">
                <img src="/logo.png" alt="Daddy Gaming Lobby" className="logo-icon" />
                <div className="logo-text">DADDY GAMING <span>LOBBY</span></div>
              </Link>
              <div className="nav-links">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/tournaments">Tournaments</Link>
                <Link to="/leaderboard">Leaderboard</Link>
              </div>
            </div>
          </nav>

          {/* HERO */}
          <section className="hero-section">
            <p className="hero-eyebrow">Competitive Gaming Arena</p>
            <h1 className="hero-title">
              <div className="hero-white">DOMINATE</div>
              <div className="hero-purple">THE ARENA</div>
            </h1>
            <p className="hero-text">
              Step into the ultimate competitive gaming arena. Join tournaments, climb leaderboards, squad up
              with players and become part of the next generation of esports warriors inside Daddy Gaming Lobby.
            </p>
            <div className="hero-buttons">
              <Link to="/tournaments" className="primary-btn">START PLAYING</Link>
              <a href="https://discord.gg/gf7Ecat6Ka" target="_blank" rel="noreferrer" className="secondary-btn">DISCORD</a>
            </div>
          </section>

          {/* GAMES */}
          <section className="section">
            <div className="section-header">
              <p className="section-eyebrow">Supported Titles</p>
              <h2 className="section-title">Featured <span>Games</span></h2>
            </div>
            <div className="games-grid">
              {featuredGames.map((game, index) => (
                <div className="game-card" key={game} style={{ animationDelay: `${.08 * index}s` }}>
                  <div className="game-card-scan" />
                  <div className="game-name">{game}</div>
                  <div className="game-status">ACTIVE REALM</div>
                </div>
              ))}
            </div>
          </section>

          {/* STATS */}
          <section className="section">
            <div className="section-header">
              <p className="section-eyebrow">Live Numbers</p>
              <h2 className="section-title">Community <span>Stats</span></h2>
            </div>
            <div className="stats-bar">
              {[
                { num: "120+", label: "Registered Players" },
                { num: "9", label: "Active Games" },
                { num: "12+", label: "Tournaments Hosted" },
                { num: "99%", label: "Server Uptime" },
              ].map((s, i) => (
                <div className="stat-card" key={s.label} style={{ animationDelay: `${.05 * (i + 1)}s` }}>
                  <div className="stat-number">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* PLAYERS */}
          <section className="section">
            <div className="section-header">
              <p className="section-eyebrow">Top Competitors</p>
              <h2 className="section-title">Hall Of <span>Titans</span></h2>
            </div>
            <div className="players-grid">
              {topPlayers.map((player, index) => {
                const rankClass = index === 0 ? "rank-gold" : index === 1 ? "rank-silver" : "rank-bronze";
                const initials = player.name.slice(0, 2).toUpperCase();
                return (
                  <div className={`player-card ${rankClass}`} key={player.name} style={{ animationDelay: `${.1 * index}s` }}>
                    <div className="player-avatar">{initials}</div>
                    <div className="player-rank">{player.rank}</div>
                    <div className="player-name">{player.name}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="home-footer">
            <div className="footer-grid">
              <div className="footer-brand">
                <Link to="/" className="logo-link">
                  <img src="/logo.png" alt="Daddy Gaming Lobby" className="logo-icon" />
                  <div className="logo-text">DADDY GAMING <span>LOBBY</span></div>
                </Link>
                <p className="footer-desc">
                  The ultimate competitive gaming arena. Join tournaments, climb leaderboards, and become part of the next generation of esports warriors.
                </p>
              </div>
              
              <div className="footer-col">
                <h3 className="footer-col-title">Navigation</h3>
                <div className="footer-links">
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/tournaments">Tournaments</Link>
                  <Link to="/leaderboard">Leaderboard</Link>
                </div>
              </div>

              <div className="footer-col">
                <h3 className="footer-col-title">Community</h3>
                <div className="footer-links">
                  <a href="https://discord.gg/gf7Ecat6Ka" target="_blank" rel="noreferrer">Discord Server</a>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="footer-copyright">
                © {new Date().getFullYear()} Daddy Gaming Lobby. All rights reserved.
              </div>
              <div className="footer-socials">
                <Link to="/privacy">PRIVACY</Link>
                <Link to="/terms">TERMS</Link>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}