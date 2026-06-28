import { Link } from "react-router-dom";

import PageMeta from "../components/PageMeta";
import TopNav from "../components/TopNav";
import { PAGE_META } from "../config/siteConfig";
import { dglLayoutTokens } from "../styles/dglLayoutTokens";

export default function NotFound() {
  return (
    <>
      <PageMeta {...PAGE_META.notFound} />
      <style>{`
        ${dglLayoutTokens}
        body { background: #060608; color: white; font-family: 'Rajdhani', Arial, sans-serif; }

        .not-found-page {
          min-height: 100vh;
          background: #060608;
          position: relative;
          overflow: hidden;
          padding: var(--dgl-page-gutter-y) var(--dgl-page-gutter-x);
        }

        .grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(168,85,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.3; pointer-events: none;
        }

        .not-found-shell {
          position: relative; z-index: 5;
          max-width: var(--dgl-content-max);
          margin: 0 auto;
        }

        .not-found-card {
          margin-top: 3rem;
          text-align: center;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(168,85,247,0.2);
          border-radius: 24px;
          padding: clamp(2.5rem, 6vw, 4rem) 2rem;
        }

        .not-found-code {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(3rem, 10vw, 5rem);
          font-weight: 900;
          color: #a855f7;
          text-shadow: 0 0 24px rgba(168,85,247,0.4);
          margin-bottom: 1rem;
        }

        .not-found-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1.25rem, 4vw, 1.75rem);
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #e9d5ff;
          margin-bottom: 1rem;
        }

        .not-found-text {
          color: #9ca3af;
          font-size: 1.05rem;
          line-height: 1.7;
          max-width: 28rem;
          margin: 0 auto 2rem;
        }

        .not-found-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
        }

        .not-found-link {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          color: #c084fc;
          padding: 0.85rem 1.5rem;
          border: 1px solid rgba(168,85,247,0.35);
          border-radius: 999px;
          transition: color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
        }

        .not-found-link:hover {
          color: #fff;
          border-color: rgba(168,85,247,0.6);
          transform: translateY(-2px);
        }

        .not-found-link.primary {
          background: linear-gradient(135deg, #c084fc 0%, #9333ea 100%);
          border-color: transparent;
          color: #fff;
        }
      `}</style>

      <div className="not-found-page">
        <div className="grid-bg" aria-hidden />
        <div className="not-found-shell">
          <TopNav />
          <main className="not-found-card">
            <p className="not-found-code" aria-hidden>
              404
            </p>
            <h1 className="not-found-title">Page Not Found</h1>
            <p className="not-found-text">
              The page you requested does not exist or may have been moved.
            </p>
            <div className="not-found-actions">
              <Link to="/" className="not-found-link primary">
                Back to Home
              </Link>
              <Link to="/tournaments" className="not-found-link">
                Tournaments
              </Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
