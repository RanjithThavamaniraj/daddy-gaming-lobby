import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import BrandLogo from "../components/BrandLogo";
import WhatIsDgl from "../components/home/WhatIsDgl";
import HomeFeaturedGames from "../components/home/HomeFeaturedGames";
import WhyJoinDgl from "../components/home/WhyJoinDgl";
import HomeCommunityStats from "../components/home/HomeCommunityStats";
import DglJourney from "../components/home/DglJourney";
import HomeHallOfChampionsPreview from "../components/home/HomeHallOfChampionsPreview";
import JoinDiscordCta from "../components/home/JoinDiscordCta";
import {
  DISCORD_INVITE_URL,
  communityStatsIntro,
  dglJourney,
  featuredGamesIntro,
  homeCommunityStats,
  homeFeaturedGames,
  homeHallOfChampionsPreview,
  homeUpcomingTeaser,
  whatIsDglHighlights,
  whatIsDglIntro,
  whyJoinDgl,
} from "../config/homeConfig";
import { homePageStyles } from "../styles/homePageStyles";

export default function Home() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const parallaxRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.05,
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
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const centerGlow = () => {
      const rect = container.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
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
      parallaxRef.current = { x: nx * 48, y: ny * 48 };
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
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", centerGlow);
    };
  }, []);

  return (
    <>
      <style>{homePageStyles}</style>

      <div className="scanline-overlay" />

      <div className="home-container" ref={containerRef}>
        <div className="grid-bg" />
        <canvas className="bg-particles" ref={canvasRef} />
        <div className="glow-cursor-trail" />
        <div className="glow-cursor" />
        <div className="glow-one" />
        <div className="glow-two" />

        <div className="page-shell">
          <nav className="navbar">
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

          <section className="hero-section">
            <p className="hero-eyebrow">Competitive Gaming Arena</p>
            <h1 className="hero-title">
              <div className="hero-white">DOMINATE</div>
              <div className="hero-purple">THE ARENA</div>
            </h1>
            <p className="hero-text">
              Step into the ultimate competitive gaming arena. Join tournaments, climb leaderboards, squad up
              with players and become part of the next generation of esports warriors inside Daddy Gaming Lobby.
            </p>
            <div className="hero-buttons">
              <Link to="/tournaments" className="primary-btn">
                START PLAYING
              </Link>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noreferrer"
                className="secondary-btn"
              >
                DISCORD
              </a>
            </div>
          </section>

          <WhatIsDgl intro={whatIsDglIntro} highlights={whatIsDglHighlights} />
          <WhyJoinDgl features={whyJoinDgl} />
          <HomeFeaturedGames games={homeFeaturedGames} intro={featuredGamesIntro} />
          <HomeHallOfChampionsPreview tournament={homeHallOfChampionsPreview} />
          <HomeCommunityStats stats={homeCommunityStats} intro={communityStatsIntro} />
          <DglJourney journey={dglJourney} upcomingTeaser={homeUpcomingTeaser} />
          <JoinDiscordCta discordUrl={DISCORD_INVITE_URL} />

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
                  India&apos;s multi-game community esports platform. Compete in tournaments,
                  earn DGL Points, and build a permanent legacy in the Hall of Champions.
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
                  <a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">
                    Discord Server
                  </a>
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
