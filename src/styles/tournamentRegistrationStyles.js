/**
 * Tournament Registration Styles — exclusively for the FC26 registration flow.
 *
 * Premium football pitch-inspired styling that remains unmistakably DGL.
 *
 * Features:
 *   - Stadium lighting gradients (purple/teal accents)
 *   - Emerald accent lighting for football highlights
 *   - Subtle football pitch textures (diagonal stripes)
 *   - Tactical football overlays (grid patterns)
 *   - Premium metallic trophy accents
 *
 * Never resembles official EA SPORTS FC branding.
 */

/** Layout tokens from DGL design system (shared across pages) */
import { dglLayoutTokens } from "./dglLayoutTokens";

export const tournamentRegistrationStyles = `
  ${dglLayoutTokens}

/* Reset / base */
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  background: #060608;
  color: white;
  font-family: 'Rajdhani', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Tournament page shell */
.tournament-page {
  min-height: 100vh;
  background: #060608;
  position: relative;
  overflow: hidden;
  padding: var(--dgl-page-gutter-y) var(--dgl-page-gutter-x);
}

.tournament-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(168,85,247,0.08), rgba(0,200,131,0.05));
  z-index: 0;
  pointer-events: none;
}

.page-shell {
  position: relative;
  z-index: 5;
  max-width: var(--dgl-content-max);
  margin: 0 auto;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--dgl-section-gap);
}

/* Football stadium lighting backdrop */
.tournament-page::after {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 140%;
  height: 140%;
  background: radial-gradient(circle at center, rgba(168,85,247,0.12), transparent 60%);
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
  animation: stadiumPulse 12s ease-in-out infinite;
}

@keyframes stadiumPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* Grid background */
.tournament-page .grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(168,85,247,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168,85,247,0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.3;
  z-index: 0;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
}

/* Main registration card */
.register-card {
  position: relative;
  padding: 2px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 45%, transparent), rgba(168,85,247,0.15));
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
  animation: fadeUp 0.6s ease both;
  overflow: hidden;
}

.register-card::before {
  content: '';
  position: absolute;
  inset: 1px;
  background: linear-gradient(135deg, rgba(10,10,15,0.96), rgba(20,10,30,0.96));
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
  z-index: 1;
}

.register-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0,200,131,0.08) 0%, transparent 50%, rgba(168,85,247,0.08) 100%);
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}

/* FC26 brand accent (#00c853) with indicator */
.tournament-page[data-game-slug="fc-26"] .register-card {
  --accent: #00c853;
}

.tournament-page[data-game-slug="fc-26"] .register-card::after {
  background: linear-gradient(135deg, rgba(0,200,131,0.12) 0%, transparent 50%, rgba(168,85,247,0.12) 100%);
}

/* Football pitch texture overlay */
.tournament-page[data-game-slug="fc-26"] .register-card {
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 50%, transparent), rgba(168,85,247,0.2));
}

.tournament-page[data-game-slug="fc-26"] .register-card::before {
  background: linear-gradient(135deg, rgba(10,10,15,0.98), rgba(20,10,30,0.98));
}

/* Header */
.register-header {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 3rem);
  background: rgba(10,10,14,0.6);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #a855f7;
  text-shadow:
    0 0 20px rgba(168,85,247,0.45),
    0 0 40px rgba(168,85,247,0.15);
  margin-bottom: 1rem;
  animation: titleGlow 4s ease-in-out infinite;
}

.tournament-badge {
  display: inline-block;
  margin-bottom: 0.75rem;
  padding: 0.35rem 1rem;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #c084fc;
  background: rgba(168,85,247,0.12);
  border: 1px solid rgba(168,85,247,0.35);
  border-radius: 4px;
}

.tournament-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
  text-shadow: 0 0 12px color-mix(in srgb, var(--accent) 50%, transparent);
  margin-bottom: 1rem;
}

.tournament-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #9ca3af;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.game-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.game-icon.fc-26 {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 32 32' fill='none' stroke='currentColor' stroke-width='2'%3E%3Ccircle cx='16' cy='16' r='10' stroke='currentColor'/%3E%3Cpath d='M10 16c0-4 2.5-7 6-7s6 3 6 7-2.5 7-6 7-6-3-6-7z' stroke='currentColor' stroke-width='1.5'/%3E%3C/svg%3E");
  color: var(--accent);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 4px;
}

.status-badge.registrations-open {
  background: rgba(0,200,131,0.12);
  border: 1px solid rgba(0,200,131,0.55);
  color: #5ef08a;
  text-shadow: 0 0 8px rgba(0,200,131,0.4);
}

/* Body */
.register-body {
  position: relative;
  z-index: 2;
  padding: clamp(2rem, 5vw, 3rem);
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.register-info {
  position: relative;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 1.75rem;
  backdrop-filter: blur(4px);
}

.register-info h3 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #d1d5db;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.register-info h3::before {
  content: '⚽';
  font-size: 1.2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.info-item .label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9ca3af;
}

.info-item .value {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
}

.info-item .value.text-accent {
  color: var(--accent) !important;
  text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 40%, transparent);
}

/* FC-26 tactical overlay (grass texture) */
.tournament-page[data-game-slug="fc-26"] .register-info {
  background: linear-gradient(135deg, rgba(0,200,131,0.05), rgba(168,85,247,0.05));
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
}

.tournament-page[data-game-slug="fc-26"] .register-info h3 {
  text-shadow: 0 0 12px rgba(0,200,131,0.3);
}

/* Form */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #d1d5db;
  letter-spacing: 0.05em;
}

.form-label .required {
  color: #ef4444;
  font-weight: 800;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  opacity: 0.8;
}

.input-icon svg {
  width: 18px;
  height: 18px;
}

.form-control {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #fff;
  font-family: 'Rajdhani', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent);
  background: rgba(168,85,247,0.05);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 25%, transparent);
}

.form-control::placeholder {
  color: #6b7280;
}

/* Discord-specific visual treatment */
.discord-group .form-control {
  background: linear-gradient(135deg, rgba(0,200,131,0.08), rgba(168,85,247,0.08));
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
}

.discord-group .input-icon {
  background: rgba(0,200,131,0.12);
  border-radius: 4px;
}

/* Submit button */
.submit-btn {
  position: relative;
  z-index: 2;
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 1.25rem;
  cursor: pointer;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 40%, transparent);
}

.submit-btn:hover:not(:disabled) {
  transform: scale(1.03);
  background: color-mix(in srgb, var(--accent) 80%, white);
  box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 60%, transparent);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #6b7280;
  box-shadow: none;
}

.submit-btn.loading {
  animation: buttonPulse 1.5s ease-in-out infinite;
}

@keyframes buttonPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.98); }
}

/* Back link */
.back-link {
  text-align: center;
  margin-top: 2rem;
  animation: fadeUp 0.6s ease both 0.3s;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
  text-decoration: none;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: var(--accent);
  text-shadow: 0 0 8px color-mix(in srgb, var(--accent) 40%, transparent);
}

/* Success page */
.success-card {
  background: linear-gradient(135deg, color-mix(in srgb, #00c853 35%, transparent), rgba(168,85,247,0.15));
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
  position: relative;
  overflow: hidden;
}

.success-card::before {
  content: '';
  position: absolute;
  inset: 1px;
  background: linear-gradient(135deg, rgba(10,10,14,0.98), rgba(20,10,30,0.98));
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
  z-index: 1;
}

.success-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 20%, rgba(0,200,131,0.15), transparent 60%),
              radial-gradient(circle at 80% 80%, rgba(168,85,247,0.15), transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.success-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem);
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  color: #00c853;
  filter: drop-shadow(0 0 20px rgba(0,200,131,0.4));
}

.success-icon svg {
  width: 100%;
  height: 100%;
}

.success-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #5ef08a;
  text-shadow: 0 0 20px rgba(0,200,131,0.4);
  margin-bottom: 1rem;
}

.success-message {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 0.5rem;
}

.success-copy {
  font-size: 1rem;
  color: #9ca3af;
  margin-bottom: 2rem;
  font-style: italic;
}

.success-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
  padding: 2rem 0;
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.success-stat {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: center;
}

.success-stat .label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9ca3af;
}

.success-stat .value {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.success-cta {
  margin: 3rem auto 0;
  max-width: 320px;
}

/* Animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes titleGlow {
  0%, 100% {
    text-shadow:
      0 0 20px rgba(168,85,247,0.45),
      0 0 40px rgba(168,85,247,0.15);
  }
  50% {
    text-shadow:
      0 0 30px rgba(168,85,247,0.65),
      0 0 50px rgba(168,85,247,0.25);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .register-header, .register-body {
    padding: 1.5rem;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .page-title { font-size: 2.5rem; }

  .submit-btn {
    font-size: 1rem;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* Utilities */
.text-accent { color: var(--accent) !important; }

/* Loading indicator for registration form */
.registering-message {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}
`;