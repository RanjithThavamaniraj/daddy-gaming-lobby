import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TopNav from "../components/TopNav";
import { supabase } from "../supabase";
import { activeTournamentFallback, pastChampions } from "../config/tournamentConfig";
import { Calendar, Clock, Trophy, Users, X, Check, AlertCircle } from "lucide-react";

function GameIcon({ slug }) {
  const icons = {
    "arc-raiders": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 4L28 26H4L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="16" cy="18" r="3" fill="currentColor" />
      </svg>
    ),
    "apex-legends": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 6L26 26H6L16 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 22h12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "marvel-rivals": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="11" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
        <circle cx="21" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    valorant: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M8 26L16 6l8 20H8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    cs2: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="6" y="12" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M10 12V9a6 6 0 0112 0v3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    lol: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M10 8h12v16H10V8z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "dota-2": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M6 16c0-6 4.5-10 10-10s10 4 10 10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "fc-26": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "the-finals": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M8 22V10l8-4 8 4v12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "rocket-league": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 12l8 8M20 12l-8 8" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    f1: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M6 10h20v4H6v-4zm0 8h12v4H6v-4z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  };
  return icons[slug] ?? icons.valorant;
}

const staticSchedule = [
  {
    id: "arc-raiders",
    game: "Arc Raiders",
    slug: "arc-raiders",
    mode: "Extraction Cup",
    players: "18/24 Players",
    time: "Today • 7:00 PM",
    accent: "#ff6b4a",
  },
  {
    id: "apex-legends",
    game: "Apex Legends",
    slug: "apex-legends",
    mode: "Ranked Clash",
    players: "42/60 Players",
    time: "Today • 8:30 PM",
    accent: "#da2f3d",
  },
  {
    id: "marvel-rivals",
    game: "Marvel Rivals",
    slug: "marvel-rivals",
    mode: "Global Scrims",
    players: "16/20 Players",
    time: "Tomorrow • 6:00 PM",
    accent: "#f5c518",
  },
  {
    id: "cs2",
    game: "CS2",
    slug: "cs2",
    mode: "Tactical Showdown",
    players: "12/16 Teams",
    time: "Today • 10:00 PM",
    accent: "#de9b35",
  },
  {
    id: "lol",
    game: "League of Legends",
    slug: "lol",
    mode: "Nexus Wars",
    players: "20/24 Players",
    time: "Tomorrow • 5:00 PM",
    accent: "#c89b3c",
  },
  {
    id: "dota-2",
    game: "Dota 2",
    slug: "dota-2",
    mode: "Ancient Clash",
    players: "10/10 Teams",
    time: "Tonight • 11:00 PM",
    accent: "#c23c2a",
  },
  {
    id: "fc-26",
    game: "FC 26",
    slug: "fc-26",
    mode: "Ultimate League",
    players: "24/32 Players",
    time: "Tomorrow • 8:00 PM",
    accent: "#00c853",
  },
  {
    id: "the-finals",
    game: "The Finals",
    slug: "the-finals",
    mode: "Cashout Chaos",
    players: "14/18 Teams",
    time: "Today • 9:30 PM",
    accent: "#00d4ff",
  },
];

const valorantRanks = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Ascendant",
  "Immortal",
  "Radiant"
];

export default function Tournaments() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Tournament and registration state
  const [tournament, setTournament] = useState(activeTournamentFallback);
  const [registrations, setRegistrations] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Registration Form State
  const [form, setForm] = useState({ discordName: "", valorantIgn: "", rank: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const getRegistrationStatusMessage = (count, limit) => {
    if (count === 0) {
      return `Need ${limit} to Start`;
    } else if (count > 0 && count < limit) {
      const remaining = limit - count;
      return `Need ${remaining} ${remaining === 1 ? 'More Player' : 'More Players'}`;
    } else if (count === limit) {
      return "Tournament Ready";
    } else {
      return "Registration Full";
    }
  };

  const getRegistrationStatusClass = (count, limit) => {
    if (count < limit) {
      return "counter-status-text status-need-more";
    } else if (count === limit) {
      return "counter-status-text status-ready";
    } else {
      return "counter-status-text status-full";
    }
  };

  const fetchTournamentData = async () => {
    try {
      // Use local configuration for active tournament details
      setTournament(activeTournamentFallback);

      // Fetch registrations from Supabase
      try {
        const { data: regs, error: regsError } = await supabase
          .from("registrations")
          .select("id, discord_name, rank, created_at")
          .order("created_at", { ascending: false });

        if (regsError) {
          console.error("Error querying registrations:", regsError);
        } else if (regs) {
          setRegistrations(regs);
        }
      } catch (err) {
        console.warn("Could not load registrations list from Supabase.", err);
      }
    } catch (error) {
      console.error("Failed to compile tournament details:", error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentData();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || pageLoading) return;

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
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        container.classList.add("glow-active");
      }
    };

    let rafId;
    const animate = () => {
      const lerp = (c, t, f) => c + (t - c) * f;
      glowRef.current.x = lerp(glowRef.current.x, mouseRef.current.x, 0.1);
      glowRef.current.y = lerp(glowRef.current.y, mouseRef.current.y, 0.1);
      trailRef.current.x = lerp(trailRef.current.x, mouseRef.current.x, 0.04);
      trailRef.current.y = lerp(trailRef.current.y, mouseRef.current.y, 0.04);
      container.style.setProperty("--glow-x", `${glowRef.current.x}px`);
      container.style.setProperty("--glow-y", `${glowRef.current.y}px`);
      container.style.setProperty("--glow-trail-x", `${trailRef.current.x}px`);
      container.style.setProperty("--glow-trail-y", `${trailRef.current.y}px`);
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
  }, [pageLoading]);

  // Handle Form Registration Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!form.discordName || !form.valorantIgn || !form.rank) {
      setFormError("All fields are required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const { error } = await supabase
        .from("registrations")
        .insert([
          {
            discord_name: form.discordName.trim(),
            valorant_ign: form.valorantIgn.trim(),
            rank: form.rank
          }
        ]);

      if (error) {
        if (error.code === "23505") {
          throw new Error("This Discord name is already registered for this tournament.");
        }
        throw error;
      }

      setFormSuccess(true);
      
      // Reload updated player details
      await fetchTournamentData();

      // Reset form and close modal
      setForm({ discordName: "", valorantIgn: "", rank: "" });
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess(false);
      }, 1800);
    } catch (err) {
      console.error(err);
      setFormError(err.message || "An error occurred. Check your network or connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRankClass = (rank) => {
    return `player-rank-badge rank-${rank.toLowerCase()}`;
  };

  if (pageLoading) {
    return (
      <div className="tournaments-page">
        <style>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            gap: 1.5rem;
            background: #060608;
            color: white;
            font-family: 'Rajdhani', Arial, sans-serif;
          }
          .cyber-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(168,85,247,0.1);
            border-top-color: #a855f7;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          .loading-text {
            font-family: 'Orbitron', sans-serif;
            font-size: 1rem;
            color: #a855f7;
            letter-spacing: 0.1em;
            font-weight: 700;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-container">
          <div className="cyber-spinner"></div>
          <p className="loading-text">ESTABLISHING SECURE LOBBY LINK...</p>
        </div>
      </div>
    );
  }

  const isFull = registrations.length >= tournament.registrationLimit;
  const isRegistrationOpen = tournament.status === "Registration Open";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Rajdhani:wght@500;600;700&display=swap');

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
          padding: clamp(1.25rem, 3vw, 2.5rem) clamp(1.25rem, 4vw, 3.5rem);
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
          max-width: 1280px;
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
          margin-bottom: 2.5rem;
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
          gap: 4rem;
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

        /* Hero Card Cyberpunk */
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
          padding: clamp(1.5rem, 4vw, 3.5rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(1.5rem, 5vw, 4rem);
          overflow: hidden;
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

        /* Status Badge Styling */
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
        
        .status-badge-custom.registration-open {
          background: rgba(16,185,129,0.15);
          border: 1px solid #10b981;
          color: #34d399;
        }
        .status-badge-custom.registration-open::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: #10b981; box-shadow: 0 0 8px #10b981;
          animation: pulseGreen 1.5s infinite;
        }
        
        .status-badge-custom.registration-closed,
        .status-badge-custom.teams-finalized {
          background: rgba(245,158,11,0.15);
          border: 1px solid #f59e0b;
          color: #fbbf24;
        }
        
        .status-badge-custom.live {
          background: rgba(239,68,68,0.15);
          border: 1px solid #ef4444;
          color: #f87171;
        }
        .status-badge-custom.live::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: #ef4444; box-shadow: 0 0 8px #ef4444;
          animation: pulseRed 1.5s infinite;
        }
        
        .status-badge-custom.completed {
          background: rgba(107,114,128,0.15);
          border: 1px solid #6b7280;
          color: #d1d5db;
        }

        @keyframes pulseGreen {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes pulseRed {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Stats Grid */
        .hero-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
        }
        
        @media (min-width: 640px) {
          .hero-stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
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

        /* Progress Bar */
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
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #d1d5db;
        }

        .counter-status-text {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-left: 0.5rem;
          text-transform: uppercase;
        }
        .counter-status-text.status-need-more {
          color: #a855f7;
          text-shadow: 0 0 8px rgba(168,85,247,0.35);
        }
        .counter-status-text.status-ready {
          color: #10b981;
          text-shadow: 0 0 8px rgba(16,185,129,0.35);
        }
        .counter-status-text.status-full {
          color: #f59e0b;
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
        
        .date-item strong {
          color: #fff;
        }

        .hero-action-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 220px;
          z-index: 2;
        }

        /* Cyber Button */
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

        /* Registered Players Section */
        .players-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        
        @media (min-width: 640px) {
          .players-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          .players-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .player-card {
          background: rgba(10,10,14,0.7);
          border: 1px solid rgba(168,85,247,0.15);
          border-radius: 4px;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color 0.3s ease, background-color 0.3s ease;
        }
        
        .player-card:hover {
          border-color: rgba(168,85,247,0.4);
          background-color: rgba(168,85,247,0.03);
        }
        
        .player-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .player-index {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem;
          color: #a855f7;
          background: rgba(168,85,247,0.1);
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          border: 1px solid rgba(168,85,247,0.2);
        }
        
        .player-name {
          font-weight: 700;
          font-size: 1.1rem;
          color: #fff;
        }
        
        .player-rank-badge {
          background: rgba(255,255,255,0.05);
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .rank-radiant { color: #f5d061; border-color: rgba(245,208,97,0.3); background: rgba(245,208,97,0.05); }
        .rank-immortal { color: #c23c2a; border-color: rgba(194,60,42,0.3); background: rgba(194,60,42,0.05); }
        .rank-ascendant { color: #00c853; border-color: rgba(0,200,83,0.3); background: rgba(0,200,83,0.05); }
        .rank-diamond { color: #b388ff; border-color: rgba(179,136,255,0.3); background: rgba(179,136,255,0.05); }
        .rank-platinum { color: #00e5ff; border-color: rgba(0,229,255,0.3); background: rgba(0,229,255,0.05); }
        .rank-gold { color: #ffd600; border-color: rgba(255,214,0,0.3); background: rgba(255,214,0,0.05); }
        .rank-silver { color: #cfd8dc; border-color: rgba(207,216,220,0.3); background: rgba(207,216,220,0.05); }
        .rank-bronze { color: #a1887f; border-color: rgba(161,136,127,0.3); background: rgba(161,136,127,0.05); }
        .rank-iron { color: #90a4ae; border-color: rgba(144,164,174,0.3); background: rgba(144,164,174,0.05); }

        .no-players {
          background: rgba(10,10,14,0.5);
          border: 1px dashed rgba(255,255,255,0.1);
          padding: 2.5rem;
          text-align: center;
          color: #9ca3af;
          border-radius: 4px;
          font-weight: 600;
          font-size: 1.1rem;
        }

        /* DGL Hall of Champions */
        .champions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .champions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .champions-card {
          position: relative;
          padding: 1px;
          border-radius: 6px;
          background: linear-gradient(135deg, rgba(168,85,247,0.2), transparent);
          overflow: hidden;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        
        .champions-card:hover {
          transform: translateY(-4px);
          background: linear-gradient(135deg, #a855f7, transparent);
        }
        
        .champions-card-inner {
          background: rgba(10,10,14,0.95);
          padding: 1.75rem;
          border-radius: 5px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .champions-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .champions-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .champions-date {
          font-size: 0.85rem;
          color: #9ca3af;
          font-weight: 700;
        }
        
        .champions-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 1rem;
        }
        
        .champions-stat-box {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        
        .champions-stat-label {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .champions-stat-value {
          font-size: 1.05rem;
          font-weight: 700;
          color: #a855f7;
        }

        /* Premium Modal Design */
        .cyber-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(4,4,6,0.85);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        
        .cyber-modal {
          position: relative;
          width: 100%;
          max-width: 500px;
          padding: 2px;
          background: linear-gradient(135deg, var(--accent), rgba(255,255,255,0.05));
          clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
          animation: modalAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        
        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .cyber-modal-inner {
          background: linear-gradient(135deg, #0b0b0f, #140b24);
          clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
          padding: 2.5rem;
          position: relative;
        }
        
        .cyber-modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          transition: color 0.2s ease, transform 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cyber-modal-close:hover {
          color: var(--accent);
          transform: rotate(90deg);
        }
        
        .cyber-modal-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 50%, transparent);
        }
        
        .cyber-modal-subtitle {
          color: #9ca3af;
          font-size: 0.95rem;
          margin-bottom: 2rem;
          font-weight: 600;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .form-label {
          font-size: 0.85rem;
          color: #e5e7eb;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        
        .form-input {
          background: rgba(10,10,14,0.8);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        
        .form-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 30%, transparent);
        }
        
        .form-select {
          background: rgba(10,10,14,0.8);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s ease;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2724%27%20height%3D%2724%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%239ca3af%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1em;
        }
        
        .form-select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 30%, transparent);
        }
        
        .form-select option {
          background: #0b0b0f;
          color: #fff;
        }
        
        .form-error {
          background: rgba(220,38,38,0.1);
          border: 1px solid #dc2626;
          color: #f87171;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .form-success-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1rem;
        }
        
        .success-icon-container {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(16,185,129,0.1);
          border: 2px solid #10b981;
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 0 20px rgba(16,185,129,0.3);
        }
        
        .success-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }
        
        .success-subtitle {
          color: #9ca3af;
          font-weight: 600;
        }

        /* Match Schedule List */
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .schedule-row {
          position: relative;
          padding: 1px;
          border-radius: 4px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05), transparent);
          overflow: hidden;
          animation: fadeUp 0.6s ease both;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .schedule-row:hover {
          transform: translateX(8px);
          background: linear-gradient(90deg, var(--accent), transparent);
        }

        .row-inner {
          background: rgba(10,10,14,0.9);
          padding: 1.25rem 2rem;
          border-radius: 4px;
          display: grid;
          grid-template-columns: auto 1.5fr 1fr 1fr auto;
          align-items: center;
          gap: 2rem;
          position: relative;
          z-index: 2;
        }

        .row-icon {
          width: 40px;
          height: 40px;
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .row-icon svg {
          width: 24px;
          height: 24px;
        }

        .row-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .row-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #e5e7eb;
          margin: 0;
          transition: color 0.2s ease;
        }

        .row-mode {
          color: #a855f7;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .schedule-row:hover .row-title {
          color: #fff;
          animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }

        @keyframes glitch {
          0% { transform: translate(0); text-shadow: none; }
          20% { transform: translate(-2px, 1px); text-shadow: 2px 0 var(--accent), -2px 0 #00d4ff; }
          40% { transform: translate(-1px, -1px); text-shadow: -2px 0 var(--accent), 2px 0 #00d4ff; }
          60% { transform: translate(2px, 1px); text-shadow: 2px 0 var(--accent), -1px 0 #00d4ff; }
          80% { transform: translate(1px, -1px); text-shadow: -1px 0 var(--accent), 2px 0 #00d4ff; }
          100% { transform: translate(0); text-shadow: 0 0 8px var(--accent); }
        }

        .row-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .row-time {
          color: #e5e7eb;
          font-weight: 700;
          font-size: 1rem;
        }

        .row-players {
          color: #9ca3af;
          font-size: 0.85rem;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .row-inner {
            grid-template-columns: auto 1fr 1fr auto;
            gap: 1.5rem;
          }
          .row-meta {
            align-items: flex-end;
          }
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
          .cyber-btn.primary, .cyber-btn.disabled {
            width: 100%;
          }
          .row-inner {
            grid-template-columns: 1fr;
            padding: 1.5rem;
            gap: 1rem;
          }
          .row-icon { display: none; }
          .row-meta { align-items: flex-start; }
          .cyber-btn.outline { width: 100%; text-align: center; }
        }
      `}</style>

      <div className="tournaments-page" ref={containerRef}>
        <div className="grid-bg" />
        <div className="glow-cursor-trail" />
        <div className="glow-cursor" />
        <div className="glow-1" />
        <div className="glow-2" />

        <div className="content">
          <TopNav />

          <h1 className="page-title">Titan Grindhouse</h1>

          <div className="layout-grid">
            {/* Featured Tournament Card */}
            <section className="featured-section">
              <h2 className="section-heading">Main Event</h2>
              <div className="hero-card" style={{ "--accent": tournament.accent }}>
                <div className="hero-scanlines"></div>
                <div className="hero-inner">
                  <div className="hero-details-container">
                    <div className="hero-content">
                      <div className="hero-icon">
                        <GameIcon slug={tournament.game.toLowerCase().replace(" ", "-")} />
                      </div>
                      <div className="hero-details">
                        <h3 className="hero-title">{tournament.title}</h3>
                        <div className="hero-badges">
                          <span className={`status-badge-custom ${tournament.status.toLowerCase().replace(" ", "-")}`}>
                            {tournament.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hero-stats-grid">
                      <div className="hero-stat-box">
                        <span className="stat-label">GAME</span>
                        <span className="stat-value">{tournament.game}</span>
                      </div>
                      <div className="hero-stat-box">
                        <span className="stat-label">FORMAT</span>
                        <span className="stat-value">{tournament.format}</span>
                      </div>
                      <div className="hero-stat-box">
                        <span className="stat-label">MATCH TYPE</span>
                        <span className="stat-value">{tournament.matchType}</span>
                      </div>
                      <div className="hero-stat-box">
                        <span className="stat-label">PRIZE POOL</span>
                        <span className="stat-value text-accent">{tournament.prizePool}</span>
                      </div>
                    </div>

                    <div className="registration-progress-container">
                      <div className="progress-text-row">
                        <span>
                          REGISTERED PLAYERS: <strong>{registrations.length} / {tournament.registrationLimit}</strong>
                          <span className={getRegistrationStatusClass(registrations.length, tournament.registrationLimit)}>
                            {" "}({getRegistrationStatusMessage(registrations.length, tournament.registrationLimit)})
                          </span>
                        </span>
                        <span>{Math.max(0, tournament.registrationLimit - registrations.length)} SLOTS REMAINING</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${Math.min(100, (registrations.length / tournament.registrationLimit) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="dates-info-row">
                      <div className="date-item">
                        <Calendar size={16} className="text-accent" />
                        <span>Deadline: <strong>{tournament.registrationDeadline}</strong></span>
                      </div>
                      <div className="date-item">
                        <Clock size={16} className="text-accent" />
                        <span>Starts: <strong>{tournament.tournamentDate}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="hero-action-container">
                    {isRegistrationOpen && !isFull ? (
                      <button 
                        className="cyber-btn primary"
                        onClick={() => {
                          setFormError("");
                          setFormSuccess(false);
                          setShowModal(true);
                        }}
                      >
                        <span>REGISTER NOW</span>
                      </button>
                    ) : (
                      <button className="cyber-btn disabled" disabled>
                        <span>
                          {isFull 
                            ? "TOURNAMENT FULL" 
                            : tournament.status.toUpperCase()
                          }
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Registered Players Section */}
            <section className="registered-players-section">
              <h2 className="section-heading">Registered Players</h2>
              {registrations.length > 0 ? (
                <div className="players-grid">
                  {registrations.map((player, idx) => (
                    <div className="player-card" key={player.id || idx}>
                      <div className="player-info">
                        <span className="player-index">#{registrations.length - idx}</span>
                        <span className="player-name">{player.discord_name}</span>
                      </div>
                      <span className={getRankClass(player.rank)}>{player.rank}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-players">
                  NO AGENTS REGISTERED YET. BE THE FIRST TO CLASH!
                </div>
              )}
            </section>

            {/* Match Schedule */}
            <section className="schedule-section">
              <h2 className="section-heading">Match Schedule</h2>
              <div className="schedule-list">
                {staticSchedule.map((t, index) => (
                  <div 
                    className="schedule-row" 
                    key={t.id} 
                    style={{ "--accent": t.accent, animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="row-inner">
                      <div className="row-icon"><GameIcon slug={t.slug} /></div>
                      <div className="row-info">
                        <h4 className="row-title">{t.game}</h4>
                        <span className="row-mode">{t.mode}</span>
                      </div>
                      <div className="row-meta">
                        <span className="row-time">{t.time}</span>
                        <span className="row-players">{t.players}</span>
                      </div>
                      <button className="cyber-btn outline">JOIN</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* DGL Hall of Champions */}
            <section className="champions-section">
              <h2 className="section-heading">DGL Hall of Champions</h2>
              <div className="champions-grid">
                {pastChampions.map((c) => (
                  <div className="champions-card" key={c.id}>
                    <div className="champions-card-inner">
                      <div className="champions-header">
                        <h4 className="champions-title">{c.tournamentName}</h4>
                        <span className="champions-date">{c.date}</span>
                      </div>
                      <div className="champions-stats">
                        <div className="champions-stat-box">
                          <span className="champions-stat-label">WINNING TEAM</span>
                          <span className="champions-stat-value">{c.winningTeam}</span>
                        </div>
                        <div className="champions-stat-box">
                          <span className="champions-stat-label">PRIZE POOL</span>
                          <span className="champions-stat-value text-accent">{c.prizePool}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Premium Registration Modal */}
      {showModal && (
        <div 
          className="cyber-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="cyber-modal" style={{ "--accent": tournament.accent }}>
            <div className="hero-scanlines"></div>
            <div className="cyber-modal-inner">
              <button 
                className="cyber-modal-close" 
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>

              {!formSuccess ? (
                <form onSubmit={handleRegisterSubmit}>
                  <h3 className="cyber-modal-title">SECURE REGISTRATION</h3>
                  <p className="cyber-modal-subtitle">DGL LOBBY LINK INITIATION PANEL</p>

                  {formError && (
                    <div className="form-error">
                      <AlertCircle size={16} />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Discord Username *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      placeholder="e.g. shadow_agent#1337"
                      value={form.discordName}
                      onChange={(e) => setForm({ ...form, discordName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Valorant IGN *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      placeholder="e.g. NeonClash#NA1"
                      value={form.valorantIgn}
                      onChange={(e) => setForm({ ...form, valorantIgn: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Rank *</label>
                    <select 
                      className="form-select" 
                      required 
                      value={form.rank}
                      onChange={(e) => setForm({ ...form, rank: e.target.value })}
                    >
                      <option value="" disabled>SELECT YOUR RANK</option>
                      {valorantRanks.map((r) => (
                        <option key={r} value={r}>{r.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="cyber-btn primary"
                    style={{ width: "100%", marginTop: "1rem" }}
                    disabled={submitting}
                  >
                    <span>{submitting ? "REGISTERING..." : "CONFIRM REGISTRATION"}</span>
                  </button>
                </form>
              ) : (
                <div className="form-success-overlay">
                  <div className="success-icon-container">
                    <Check size={32} />
                  </div>
                  <h3 className="success-title">SECURELY REGISTERED</h3>
                  <p className="success-subtitle">YOUR PROFILE HAS BEEN ADDED TO THE LOBBY.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
