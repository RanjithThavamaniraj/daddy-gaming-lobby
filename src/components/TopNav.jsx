import { Link, useLocation } from "react-router-dom";

import BrandLogo from "./BrandLogo";

export default function TopNav({ children }) {
  const { pathname } = useLocation();

  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <>
      <style>{`
        .global-topnav {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: var(--dgl-nav-gap, 2rem);
          width: 100%;
          position: relative;
          z-index: 50;
          gap: 1rem;
        }
        .global-topnav-left {
          display: flex; align-items: center; gap: clamp(1.5rem, 4vw, 3rem);
        }
        .global-logo-link {
          display: flex; align-items: center; gap: 0.6rem;
          text-decoration: none;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .global-logo-link:hover { transform: scale(1.05); }
        .global-logo {
          height: clamp(26px, 2.2vw, 34px); width: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 12px rgba(168,85,247,0.3));
          transition: filter 0.3s ease;
        }
        .global-logo-text {
          font-family: 'Orbitron', sans-serif; font-size: 0.85rem; font-weight: 800;
          letter-spacing: 0.2em; color: #a855f7;
          text-shadow: 0 0 20px rgba(168,85,247,0.4); white-space: nowrap; text-transform: uppercase;
        }
        .global-logo-link:hover .global-logo { filter: drop-shadow(0 0 24px rgba(168,85,247,0.65)); }
        
        .global-nav-links {
          display: flex; align-items: center; gap: clamp(1rem, 2vw, 2rem);
        }
        .global-nav-links a {
          position: relative; text-decoration: none; color: #9ca3af;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.95rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.3rem 0; transition: color 0.3s ease;
        }
        .global-nav-links a::after {
          content: ''; position: absolute; left: 0; bottom: 0; width: 100%; height: 2px;
          background: linear-gradient(90deg, #a855f7, transparent);
          transform: scaleX(0); transform-origin: right;
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1); border-radius: 1px;
        }
        .global-nav-links a:hover { color: #fff; }
        .global-nav-links a:hover::after { transform: scaleX(1); transform-origin: left; }
        .global-nav-links a.is-active { color: #e9d5ff; }
        .global-nav-links a.is-active::after {
          transform: scaleX(1); transform-origin: left;
        }
        
        .global-topnav-right {
          display: flex; align-items: center;
        }

        @media (max-width: 1024px) {
          .global-topnav-left { gap: 1.25rem; }
          .global-nav-links { gap: 1rem; }
        }

        @media (max-width: 900px) {
          .global-topnav { flex-direction: column; gap: 1rem; align-items: flex-start; }
          .global-topnav-left { flex-direction: column; gap: 1rem; align-items: flex-start; }
          .global-nav-links { flex-wrap: wrap; }
          .global-topnav-right { width: 100%; justify-content: flex-start; }
        }
      `}</style>
      <div className="global-topnav">
        <div className="global-topnav-left">
          <Link to="/" className="global-logo-link">
            <BrandLogo className="global-logo" />
            <div className="global-logo-text">DADDY GAMING LOBBY</div>
          </Link>
          <div className="global-nav-links">
            <Link to="/dashboard" className={isActive("/dashboard") ? "is-active" : ""}>
              Dashboard
            </Link>
            <Link to="/tournaments" className={isActive("/tournaments") ? "is-active" : ""}>
              Tournaments
            </Link>
            <Link to="/leaderboard" className={isActive("/leaderboard") ? "is-active" : ""}>
              Leaderboard
            </Link>
          </div>
        </div>
        {children ? <div className="global-topnav-right">{children}</div> : null}
      </div>
    </>
  );
}
