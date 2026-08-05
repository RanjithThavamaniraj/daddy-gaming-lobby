import { dglLayoutTokens } from "./dglLayoutTokens";

export const playerProfilePageStyles = `
${dglLayoutTokens}

.player-profile-page {
  min-height: 100vh;
  background: #060608;
  color: #fff;
  font-family: 'Rajdhani', Arial, sans-serif;
  padding: var(--dgl-page-gutter-y) var(--dgl-page-gutter-x);
}

.player-profile-page .page-shell {
  max-width: var(--dgl-content-max);
  margin: 0 auto;
}

.player-profile-loading {
  opacity: 0.7;
  margin-top: 2rem;
}

.player-profile-card {
  margin-top: 1.5rem;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  border: 1px solid rgba(168, 85, 247, 0.35);
  border-radius: 16px;
  background:
    linear-gradient(145deg, rgba(168, 85, 247, 0.12), rgba(6, 6, 8, 0.92)),
    rgba(13, 13, 18, 0.95);
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.12);
}

.player-profile-eyebrow {
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 0.22em;
  font-size: 0.7rem;
  color: #a855f7;
  margin-bottom: 0.75rem;
}

.player-profile-card h1 {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
  margin-bottom: 0.75rem;
}

.player-profile-new {
  color: #86efac;
  margin-bottom: 1.25rem;
  font-weight: 600;
}

.player-profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
  margin: 1.5rem 0;
}

.player-profile-stat {
  padding: 0.9rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.player-profile-stat .label {
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9ca3af;
}

.player-profile-stat .value {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  color: #f5f3ff;
}

.player-profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.player-profile-actions .cyber-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.2rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.player-profile-actions .cyber-btn.primary {
  background: linear-gradient(90deg, #a855f7, #7c3aed);
  color: #fff;
  border: none;
}

.player-profile-actions .cyber-btn.outline {
  border: 1px solid rgba(168, 85, 247, 0.5);
  color: #e9d5ff;
  background: transparent;
}
`;

export const registeredPlayersStyles = `
.registered-players-section {
  margin-top: 1.5rem;
  padding: 1.25rem;
  border: 1px solid rgba(168, 85, 247, 0.25);
  border-radius: 14px;
  background: rgba(10, 10, 14, 0.72);
}

.registered-players-section h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  color: #e9d5ff;
}

.registered-players-count {
  color: #9ca3af;
  font-weight: 500;
}

.registered-players-empty {
  color: #9ca3af;
  font-size: 0.95rem;
}

.registered-players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.9rem;
}

.player-card {
  display: block;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--accent, #a855f7) 40%, transparent);
  background:
    linear-gradient(
      160deg,
      color-mix(in srgb, var(--accent, #a855f7) 16%, transparent),
      rgba(8, 8, 12, 0.9)
    );
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.player-card-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 24px color-mix(in srgb, var(--accent, #a855f7) 28%, transparent);
  border-color: color-mix(in srgb, var(--accent, #a855f7) 70%, transparent);
}

.player-card-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.player-card-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.92rem;
  font-weight: 700;
  color: #f8fafc;
}

.player-card-new {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #86efac;
  border: 1px solid rgba(134, 239, 172, 0.35);
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
}

.player-card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
}

.player-card-stat {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.player-card-label {
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9ca3af;
}

.player-card-value {
  font-weight: 700;
  color: #f1f5f9;
  font-size: 0.95rem;
}

.lifecycle-panel {
  margin: 1rem 0 1.25rem;
  padding: 1rem 1.1rem;
  border-radius: 12px;
  border: 1px solid rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.08);
}

.lifecycle-panel.live {
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.1);
}

.lifecycle-panel h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.95rem;
  margin-bottom: 0.65rem;
}

.lifecycle-panel p {
  color: #d1d5db;
  margin-bottom: 0.35rem;
}

.lifecycle-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.lifecycle-meta .meta-box {
  padding: 0.7rem 0.8rem;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.lifecycle-meta .meta-box .label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 0.25rem;
}

.lifecycle-meta .meta-box .value {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
}

.live-sections {
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0;
}

.live-section-card {
  padding: 0.9rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(168, 85, 247, 0.28);
  background: rgba(12, 12, 18, 0.75);
}

.live-section-card h4 {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
  color: #e9d5ff;
}

.live-section-card p {
  color: #9ca3af;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .registered-players-grid {
    grid-template-columns: 1fr;
  }
  .player-card-stats {
    grid-template-columns: 1fr;
  }
}
`;
