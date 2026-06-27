import { tournamentsPageStyles } from "./tournamentsPageStyles";

export const tournamentResultsPageStyles = `
  ${tournamentsPageStyles}

  .results-page {
    min-height: 100vh;
    background: #060608;
    position: relative;
    overflow: hidden;
    padding: clamp(1.25rem, 3vw, 2.5rem) clamp(1.25rem, 4vw, 3.5rem);
  }

  .results-page.glow-active .glow-cursor,
  .results-page.glow-active .glow-cursor-trail { opacity: 1; }

  .results-shell {
    position: relative;
    z-index: 5;
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .results-section {
    animation: fadeUp 0.6s ease both;
  }

  .results-section-heading {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.25rem;
    color: #d1d5db;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .results-section-heading::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(168,85,247,0.3), transparent);
  }

  .results-section-heading.champions-heading {
    color: #fcd34d;
    text-shadow: 0 0 16px rgba(245,158,11,0.35);
  }

  .results-section-heading.champions-heading::after {
    background: linear-gradient(90deg, rgba(245,158,11,0.4), transparent);
  }

  .results-section-heading.runner-up-heading {
    color: #e2e8f0;
  }

  /* Hero */
  .results-hero-card {
    position: relative;
    padding: 2px;
    background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 60%, transparent), rgba(255,255,255,0.05));
    clip-path: polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px);
    animation: fadeUp 0.6s ease both;
  }

  .results-hero-inner {
    position: relative;
    background: linear-gradient(135deg, rgba(10,10,15,0.96), rgba(20,10,30,0.96));
    clip-path: polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px);
    padding: clamp(2rem, 4vw, 3rem);
    overflow: hidden;
  }

  .results-hero-scanlines {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.15) 50%);
    background-size: 100% 4px;
    pointer-events: none;
    opacity: 0.8;
  }

  .results-hero-header {
    position: relative;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .results-hero-title-block {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .results-hero-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(1.5rem, 4vw, 2.4rem);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #fff;
    line-height: 1.15;
    text-shadow: 0 0 16px color-mix(in srgb, var(--accent) 45%, transparent);
  }

  .results-tournament-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.85rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #c084fc;
    background: rgba(168,85,247,0.12);
    border: 1px solid rgba(168,85,247,0.35);
    border-radius: 4px;
    width: fit-content;
    box-shadow: 0 0 12px rgba(168,85,247,0.15);
  }

  .results-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.85rem;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #fcd34d;
    background: rgba(245,158,11,0.12);
    border: 1px solid #f59e0b;
    border-radius: 4px;
    text-shadow: 0 0 8px rgba(245,158,11,0.35);
  }

  .results-hero-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .results-hero-grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (min-width: 900px) {
    .results-hero-grid { grid-template-columns: repeat(5, 1fr); }
  }

  .results-hero-stat {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    padding: 0.85rem 1rem;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  /* Player cards */
  .results-players-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 480px) {
    .results-players-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (min-width: 900px) {
    .results-players-grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (min-width: 1100px) {
    .results-players-grid.champions-grid { grid-template-columns: repeat(5, 1fr); }
  }

  .results-player-card {
    position: relative;
    padding: 1px;
    border-radius: 6px;
    background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent);
    transition: transform 0.3s ease, filter 0.3s ease;
    animation: fadeUp 0.6s ease both;
  }

  .results-player-card:hover {
    transform: translateY(-4px);
  }

  .results-player-card.champion-card {
    background: linear-gradient(135deg, rgba(245,158,11,0.55), rgba(168,85,247,0.25));
    filter: drop-shadow(0 0 12px rgba(245,158,11,0.12));
  }

  .results-player-card.champion-card:hover {
    filter: drop-shadow(0 0 24px rgba(245,158,11,0.35));
  }

  .results-player-card.runner-up-card {
    background: linear-gradient(135deg, rgba(148,163,184,0.35), rgba(168,85,247,0.12));
  }

  .results-player-card.runner-up-card:hover {
    filter: drop-shadow(0 0 16px rgba(148,163,184,0.25));
  }

  .results-player-inner {
    background: rgba(10,10,14,0.96);
    border-radius: 5px;
    padding: 1.35rem 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.65rem;
    min-height: 100%;
  }

  .champion-card .results-player-inner {
    background: linear-gradient(160deg, rgba(20,14,8,0.98), rgba(10,10,14,0.98));
    box-shadow: inset 0 0 30px rgba(245,158,11,0.06);
  }

  .results-player-badge {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.25rem 0.55rem;
    border-radius: 4px;
  }

  .results-player-badge.champion {
    color: #fcd34d;
    background: rgba(245,158,11,0.15);
    border: 1px solid rgba(245,158,11,0.45);
    box-shadow: 0 0 12px rgba(245,158,11,0.2);
  }

  .results-player-badge.runner-up {
    color: #cbd5e1;
    background: rgba(148,163,184,0.12);
    border: 1px solid rgba(148,163,184,0.35);
  }

  .results-player-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.04em;
    word-break: break-word;
  }

  .champion-card .results-player-name {
    text-shadow: 0 0 12px rgba(245,158,11,0.25);
  }

  .results-player-points {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a855f7;
    text-shadow: 0 0 8px rgba(168,85,247,0.35);
  }

  .champion-card .results-player-points {
    color: #fcd34d;
    text-shadow: 0 0 10px rgba(245,158,11,0.35);
  }

  /* Champions glow backdrop */
  .champions-section-wrap {
    position: relative;
    padding: 2px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(245,158,11,0.35), rgba(168,85,247,0.2), transparent);
  }

  .champions-section-inner {
    background: rgba(6,6,8,0.92);
    border-radius: 6px;
    padding: clamp(1.5rem, 3vw, 2.25rem);
    position: relative;
    overflow: hidden;
  }

  .champions-glow {
    position: absolute;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245,158,11,0.18), transparent 70%);
    filter: blur(60px);
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  /* Rewards card */
  .results-rewards-card {
    position: relative;
    padding: 2px;
    border-radius: 6px;
    background: linear-gradient(135deg, rgba(168,85,247,0.35), rgba(245,158,11,0.2));
    animation: fadeUp 0.6s ease both 0.15s;
  }

  .results-rewards-inner {
    background: rgba(10,10,14,0.96);
    border-radius: 5px;
    padding: clamp(1.75rem, 3vw, 2.5rem);
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 640px) {
    .results-rewards-inner { grid-template-columns: 1fr 1fr; }
  }

  .results-reward-item {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 4px;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .results-reward-label {
    font-size: 0.95rem;
    font-weight: 700;
    color: #d1d5db;
    letter-spacing: 0.04em;
  }

  .results-reward-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    color: #fff;
  }

  .results-reward-value.gold {
    color: #fcd34d;
    text-shadow: 0 0 12px rgba(245,158,11,0.35);
  }

  .results-reward-value.purple {
    color: #c084fc;
    text-shadow: 0 0 12px rgba(168,85,247,0.35);
  }

  /* Summary card */
  .results-summary-card {
    position: relative;
    padding: 2px;
    background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 40%, transparent), rgba(168,85,247,0.15));
    clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
    animation: fadeUp 0.6s ease both 0.2s;
  }

  .results-summary-inner {
    background: rgba(10,10,14,0.96);
    clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
    padding: clamp(1.75rem, 3vw, 2.5rem);
  }

  .results-summary-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }

  @media (min-width: 640px) {
    .results-summary-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (min-width: 900px) {
    .results-summary-grid { grid-template-columns: repeat(3, 1fr); }
  }

  .results-summary-row {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.75rem 1rem;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 4px;
  }

  .results-summary-label {
    font-size: 0.72rem;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
  }

  .results-summary-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: #fff;
  }

  .results-nav {
    display: flex;
    justify-content: center;
    padding-top: 0.5rem;
    animation: fadeUp 0.6s ease both 0.25s;
  }

  .results-back-btn {
    font-size: 0.95rem;
    padding: 0.9rem 2.25rem;
  }

  .results-not-found {
    text-align: center;
    padding: 3rem 1.5rem;
  }

  @media (max-width: 768px) {
    .results-hero-card,
    .results-hero-inner {
      clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
    }
  }
`;
