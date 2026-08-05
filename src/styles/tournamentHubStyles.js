import { dglLayoutTokens } from "./dglLayoutTokens";

/** Phase 2 tournament hub sections — matches existing DGL dark/futuristic look. */
export const tournamentHubStyles = `
${dglLayoutTokens}

.hub-hero {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(168, 85, 247, 0.35);
  background: rgba(13, 13, 18, 0.95);
  min-height: 220px;
}

.hub-hero-banner {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent, #a855f7) 35%, transparent), transparent 55%),
    linear-gradient(160deg, rgba(0, 200, 131, 0.12), transparent 50%),
    radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--accent, #a855f7) 40%, transparent), transparent 55%);
  pointer-events: none;
}

.hub-hero-content {
  position: relative;
  z-index: 1;
  padding: clamp(1.4rem, 3vw, 2.4rem);
}

.hub-hero-eyebrow {
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 0.2em;
  font-size: 0.72rem;
  color: var(--accent, #a855f7);
  margin-bottom: 0.6rem;
  text-transform: uppercase;
}

.hub-hero-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.45rem, 3.4vw, 2.35rem);
  margin-bottom: 0.35rem;
  line-height: 1.15;
}

.hub-hero-subtitle {
  margin: 0 0 0.85rem;
  color: #c4b5fd;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}

.hub-hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
  margin-bottom: 1.25rem;
}

.hub-hero-game {
  font-weight: 700;
  letter-spacing: 0.04em;
}

.hub-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(0,0,0,0.35);
  font-size: 0.85rem;
  font-weight: 700;
}

.hub-hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.hub-hero-stat,
.hub-standings-meta > div {
  padding: 0.75rem 0.9rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(0,0,0,0.28);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hub-hero-stat .label,
.hub-standings-meta .label,
.hub-result-body .label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
}

.hub-hero-stat .value,
.hub-standings-meta .value,
.hub-result-body .value {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.95rem;
}

.hub-hero-stat .text-accent {
  color: var(--accent, #a855f7);
}

.hub-countdown {
  padding: 1.25rem 1.4rem;
  border-radius: 16px;
  border: 1px solid rgba(249, 115, 22, 0.35);
  background: linear-gradient(145deg, rgba(249, 115, 22, 0.12), rgba(6,6,8,0.9));
}

.hub-countdown h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  margin-bottom: 0.45rem;
}

.hub-countdown-value {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
  color: #fdba74;
}

.hub-countdown-live {
  border-color: rgba(239, 68, 68, 0.45);
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.16), rgba(6,6,8,0.9));
}

.hub-countdown-done {
  border-color: rgba(156, 163, 175, 0.35);
  background: linear-gradient(145deg, rgba(156, 163, 175, 0.12), rgba(6,6,8,0.9));
}

.hub-section {
  margin-top: 0.25rem;
}

.hub-section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.9rem;
  color: #e5e7eb;
}

.hub-muted,
.hub-empty {
  color: #9ca3af;
  line-height: 1.5;
}

.hub-groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.85rem;
}

.hub-group-card {
  border: 1px solid rgba(168, 85, 247, 0.28);
  border-radius: 14px;
  background: rgba(13, 13, 18, 0.9);
  padding: 1rem 1.1rem;
}

.hub-group-card h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  color: var(--accent, #a855f7);
}

.hub-group-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.hub-group-list li {
  display: flex;
  gap: 0.55rem;
  align-items: center;
}

.hub-seed {
  font-size: 0.75rem;
  color: #9ca3af;
  min-width: 1.6rem;
}

.hub-player-link {
  color: #f3f4f6;
  text-decoration: none;
  font-weight: 600;
}

.hub-player-link:hover {
  color: var(--accent, #a855f7);
  text-decoration: underline;
}

.hub-bracket {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.hub-bracket-round h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 0.06em;
  margin-bottom: 0.7rem;
  color: #c4b5fd;
}

.hub-bracket-matches,
.hub-results-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
}

.hub-match-card,
.hub-result-card,
.hub-schedule-row {
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  background: rgba(0,0,0,0.32);
  padding: 0.9rem 1rem;
}

.hub-match-players {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.hub-match-player {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: center;
}

.hub-match-player.winner .hub-player-link,
.hub-winner {
  color: #86efac;
}

.hub-vs {
  opacity: 0.55;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-align: center;
}

.hub-score {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.95rem;
}

.hub-match-footer,
.hub-schedule-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 0.9rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

.hub-match-status {
  font-weight: 700;
  letter-spacing: 0.04em;
}

.hub-match-status.status-live { color: #f87171; }
.hub-match-status.status-completed { color: #86efac; }
.hub-match-status.status-scheduled { color: #93c5fd; }

.hub-schedule-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.hub-schedule-players {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 0.7rem;
  align-items: center;
  font-weight: 600;
}

.hub-result-round {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a78bfa;
  margin-bottom: 0.55rem;
}

.hub-result-body {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
}

.hub-result-matchup {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.65rem;
  align-items: center;
  font-size: 0.9rem;
  opacity: 0.85;
}

.hub-standings-tiers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.hub-standing-tier {
  border: 1px solid rgba(168, 85, 247, 0.28);
  border-radius: 14px;
  padding: 1rem;
  background: rgba(13, 13, 18, 0.88);
}

.hub-standing-tier h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem;
  margin-bottom: 0.65rem;
}

.hub-standing-names {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.hub-standings-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .hub-hero-content { padding: 1.15rem; }
  .hub-schedule-meta { flex-direction: column; gap: 0.35rem; }
}

.reserve-info {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
}

.reserve-info-btn {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  padding: 0.1rem 0.25rem;
  border-radius: 6px;
}

.reserve-info-btn:hover,
.reserve-info-btn:focus-visible {
  background: rgba(251, 191, 36, 0.12);
  outline: none;
}

.reserve-info-popover {
  position: absolute;
  z-index: 40;
  left: 50%;
  top: calc(100% + 0.45rem);
  transform: translateX(-50%);
  width: min(260px, 70vw);
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  border: 1px solid rgba(251, 191, 36, 0.35);
  background:
    linear-gradient(160deg, rgba(251, 191, 36, 0.14), rgba(6, 6, 8, 0.96)),
    rgba(13, 13, 18, 0.98);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  animation: reserveTipIn 160ms ease-out;
}

.reserve-info-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  color: #fbbf24;
}

.reserve-info-body {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #e5e7eb;
}

@keyframes reserveTipIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
`;
