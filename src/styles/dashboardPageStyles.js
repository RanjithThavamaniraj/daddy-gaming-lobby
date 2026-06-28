import { dglLayoutTokens } from "./dglLayoutTokens";

export const dashboardPageStyles = `
        ${dglLayoutTokens}
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
          padding: var(--dgl-page-gutter-y) var(--dgl-page-gutter-x);
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
          max-width: var(--dgl-content-max);
          margin: 0 auto;
        }


        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .quick-join-btn {
          position: relative;
          background: linear-gradient(135deg, #c084fc 0%, #9333ea 100%);
          border: none;
          padding: 0.65rem 1.4rem;
          border-radius: 999px;
          color: #fff;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(168,85,247,0.4);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .quick-join-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg);
          animation: btnSweep 3s infinite;
        }

        @keyframes btnSweep {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }

        .quick-join-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 20px rgba(168,85,247,0.6);
        }

        .quick-join-btn:active {
          transform: translateY(1px) scale(0.98);
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
          margin-bottom: var(--dgl-title-gap);
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
          grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
          gap: clamp(1.25rem, 2.5vw, 1.75rem);
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
          transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--ty, 0px)) scale(var(--s, 1));
          transition:
            transform 0.15s ease-out,
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
          --ty: -6px;
          --s: 1.02;
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

        @keyframes livePulse {
          0% { box-shadow: 0 0 0 0 rgba(168,85,247,0.4); border-color: rgba(168,85,247,0.3); }
          70% { box-shadow: 0 0 0 10px rgba(168,85,247,0); border-color: rgba(255,255,255,0.06); }
          100% { box-shadow: 0 0 0 0 rgba(168,85,247,0); border-color: rgba(255,255,255,0.06); }
        }

        .activity-card.live-pulse {
          animation: cardEnter 0.5s ease both, livePulse 2.5s infinite;
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
          margin-bottom: var(--dgl-title-gap);
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

        @media (max-width: 1024px) {
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

          .page-title {
            font-size: 2rem;
          }
        }

  /* ── Dashboard widgets ── */
  .dashboard-widgets-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .dashboard-widget {
    animation-delay: 0.6s;
  }

  .dashboard-widget .panel-header {
    margin-bottom: 1.25rem;
  }

  .widget-body {
    position: relative;
    z-index: 1;
  }

  .widget-eyebrow {
    display: block;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #c084fc;
    margin-bottom: 0.5rem;
  }

  .widget-tournament-badge {
    display: inline-block;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #fcd34d;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.35);
    padding: 0.3rem 0.65rem;
    border-radius: 4px;
    margin-bottom: 0.75rem;
  }

  .widget-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 0.35rem;
    line-height: 1.3;
  }

  .widget-championship-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: #c084fc;
    margin-bottom: 1rem;
    line-height: 1.35;
  }

  .widget-meta-grid {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    margin-bottom: 1rem;
  }

  .widget-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.65rem 0.85rem;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 4px;
  }

  .widget-meta-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #6b7280;
  }

  .widget-meta-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: #d1d5db;
  }

  .widget-meta-inline {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .widget-status-completed {
    color: #fcd34d;
    text-shadow: 0 0 8px rgba(245,158,11,0.35);
  }

  .widget-announcement {
    font-size: 0.95rem;
    font-weight: 600;
    color: #9ca3af;
    line-height: 1.5;
    margin-top: 0.75rem;
  }

  .coming-soon-badge {
    background: rgba(168,85,247,0.12);
    border-color: rgba(168,85,247,0.35);
    color: #c084fc;
  }

  .leaderboard-preview-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
    z-index: 1;
  }

  .leaderboard-preview-row {
    display: grid;
    grid-template-columns: 36px 1fr auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    transition: border-color 0.3s ease, background 0.3s ease;
  }

  .leaderboard-preview-row:hover {
    border-color: rgba(168,85,247,0.25);
    background: rgba(168,85,247,0.05);
  }

  .preview-rank {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    color: #c084fc;
  }

  .preview-name {
    font-weight: 700;
    font-size: 0.95rem;
    color: #e5e7eb;
  }

  .preview-points {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.95rem;
    font-weight: 800;
    color: #e9d5ff;
    text-shadow: 0 0 12px rgba(168,85,247,0.3);
  }

  .widget-link-footer {
    display: inline-block;
    margin-top: 1.25rem;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #c084fc;
    text-decoration: none;
    transition: text-shadow 0.2s ease, color 0.2s ease;
    position: relative;
    z-index: 1;
  }

  .widget-link-footer:hover {
    color: #e9d5ff;
    text-shadow: 0 0 12px rgba(168,85,247,0.5);
  }

  .cyber-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .cyber-btn.outline {
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--accent, #a855f7) 50%, transparent);
    color: var(--accent, #c084fc);
  }

  .cyber-btn.outline:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 20px color-mix(in srgb, var(--accent, #a855f7) 25%, transparent);
  }

  .widget-action-btn {
    margin-top: 0.25rem;
  }

  .game-card:nth-child(10) { animation-delay: 0.9s; }

  .stat-icon {
    font-size: 1.35rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 1280px) and (min-width: 769px) {
    .dashboard-widgets-row {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .dashboard-widgets-row {
      grid-template-columns: 1fr;
    }
  }
`;
