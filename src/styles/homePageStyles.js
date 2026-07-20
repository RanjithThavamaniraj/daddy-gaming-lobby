import { dglLayoutTokens } from "./dglLayoutTokens";

export const homePageStyles = `
        ${dglLayoutTokens}

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
          --space-section: 4rem; /* 64px — 8px spacing system; steps to 48px ≤768px */
          --space-inline: var(--dgl-page-gutter-x);
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
          max-width: var(--dgl-content-max); margin: 0 auto;
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
          height: clamp(26px, 2.2vw, 34px);
          width: auto;
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
        .nav-links a.is-active { color: #e9d5ff; }
        .nav-links a.is-active::after { transform: scaleX(1); transform-origin: left; }

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
        .section-compact { padding-block: 1.5rem; } /* 24px */
        .section-header { margin-bottom: 2rem; max-width: 36rem; } /* 32px; steps to 24px ≤768px */
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

        /* ── PLATFORM UPDATE ── */
        .platform-update { border-bottom: 1px solid rgba(168,85,247,.12); }
        .platform-update-inner {
          display: flex; flex-wrap: wrap; align-items: stretch; justify-content: space-between;
          gap: 1rem;
          background: linear-gradient(135deg, rgba(168,85,247,.08), rgba(255,255,255,.02));
          border: 1px solid rgba(168,85,247,.18);
          border-radius: 20px;
          padding: 1.5rem 2rem; /* 24px / 32px; steps to 24px ≤768px */
          backdrop-filter: blur(16px);
          animation: fadeUp .6s var(--ease-smooth) both;
        }
        .platform-update-highlights {
          display: flex; flex-wrap: wrap; align-items: center; gap: .5rem 1rem; /* 8px / 16px */
          flex: 1; min-width: min(100%, 280px);
        }
        .platform-update-item {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .55rem 1rem;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 999px;
          animation: fadeUp .5s var(--ease-smooth) both;
        }
        .platform-update-icon { font-size: 1rem; line-height: 1; }
        .platform-update-text {
          font-family: 'Orbitron', sans-serif;
          font-size: .72rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          color: #e9d5ff; white-space: nowrap;
        }
        .platform-update-next {
          display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
          gap: .25rem;
          padding: .75rem 1.25rem;
          border-left: 1px solid rgba(168,85,247,.25);
          min-width: min(100%, 220px);
        }
        .platform-update-next-label {
          font-family: 'Orbitron', sans-serif;
          font-size: .75rem; font-weight: 800;
          letter-spacing: .12em; text-transform: uppercase;
          color: #fcd34d;
        }
        .platform-update-next-title {
          font-size: 1rem; font-weight: 700; color: #fff;
          letter-spacing: .02em;
        }
        .platform-update-next-message {
          font-size: .85rem; font-weight: 600; color: #9ca3af;
          letter-spacing: .04em;
        }

        /* ── WHY DGL ── */
        .why-dgl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1rem;
        }
        .why-dgl-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px; padding: 1.5rem;
          backdrop-filter: blur(14px);
          transition: transform .4s var(--ease-spring), border-color .35s ease, box-shadow .35s ease;
          animation: fadeUp .6s var(--ease-smooth) both;
        }
        .why-dgl-card:hover {
          transform: translateY(-5px);
          border-color: rgba(168,85,247,.3);
          box-shadow: 0 14px 36px rgba(0,0,0,.28), 0 0 18px rgba(168,85,247,.08);
        }
        .why-dgl-icon { font-size: 1.5rem; display: block; margin-bottom: .85rem; }
        .why-dgl-title {
          font-family: 'Orbitron', sans-serif;
          font-size: .92rem; font-weight: 800; letter-spacing: .04em;
          text-transform: uppercase; color: #e9d5ff; margin-bottom: .5rem;
        }
        .why-dgl-desc {
          color: #9ca3af; font-size: .9rem; line-height: 1.55; font-weight: 500;
        }

        /* ── GAME CARDS ── */
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill,minmax(200px,1fr));
          gap: 1rem;
        }

        .game-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 1.5rem;
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
          font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: 800;
          letter-spacing: .03em; margin-bottom: .5rem;
          transition: color .3s ease, text-shadow .3s ease;
        }
        .game-card:hover .game-name { color: #fff; text-shadow: 0 0 20px rgba(168,85,247,.4); }

        .game-tagline {
          position: relative; z-index: 1;
          color: #9ca3af; font-size: .85rem; line-height: 1.5;
          font-weight: 500; margin-bottom: 1rem; min-height: 2.55em;
        }

        .game-status {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .35rem .85rem; border-radius: 999px;
          font-size: .65rem; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          transition: transform .35s var(--ease-spring), box-shadow .35s ease;
        }
        .game-status::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          animation: ringPulse 1.5s ease-in-out infinite;
        }
        .game-status-available {
          background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3);
          color: #86efac;
        }
        .game-status-available::before {
          background: #22c55e; box-shadow: 0 0 8px #22c55e;
        }
        .game-status-coming-soon {
          background: rgba(168,85,247,.1); border: 1px solid rgba(168,85,247,.25);
          color: #c084fc;
        }
        .game-status-coming-soon::before {
          background: var(--purple); box-shadow: 0 0 8px var(--purple);
        }
        .game-status-planned {
          background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
          color: #9ca3af;
        }
        .game-status-planned::before {
          background: #6b7280; box-shadow: none; animation: none;
        }
        .game-card:hover .game-status { transform: scale(1.04); }

        /* ── COMMUNITY PROOF ── */
        .community-proof-grid {
          display: grid;
          grid-template-columns: 1fr minmax(280px, 360px);
          gap: 1rem; /* 16px — matches every other section grid */
          align-items: stretch;
        }
        .community-proof-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .proof-stat-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px; padding: 1.5rem; /* 24px — matches why-dgl/game cards */
          transition: transform .35s var(--ease-spring), border-color .35s ease, box-shadow .35s ease;
          animation: statCount .6s var(--ease-smooth) both;
        }
        .proof-stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(168,85,247,.28);
          box-shadow: 0 12px 32px rgba(0,0,0,.25);
        }
        .proof-stat-icon { font-size: 1.25rem; display: block; margin-bottom: .65rem; }
        .proof-stat-value {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 900;
          color: #c084fc; line-height: 1; margin-bottom: .35rem;
          text-shadow: 0 0 20px rgba(168,85,247,.2);
        }
        .proof-stat-label {
          color: #6b7280; font-size: .72rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
        }
        .community-proof-champion {
          position: relative; overflow: hidden;
          background: linear-gradient(145deg, rgba(245,158,11,.08), rgba(255,255,255,.02));
          border: 1px solid color-mix(in srgb, var(--accent, #f59e0b) 35%, transparent);
          border-radius: 18px; padding: 1.5rem;
          display: flex; flex-direction: column; justify-content: center;
          animation: fadeUp .6s var(--ease-smooth) both .1s;
        }
        .community-proof-champion::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%);
          pointer-events: none;
        }
        .community-proof-champion-eyebrow {
          position: relative; z-index: 1;
          font-family: 'JetBrains Mono', monospace;
          font-size: .65rem; font-weight: 700; letter-spacing: .18em;
          text-transform: uppercase; color: #fcd34d; margin-bottom: .75rem;
        }
        .community-proof-champion-badge {
          position: relative; z-index: 1;
          display: inline-block; align-self: flex-start;
          font-family: 'Orbitron', sans-serif;
          font-size: .68rem; font-weight: 800; letter-spacing: .12em;
          text-transform: uppercase; color: #c084fc;
          background: rgba(168,85,247,.12); border: 1px solid rgba(168,85,247,.3);
          padding: .3rem .65rem; border-radius: 4px; margin-bottom: .75rem;
        }
        .community-proof-champion-title {
          position: relative; z-index: 1;
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 800;
          letter-spacing: .04em; text-transform: uppercase;
          color: #fff; line-height: 1.3; margin-bottom: 1.5rem; /* 24px */
        }
        .community-proof-link {
          position: relative; z-index: 1; align-self: flex-start;
          font-family: 'Orbitron', sans-serif;
          font-size: .78rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; text-decoration: none;
          color: var(--accent, #f59e0b);
          transition: color .25s ease, transform .25s ease;
        }
        .community-proof-link:hover {
          color: #fff; transform: translateX(4px);
        }

        /* ── STATS (legacy, unused on homepage) ── */
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



        .section-intro {
          max-width: 42rem; color: #9ca3af;
          font-size: clamp(1rem,2.2vw,1.1rem); line-height: 1.75; font-weight: 500;
          margin-bottom: clamp(2rem,4vw,2.5rem);
          animation: fadeUp .6s var(--ease-smooth) both;
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill,minmax(240px,1fr));
          gap: 1.25rem;
        }

        .highlight-card, .feature-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px; padding: 1.75rem;
          backdrop-filter: blur(14px);
          transition: transform .4s var(--ease-spring), border-color .35s ease, box-shadow .35s ease;
          animation: fadeUp .6s var(--ease-smooth) both;
        }

        .highlight-card:hover, .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(168,85,247,.3);
          box-shadow: 0 16px 40px rgba(0,0,0,.3), 0 0 20px rgba(168,85,247,.08);
        }

        .highlight-icon, .feature-icon {
          font-size: 1.75rem; display: block; margin-bottom: 1rem;
        }

        .highlight-title, .feature-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem; font-weight: 800; letter-spacing: .04em;
          text-transform: uppercase; color: #e9d5ff; margin-bottom: .65rem;
        }

        .highlight-desc, .feature-desc {
          color: #9ca3af; font-size: .95rem; line-height: 1.65; font-weight: 500;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
          gap: 1.25rem;
        }

        .game-icon-wrap {
          position: relative; z-index: 1;
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem; border-radius: 12px;
          background: color-mix(in srgb, var(--game-accent, var(--purple)) 15%, transparent);
          border: 1px solid color-mix(in srgb, var(--game-accent, var(--purple)) 35%, transparent);
          color: var(--game-accent, var(--purple));
        }

        .game-icon-wrap svg { width: 24px; height: 24px; }

        .game-category-tag {
          position: relative; z-index: 1;
          font-size: .68rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: #6b7280; margin-bottom: 1rem;
        }

        .journey-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;
        }

        .journey-column {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 20px; padding: 1.75rem;
          backdrop-filter: blur(14px);
          animation: fadeUp .6s var(--ease-smooth) both;
        }

        .journey-heading {
          font-family: 'Orbitron', sans-serif;
          font-size: .75rem; font-weight: 800; letter-spacing: .16em;
          text-transform: uppercase; margin-bottom: 1.25rem;
        }

        .completed-heading { color: #4ade80; }
        .upcoming-heading { color: #c084fc; }

        .journey-list { list-style: none; display: flex; flex-direction: column; gap: .85rem; }

        .journey-item {
          display: flex; align-items: center; gap: .85rem;
          padding: .85rem 1rem; border-radius: 12px;
          background: rgba(255,255,255,.02);
          border: 1px solid rgba(255,255,255,.05);
          animation: fadeUp .5s var(--ease-smooth) both;
          transition: border-color .3s ease, transform .3s ease;
        }

        .journey-item:hover { border-color: rgba(168,85,247,.25); transform: translateX(4px); }

        .journey-item.completed .journey-marker {
          color: #4ade80; font-weight: 900; font-size: .9rem;
        }

        .upcoming-marker {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--purple); box-shadow: 0 0 8px var(--purple);
          animation: ringPulse 1.5s ease-in-out infinite;
        }

        .journey-label {
          font-weight: 700; font-size: .95rem; color: #e5e7eb; letter-spacing: .02em;
        }

        .hall-preview-card {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 20px; padding: 2rem;
          backdrop-filter: blur(14px);
          animation: fadeUp .6s var(--ease-smooth) both;
          transition: transform .4s var(--ease-spring), border-color .35s ease, box-shadow .35s ease;
        }

        .hall-preview-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(160deg, color-mix(in srgb, var(--accent, #f59e0b) 10%, transparent), transparent 55%);
          pointer-events: none;
        }

        .hall-preview-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--accent, #f59e0b) 35%, transparent);
          box-shadow: 0 16px 40px rgba(0,0,0,.3), 0 0 24px color-mix(in srgb, var(--accent, #f59e0b) 15%, transparent);
        }

        .hall-preview-badge {
          position: relative; z-index: 1;
          display: inline-block;
          font-family: 'Orbitron', sans-serif;
          font-size: .7rem; font-weight: 800; letter-spacing: .14em;
          text-transform: uppercase; color: #fcd34d;
          background: rgba(245,158,11,.12); border: 1px solid rgba(245,158,11,.35);
          padding: .3rem .65rem; border-radius: 4px; margin-bottom: .85rem;
        }

        .hall-preview-title {
          position: relative; z-index: 1;
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1.1rem,3vw,1.5rem); font-weight: 800;
          letter-spacing: .04em; text-transform: uppercase;
          color: #fff; margin-bottom: 1.25rem;
        }

        .hall-preview-link {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center;
          font-size: .85rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: var(--accent, #fcd34d);
          text-decoration: none; transition: text-shadow .25s ease, color .25s ease;
        }

        .hall-preview-link:hover {
          color: #fff;
          text-shadow: 0 0 16px color-mix(in srgb, var(--accent, #f59e0b) 45%, transparent);
        }

        /* CTA closes into the footer panel — keep ~32px between them so they
           feel continuous without stacking as identical cards. */
        .discord-cta-section { padding-bottom: 0.75rem; border-bottom: none; }

        .discord-cta-card {
          position: relative; overflow: hidden; text-align: center;
          background: linear-gradient(160deg, rgba(168,85,247,.12), rgba(255,255,255,.02));
          border: 1px solid rgba(168,85,247,.22);
          border-radius: 24px; padding: 3rem 2rem; /* 48px / 32px; steps to 32px/24px ≤768px */
          box-shadow: 0 20px 48px rgba(0,0,0,.28), 0 0 32px rgba(168,85,247,.08);
          animation: fadeUp .6s var(--ease-smooth) both;
        }

        .discord-cta-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(168,85,247,.15), transparent 60%);
          pointer-events: none;
        }

        .discord-cta-title {
          position: relative; z-index: 1;
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1.5rem,4vw,2.25rem); font-weight: 900;
          letter-spacing: .06em; text-transform: uppercase;
          color: #e9d5ff; margin-bottom: 1rem;
        }

        .discord-cta-text {
          position: relative; z-index: 1;
          max-width: 36rem; margin: 0 auto 1.5rem; /* 24px */
          color: #9ca3af; font-size: clamp(.95rem, 2vw, 1.05rem);
          line-height: 1.7; font-weight: 500;
        }

        .discord-cta-actions {
          position: relative; z-index: 1;
          display: flex; justify-content: center;
        }

        .section-intro-compact {
          margin-bottom: clamp(1.5rem, 3vw, 2rem);
        }

        .pillars-grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .section-footnote {
          margin-top: 1.5rem;
          text-align: center;
          animation: fadeUp .6s var(--ease-smooth) both;
        }

        .section-footnote-link {
          font-size: .85rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #c084fc;
          text-decoration: none;
          transition: text-shadow .25s ease, color .25s ease;
        }

        .section-footnote-link:hover {
          color: #e9d5ff;
          text-shadow: 0 0 16px rgba(168,85,247,.45);
        }

        .hall-preview-meta {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .hall-preview-status {
          font-family: 'Orbitron', sans-serif;
          font-size: .72rem;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #fcd34d;
          padding: .25rem .6rem;
          border-radius: 4px;
          background: rgba(245,158,11,.1);
          border: 1px solid rgba(245,158,11,.3);
        }

        .hall-preview-date {
          display: inline-flex;
          align-items: center;
          gap: .35rem;
          font-size: .88rem;
          font-weight: 600;
          color: #9ca3af;
        }

        .hall-preview-actions {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          align-items: center;
        }

        .hall-preview-link.primary-link {
          color: var(--accent, #fcd34d);
        }

        .hall-preview-link.secondary-link {
          color: #c084fc;
          font-size: .78rem;
        }

        .journey-teaser {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: .85rem 1.25rem;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
          border-radius: 14px;
          background: rgba(168,85,247,.08);
          border: 1px solid rgba(168,85,247,.22);
          animation: fadeUp .6s var(--ease-smooth) both;
        }

        .journey-teaser-label {
          font-family: 'Orbitron', sans-serif;
          font-size: .72rem;
          font-weight: 800;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: #c084fc;
          padding: .3rem .65rem;
          border-radius: 4px;
          background: rgba(168,85,247,.12);
          border: 1px solid rgba(168,85,247,.35);
        }

        .journey-teaser-text {
          font-size: .95rem;
          font-weight: 600;
          color: #d1d5db;
        }

        .journey-teaser-championship {
          font-family: 'Orbitron', sans-serif;
          font-size: .85rem;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          color: #e9d5ff;
        }

        @media (max-width: 480px) {
          .community-proof-stats { grid-template-columns: 1fr; }
        }
        /* ── FOOTER — quieter glass panel in the CTA material language ── */
        .home-footer {
          position: relative;
          z-index: 10;
          overflow: hidden;
          margin-top: 1.25rem; /* ~20px + CTA 12px ≈ 32px CTA→footer gap */
          margin-bottom: 1.5rem;
          padding: 2rem 2rem 1.5rem;
          background: linear-gradient(160deg, rgba(168,85,247,.06), rgba(255,255,255,.02));
          border: 1px solid rgba(168,85,247,.14);
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(0,0,0,.22), 0 0 24px rgba(168,85,247,.05);
        }
        .home-footer::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(168,85,247,.08), transparent 55%);
          pointer-events: none;
        }
        .home-footer::after {
          display: none;
        }
        .footer-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
          align-items: start;
          gap: 2rem 2.5rem;
          margin-bottom: 1.75rem;
        }
        .footer-brand {
          max-width: 28rem;
        }
        .footer-col {
          min-width: 0;
        }
        .footer-brand .logo-link {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          margin-bottom: 1rem;
        }
        .footer-brand .logo-icon {
          height: 40px;
          width: auto;
          object-fit: contain;
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
          line-height: 1.7;
          font-size: 0.95rem;
          max-width: 360px;
        }
        .footer-col-title {
          font-family: 'Orbitron', sans-serif;
          color: #c084fc;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          margin-bottom: 1rem;
          text-transform: uppercase;
        }
        .footer-col-title::after {
          content: '';
          display: block;
          width: 24px;
          height: 2px;
          margin-top: 0.5rem;
          border-radius: 1px;
          background: linear-gradient(90deg, #a855f7, transparent);
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
          text-shadow: 0 0 14px rgba(168,85,247,0.45);
        }
        .footer-bottom {
          position: relative;
          z-index: 1;
          padding-top: 1.25rem;
          margin-top: 0;
          border-top: 1px solid rgba(168,85,247,.12);
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 2fr);
          align-items: center;
          gap: 1rem 2.5rem;
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .footer-copyright {
          min-width: 0;
        }
        .footer-socials {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 1.5rem;
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
          text-shadow: 0 0 12px rgba(168,85,247,0.4);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .navbar { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .nav-left { flex-direction: column; align-items: flex-start; gap: 1.25rem; }
          .nav-links { gap: 1rem; flex-wrap: wrap; }
          .community-proof-grid { grid-template-columns: 1fr; }
          .platform-update-next {
            border-left: none; border-top: 1px solid rgba(168,85,247,.25);
            padding-top: 1rem; width: 100%;
          }
        }

        @media (max-width: 768px) {
          :root { --space-section: 3rem; } /* 48px */
          .section-header { margin-bottom: 1.5rem; } /* 24px */
          .platform-update-inner { padding: 1.5rem; } /* 24px */
          .discord-cta-card { padding: 2rem 1.5rem; } /* 32px / 24px */
          .hero-section { min-height: auto; padding-block: 3rem 2rem; }
          .community-proof-stats { grid-template-columns: 1fr 1fr; }
          .platform-update-text { white-space: normal; font-size: .68rem; }
          .home-footer {
            margin-top: 1rem;
            margin-bottom: 1.25rem;
            padding: 1.5rem 1.25rem 1.25rem;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 1.75rem;
            margin-bottom: 1.5rem;
          }
          .footer-bottom {
            grid-template-columns: 1fr;
            justify-items: center;
            text-align: center;
            gap: 1rem;
          }
          .footer-socials {
            justify-content: center;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `;
