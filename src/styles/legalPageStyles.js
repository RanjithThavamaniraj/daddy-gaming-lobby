export const legalPageStyles = `
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --purple: #a855f7;
  --purple-dim: #7c3aed;
  --purple-glow: rgba(168,85,247,0.25);
  --bg: #060608;
  --bg2: #0d0d12;
  --white: #f0f0f5;
  --muted: #9ca3af;
  --border: rgba(168,85,247,0.12);
  --ease-spring: cubic-bezier(0.34,1.56,0.64,1);
  --ease-smooth: cubic-bezier(0.22,1,0.36,1);
  --space-inline: clamp(1.25rem,5vw,4rem);
}

body { background: var(--bg); color: var(--white); font-family: 'Rajdhani', sans-serif; overflow-x: hidden; }

.legal-container {
  min-height: 100vh;
  background: var(--bg);
  position: relative;
  overflow-x: hidden;
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
  background: rgba(168,85,247,0.14); filter: blur(140px); border-radius: 50%;
  top: -180px; left: -120px; pointer-events: none;
  transform: translate(var(--parallax-x,0px),var(--parallax-y,0px));
}
.glow-two {
  position: absolute; width: 450px; height: 450px;
  background: rgba(124,58,237,0.12); filter: blur(140px); border-radius: 50%;
  bottom: -180px; right: -120px; pointer-events: none;
  transform: translate(calc(var(--parallax-x,0px)*-.6),calc(var(--parallax-y,0px)*-.6));
}
.glow-cursor {
  position: absolute; width: 320px; height: 320px;
  left: var(--glow-x,50%); top: var(--glow-y,50%);
  transform: translate(-50%,-50%);
  background: radial-gradient(circle, rgba(192,132,252,.3) 0%, rgba(168,85,247,.1) 40%, transparent 70%);
  filter: blur(50px); border-radius: 50%; pointer-events: none; z-index: 1;
  opacity: 0; transition: opacity .6s ease;
}
.legal-container.glow-active .glow-cursor { opacity: 1; }

/* ── SHELL ── */
.page-shell {
  position: relative; z-index: 5;
  max-width: 1200px; margin: 0 auto;
  padding-inline: var(--space-inline);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ── NAV ── */
.navbar {
  display: flex; align-items: center; justify-content: space-between;
  padding-block: clamp(1.5rem,3vw,2.25rem);
  border-bottom: 1px solid rgba(168,85,247,0.08);
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

/* ── LEGAL CONTENT ── */
.legal-header {
  padding-block: clamp(3rem, 6vw, 5rem) 2rem;
  text-align: center;
}
.legal-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  color: var(--purple);
  font-size: 0.9rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}
.legal-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #fff;
  text-shadow: 0 0 40px rgba(168,85,247,0.15);
}
.legal-title span {
  color: var(--purple);
  text-shadow: 0 0 30px rgba(168,85,247,0.35);
}

.legal-body {
  flex: 1;
  background: rgba(13, 13, 18, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(168, 85, 247, 0.08);
  border-radius: 16px;
  padding: clamp(1.75rem, 5vw, 3.5rem);
  margin-bottom: clamp(3rem, 8vw, 6rem);
  box-shadow: 0 24px 48px -12px rgba(0,0,0,0.5);
}

.legal-section {
  margin-bottom: 2.5rem;
}
.legal-section:last-child {
  margin-bottom: 0;
}
.legal-sec-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.legal-sec-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  color: var(--purple);
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}
.legal-text {
  color: #9ca3af;
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 1rem;
}
.legal-text strong {
  color: #fff;
}
.legal-list {
  list-style: none;
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}
.legal-list li {
  position: relative;
  color: #9ca3af;
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 0.5rem;
  padding-left: 1.25rem;
}
.legal-list li::before {
  content: '>';
  position: absolute;
  left: 0;
  color: var(--purple);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
}

/* ── FOOTER ── */
.home-footer {
  margin-top: auto;
  border-top: 1px solid rgba(168,85,247,0.08);
  padding-block: 3rem 2rem;
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 4rem;
  margin-bottom: 3rem;
}
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.footer-desc {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 360px;
}
.footer-col-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #fff;
  margin-bottom: 1.25rem;
}
.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.footer-links a {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}
.footer-links a:hover {
  color: #e9d5ff;
}
.footer-bottom {
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
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .footer-bottom {
    flex-direction: column;
    gap: 1.25rem;
    text-align: center;
  }
  .legal-body {
    padding: 1.5rem;
  }
}
`;
