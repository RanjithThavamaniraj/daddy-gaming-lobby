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
 * @param {boolean} [props.isReserve]
 * @param {number} [props.reserveCount]
 * @param {number} [props.reserveLimit]
 * @param {object | null} [props.registrationSummary]
 */
export default function TournamentRegistrationSuccess({
  tournament,
  capacity,
  registrationCount,
  registrantNumber,
  isReserve = false,
  reserveCount = 0,
  reserveLimit = 4,
  registrationSummary = null,
}) {
  const gameSlug = tournament.gameSlug ?? (tournament.game ? tournament.game.toLowerCase().replace(/\s+/g, "-") : "dgl");
  const accent = tournament.accent || "#a855f7";

  const hasStats = capacity != null && registrationCount != null;
  const progressPct = hasStats ? Math.min(100, (registrationCount / capacity) * 100) : 0;
  const isTeamRegistration = registrationSummary?.registrationType === "team";

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
                <h1 className="success-title">
                  {isReserve
                    ? "🟡 Reserve List Joined!"
                    : "🎉 Registration Successful!"}
                </h1>
                <p className="success-message">
                  {isReserve
                    ? "You are joining the Reserve List. Reserve players are invited if a confirmed player withdraws before the tournament begins."
                    : isTeamRegistration
                      ? `Your team "${registrationSummary?.teamName}" has been registered successfully. All 5 players are confirmed in the main roster.`
                      : "Thank you for registering. Your spot has been successfully reserved."}
                </p>
                <p className="success-copy">
                  Please stay active in the Daddy Gaming Lobby Discord server for tournament announcements,
                  match schedules, team assignments and important updates.
                </p>

                {hasStats && (
                  <div className="registration-status">
                    <div className="registration-status-row">
                      <span>
                        Main Players:{" "}
                        <span className="value">
                          {registrationCount} / {capacity}
                        </span>
                      </span>
                      <span>
                        Reserve:{" "}
                        <span className="value">
                          {reserveCount} / {reserveLimit}
                        </span>
                      </span>
                    </div>
                    <div className="registration-progress">
                      <div className="registration-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                {registrantNumber != null && !isTeamRegistration ? (
                  <p className="success-registrant">
                    {isReserve
                      ? `You are Reserve #${registrantNumber}`
                      : `You are Registrant #${registrantNumber}`}
                  </p>
                ) : null}

                {registrationSummary ? (
                  <div className="success-meta">
                    <div className="success-stat">
                      <span className="label">Registration Type</span>
                      <span className="value">
                        {isTeamRegistration ? "Full Team" : "Solo Player"}
                      </span>
                    </div>
                    {isTeamRegistration ? (
                      <div className="success-stat">
                        <span className="label">Team Name</span>
                        <span className="value">{registrationSummary.teamName}</span>
                      </div>
                    ) : (
                      <div className="success-stat">
                        <span className="label">Player</span>
                        <span className="value">
                          {registrationSummary.playerName}
                        </span>
                      </div>
                    )}
                    <div className="success-stat">
                      <span className="label">Roster Status</span>
                      <span className="value">
                        {isReserve ? "Reserve" : "Main"}
                      </span>
                    </div>
                    {isTeamRegistration ? (
                      <div className="success-stat">
                        <span className="label">Players Registered</span>
                        <span className="value">
                          {registrationSummary.playerCount ?? 5}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : null}

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
