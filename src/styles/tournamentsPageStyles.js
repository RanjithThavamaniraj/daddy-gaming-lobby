import { dglLayoutTokens } from "./dglLayoutTokens";

export const tournamentsPageStyles = `
  ${dglLayoutTokens}

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
    padding: var(--dgl-page-gutter-y) var(--dgl-page-gutter-x);
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
    max-width: var(--dgl-content-max);
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

  .layout-grid {
    display: flex;
    flex-direction: column;
    gap: var(--dgl-section-gap);
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

  /* Keep the open-regs indicator at the far right of the Main Event heading. */
  .featured-section > .section-heading::after {
    order: 1;
  }

  .featured-section > .section-heading > .status-badge-custom {
    order: 2;
    flex-shrink: 0;
    letter-spacing: 0.12em;
    font-size: 0.68rem;
  }

  .hub-cards-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 768px) {
    .hub-cards-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Hero Card */
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
    background: linear-gradient(135deg, rgba(10,10,15,0.96), rgba(20,10,30,0.96));
    clip-path: polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px);
    padding: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(1.5rem, 5vw, 4rem);
    overflow: hidden;
  }

  .hero-inner:not(:has(.hero-action-container)) {
    justify-content: flex-start;
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

  .hero-details-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    z-index: 2;
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

  .hero-tournament-badge {
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
    width: fit-content;
  }

  .hero-champions-block {
    margin-bottom: 1.25rem;
    position: relative;
    z-index: 2;
  }

  .hero-champions-label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #fcd34d;
    margin-bottom: 0.65rem;
  }

  .hero-champions-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.35rem 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hero-champions-list li {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    color: #e5e7eb;
    padding-left: 0.85rem;
    position: relative;
  }

  .hero-champions-list li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--accent);
  }

  .hero-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #fff;
    text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 50%, transparent);
    margin: 0;
    line-height: 1.1;
  }

  .hero-badges {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .status-badge-custom {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: 4px;
  }

  .status-badge-custom.tournament-completed,
  .status-badge-custom.completed {
    background: rgba(245,158,11,0.12);
    border: 1px solid #f59e0b;
    color: #fcd34d;
    text-shadow: 0 0 8px rgba(245,158,11,0.35);
  }

  .status-badge-custom.coming-soon {
    background: rgba(168,85,247,0.1);
    border: 1px solid rgba(168,85,247,0.35);
    color: #c084fc;
    white-space: nowrap;
  }

  .status-badge-custom.registrations-open {
    background: rgba(0,200,83,0.12);
    border: 1px solid rgba(0,200,83,0.55);
    color: #5ef08a;
    text-shadow: 0 0 8px rgba(0,200,83,0.4);
    white-space: nowrap;
  }

  .status-badge-custom.live {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.55);
    color: #fca5a5;
    text-shadow: 0 0 8px rgba(239,68,68,0.4);
    white-space: nowrap;
    animation: livePulse 1.8s ease-in-out infinite;
  }

  .status-badge-custom.registrations-closed {
    background: rgba(250,204,21,0.1);
    border: 1px solid rgba(250,204,21,0.3);
    color: #fde047;
    white-space: nowrap;
  }

  @keyframes livePulse {
    0%, 100% { box-shadow: 0 0 6px rgba(239,68,68,0.25); }
    50% { box-shadow: 0 0 14px rgba(239,68,68,0.5); }
  }

  .hero-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 2rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 640px) {
    .hero-stats-grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (min-width: 900px) {
    .featured-stats-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
  }

  .hero-stat-box {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    padding: 0.75rem 1rem;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    backdrop-filter: blur(4px);
  }

  .stat-label {
    font-size: 0.75rem;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
  }

  .stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: #fff;
  }

  .text-accent {
    color: var(--accent) !important;
    text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .text-completed {
    color: #fcd34d;
    text-shadow: 0 0 8px rgba(245,158,11,0.35);
  }

  .registration-progress-container {
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    width: 100%;
  }

  .progress-text-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #d1d5db;
  }

  .completed-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: #fcd34d;
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-shadow: 0 0 8px rgba(245,158,11,0.35);
  }

  .progress-bar-bg {
    height: 8px;
    background: rgba(255,255,255,0.05);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--accent);
    box-shadow: 0 0 12px var(--accent);
    transition: width 0.6s ease;
    border-radius: 4px;
  }

  .progress-bar-fill.completed {
    width: 100% !important;
    background: linear-gradient(90deg, #f59e0b, #fcd34d, #f59e0b);
    box-shadow: 0 0 16px rgba(245,158,11,0.45);
    animation: completedShimmer 3s ease-in-out infinite;
  }

  @keyframes completedShimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.75; }
  }

  .dates-info-row {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
    color: #9ca3af;
  }

  @media (min-width: 768px) {
    .dates-info-row {
      flex-direction: row;
      gap: 2rem;
    }
  }

  .date-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .date-item strong { color: #fff; }

  .hero-action-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    z-index: 2;
  }

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
    transition: transform 0.2s ease, background 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
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

  .cyber-btn.disabled {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #6b7280;
    cursor: not-allowed;
    box-shadow: none;
    pointer-events: none;
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

  /* Hub tournament cards */
  .tournament-hub-card {
    position: relative;
    padding: 1px;
    border-radius: 6px;
    background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 35%, transparent), rgba(168,85,247,0.15));
    overflow: hidden;
    transition: transform 0.3s ease, background 0.3s ease;
    animation: fadeUp 0.6s ease both;
  }

  .tournament-hub-card:hover {
    transform: translateY(-4px);
    background: linear-gradient(135deg, var(--accent), rgba(168,85,247,0.3));
  }

  .tournament-hub-card-inner {
    background: rgba(10,10,14,0.95);
    padding: 1.5rem;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 100%;
  }

  .hub-card-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .hub-card-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }

  .hub-card-icon svg {
    width: 26px;
    height: 26px;
  }

  .hub-card-titles {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }

  .hub-card-tournament-number {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #c084fc;
  }

  .hub-card-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.2;
  }

  .hub-card-game,
  .hub-card-date {
    font-size: 0.85rem;
    color: #9ca3af;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .hub-card-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 1rem;
  }

  .hub-stat-box {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .hub-stat-label {
    font-size: 0.75rem;
    color: #9ca3af;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .hub-stat-value {
    font-size: 1rem;
    font-weight: 700;
    color: #e5e7eb;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .hub-stat-icon {
    color: #f59e0b;
    flex-shrink: 0;
  }

  .hub-card-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .hub-card-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: 1px solid rgba(156,163,175,0.3);
    background: rgba(156,163,175,0.08);
    color: #9ca3af;
  }

  .hub-card-badge-prize-paid {
    border-color: rgba(245,158,11,0.4);
    background: rgba(245,158,11,0.1);
    color: #f59e0b;
  }

  .hub-card-action {
    margin-top: auto;
  }

  .hub-card-action .cyber-btn {
    width: 100%;
  }

  @media (max-width: 768px) {
    .page-title { font-size: 2rem; }
    .hero-inner {
      flex-direction: column;
      align-items: stretch;
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
    .hero-action-container {
      width: 100%;
      margin-top: 1.5rem;
    }
    .cyber-btn.primary, .cyber-btn.disabled, .cyber-btn.outline {
      width: 100%;
    }
    .hub-card-stats {
      grid-template-columns: 1fr;
    }
  }
`;
