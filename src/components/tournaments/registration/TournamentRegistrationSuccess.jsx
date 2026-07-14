import { Link } from "react-router-dom";
import { tournamentRegistrationStyles } from "../../../styles/tournamentRegistrationStyles";
import { DISCORD_INVITE_URL } from "../../../config/siteConfig";

/**
 * Success state after a tournament registration.
 *
 * Displayed when the form submission is complete, and replaces the form
 * with premium copy as per the mandate.
 *
 * Rendered from TournamentRegistrationView after a successful submit.
 *
 * @param {object} props
 * @param {import("../lib/tournamentModel").ReturnType<import("../lib/tournamentModel").enrichTournament>} props.tournament
 * @param {number} [props.capacity]
 * @param {number|null} [props.registrationCount]
 * @param {number|null} [props.registrantNumber]
 */
export default function TournamentRegistrationSuccess({ tournament, capacity, registrationCount, registrantNumber }) {
  const gameSlug = tournament.gameSlug ?? (tournament.game ? tournament.game.toLowerCase().replace(/\s+/g, "-") : "dgl");
  const accent = tournament.accent || "#a855f7";

  const hasStats = capacity != null && registrationCount != null;
  const slotsRemaining = hasStats ? Math.max(0, capacity - registrationCount) : null;
  const progressPct = hasStats ? Math.min(100, (registrationCount / capacity) * 100) : 0;

  return (
    <>
      <style>{tournamentRegistrationStyles}</style>
      <div
        className="tournament-page success-page"
        data-game-slug={gameSlug}
        style={{ "--accent": accent }}
      >
        <div className="page-shell">
          <div className="page-content">
            <div className="register-card success-card">
              <div className="success-content">
                <div className="success-icon">
                  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M16 12 L20 28 L36 16 M24 44 C12.954 44 4 35.046 4 24 C4 12.954 12.954 4 24 4 C35.046 4 44 12.954 44 24 C44 35.046 35.046 44 24 44 Z" />
                  </svg>
                </div>
                <h1 className="success-title">🎉 Registration Successful!</h1>
                <p className="success-message">Thank you for registering. Your spot has been successfully reserved.</p>
                <p className="success-copy">
                  Please stay active in the Daddy Gaming Lobby Discord server for tournament announcements,
                  match schedules, team assignments and important updates.
                </p>

                {hasStats && (
                  <div className="registration-status">
                    <div className="registration-status-row">
                      <span>Players Registered: <span className="value">{registrationCount} / {capacity}</span></span>
                      <span>Remaining Slots: <span className="value">{slotsRemaining}</span></span>
                    </div>
                    <div className="registration-progress">
                      <div className="registration-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                {registrantNumber != null && (
                  <p className="success-registrant">You are Registrant #{registrantNumber}</p>
                )}

                <div className="success-meta">
                  <div className="success-stat">
                    <span className="label">Tournament</span>
                    <span className="value">#{tournament.number}</span>
                  </div>
                  <div className="success-stat">
                    <span className="label">Game</span>
                    <span className="value">{tournament.game}</span>
                  </div>
                  <div className="success-stat">
                    <span className="label">Format</span>
                    <span className="value">{tournament.format}</span>
                  </div>
                  <div className="success-stat">
                    <span className="label">Status</span>
                    <span className="value status-badge registrations-open">Registered</span>
                  </div>
                </div>

                <div className="success-actions">
                  <a
                    href={DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="submit-btn outline"
                  >
                    <span className="btn-text">Join Discord</span>
                  </a>
                  <button
                    type="button"
                    className="submit-btn"
                    onClick={() => (window.location.href = '/tournaments')}
                  >
                    <span className="btn-text">Close</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="back-link">
              <Link to="/tournaments" className="back-btn">
                ← Back to Tournaments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
