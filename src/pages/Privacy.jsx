import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Privacy() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const parallaxRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const canvasRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.35 + 0.05,
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

  // Mouse glow effect
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
      parallaxRef.current = { x: nx * 30, y: ny * 30 };
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
      `}</style>

      <div className="legal-container" ref={containerRef}>
        <div className="grid-bg" />
        <canvas ref={canvasRef} className="bg-particles" />
        <div className="glow-one" />
        <div className="glow-two" />
        <div className="glow-cursor" />

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

          {/* TITLE HEADER */}
          <header className="legal-header">
            <p className="legal-eyebrow">DADDY GAMING LOBBY</p>
            <h1 className="legal-title">PRIVACY <span>POLICY</span></h1>
          </header>

          {/* MAIN LEGAL BODY */}
          <main className="legal-body">
            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">01</span> Introduction
              </h2>
              <p className="legal-text">
                Welcome to Daddy Gaming Lobby. We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you interact with our gaming platform, tournaments, leaderboards, and Discord integrations.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">02</span> Information We Collect
              </h2>
              <p className="legal-text">
                To provide our matchmaking, tournament brackets, and leaderboard services, we may collect the following data types:
              </p>
              <ul className="legal-list">
                <li><strong>Connected Accounts:</strong> Discord account information (usernames, IDs, avatars) when you link with our platform.</li>
                <li><strong>Gaming Profiles & Statistics:</strong> In-game names, public game IDs, match history, win rates, and ranking statistics.</li>
                <li><strong>Usage & Device Data:</strong> IP address, device specifications, browser type, and navigation logs collected through cookies and local storage.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">03</span> How We Use Your Data
              </h2>
              <p className="legal-text">
                Your data is processed to deliver a premium competitive gaming experience:
              </p>
              <ul className="legal-list">
                <li>Creating and managing tournament brackets and player registrations.</li>
                <li>Calculating leaderboard ranks and verifying match outcomes.</li>
                <li>Preventing hacking, cheating, toxicity, and other violations of fair play.</li>
                <li>Communicating tournament updates, schedule changes, and community announcements via Discord.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">04</span> Data Sharing & Integrity
              </h2>
              <p className="legal-text">
                We believe in keeping your personal details secure. <strong>We do not sell your personal data.</strong> Public tournament standings, match statistics, and leaderboard rankings are displayed publicly on the platform to maintain competitive transparency. Other community members may see your linked Discord username and public gaming IDs.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">05</span> Data Security
              </h2>
              <p className="legal-text">
                We implement robust security measures to prevent unauthorized access, alteration, or exposure of your data. However, please remember that no transmission method over the Internet is 100% secure. You are responsible for maintaining the confidentiality of your connected accounts.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">06</span> Your Choices & Rights
              </h2>
              <p className="legal-text">
                You have control over your data. Depending on your location, you can request access to, correction of, or deletion of the data we hold. To unlink your Discord profile or request account removal, please reach out to our administration team on our Discord Server.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">07</span> Policy Updates
              </h2>
              <p className="legal-text">
                We may revise this Privacy Policy periodically to reflect shifts in our platform or regulatory requirements. Any adjustments will be indicated by an updated date at the bottom of this page.
              </p>
              <p className="legal-text" style={{ fontStyle: "italic", fontSize: "0.95rem", marginTop: "1rem" }}>
                Last updated: May 24, 2026
              </p>
            </div>
          </main>

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
