import { useRef } from "react";
import { Link } from "react-router-dom";

import BrandLogo from "../BrandLogo";
import PageMeta from "../PageMeta";
import useCursorGlow from "../../hooks/useCursorGlow";
import useParticleCanvas from "../../hooks/useParticleCanvas";
import { DISCORD_INVITE_URL } from "../../config/siteConfig";
import { legalPageStyles } from "../../styles/legalPageStyles";

/**
 * Shared shell for Privacy and Terms pages.
 * @param {object} props
 * @param {{ title: string; description: string }} props.pageMeta
 * @param {string} props.titleBefore
 * @param {string} props.titleHighlight
 * @param {React.ReactNode} props.children
 */
export default function LegalPageLayout({
  pageMeta,
  titleBefore,
  titleHighlight,
  children,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useParticleCanvas(canvasRef, { count: 50, speed: 0.25 });
  useCursorGlow(containerRef, {
    parallaxStrength: 30,
    glowLerp: 0.12,
    trailLerp: 0.05,
  });

  return (
    <>
      <PageMeta {...pageMeta} />
      <style>{legalPageStyles}</style>

      <div className="legal-container" ref={containerRef}>
        <div className="grid-bg" aria-hidden />
        <canvas ref={canvasRef} className="bg-particles" aria-hidden />
        <div className="glow-one" aria-hidden />
        <div className="glow-two" aria-hidden />
        <div className="glow-cursor" aria-hidden />

        <div className="page-shell">
          <nav className="navbar" aria-label="Main navigation">
            <div className="nav-left">
              <Link to="/" className="logo-link">
                <BrandLogo className="logo-icon" />
                <div className="logo-text">
                  DADDY GAMING <span>LOBBY</span>
                </div>
              </Link>
              <div className="nav-links">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/tournaments">Tournaments</Link>
                <Link to="/leaderboard">Leaderboard</Link>
              </div>
            </div>
          </nav>

          <header className="legal-header">
            <p className="legal-eyebrow">DADDY GAMING LOBBY</p>
            <h1 className="legal-title">
              {titleBefore} <span>{titleHighlight}</span>
            </h1>
          </header>

          <main className="legal-body">{children}</main>

          <footer className="home-footer">
            <div className="footer-grid">
              <div className="footer-brand">
                <Link to="/" className="logo-link">
                  <BrandLogo className="logo-icon" />
                  <div className="logo-text">
                    DADDY GAMING <span>LOBBY</span>
                  </div>
                </Link>
                <p className="footer-desc">
                  The ultimate competitive gaming arena. Join tournaments, climb leaderboards,
                  and become part of the next generation of esports warriors.
                </p>
              </div>

              <div className="footer-col">
                <h3 className="footer-col-title">Navigation</h3>
                <div className="footer-links">
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/tournaments">Tournaments</Link>
                  <Link to="/leaderboard">Leaderboard</Link>
                  <Link to="/contact">Contact</Link>
                </div>
              </div>

              <div className="footer-col">
                <h3 className="footer-col-title">Community</h3>
                <div className="footer-links">
                  <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                    Discord Server
                  </a>
                  <Link to="/terms">Rules</Link>
                  <Link to="/legal">Legal</Link>
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
                <Link to="/contact">CONTACT</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
