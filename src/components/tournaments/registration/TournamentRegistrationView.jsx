import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { registerForTournament, markRegisteredForTournament, fetchTournamentRegistrations } from "../../../lib/supabase/registrations";
import TournamentRegistrationSuccess from "./TournamentRegistrationSuccess";
import { tournamentRegistrationStyles } from "../../../styles/tournamentRegistrationStyles";

const REGISTRATION_CAPACITY = 22;

/**
 * Format a registered_at timestamp for display, e.g. "Jul 4, 8:01 PM".
 * Returns null for missing/invalid dates so the caller can omit the line.
 *
 * @param {string} registeredAt
 * @returns {string | null}
 */
function formatRegisteredAt(registeredAt) {
  if (!registeredAt) return null;
  const date = new Date(registeredAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Tournament registration page for individual players.
 *
 * Collects a Name / Discord Username field as required by the mandate.
 *
 * Follows the existing Supabase architecture:
 *   - Stores in `tournament_registrations`
 *   - Uses existing RLS policies (anon INSERT on players + registrations)
 *   - Uses `registerForTournament` helper from registrations.js
 *   - Session storage prevents duplicate registrations in the same browser
 *
 * @param {object} props
 * @param {import("../lib/tournamentModel").ReturnType<import("../lib/tournamentModel").enrichTournament>} props.tournament
 */
export default function TournamentRegistrationView({ tournament }) {
  const { id, tournamentId, slug, format, matchType, prizePool, entryFee, game } = tournament;

  const [formData, setFormData] = useState({ discordUsername: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const [error, setError] = useState(null);
  const [registrations, setRegistrations] = useState(null);

  const trimmedName = formData.discordUsername.trim();
  const registrationCount = registrations === null ? null : registrations.length;
  const isFull = registrationCount !== null && registrationCount >= REGISTRATION_CAPACITY;

  const refreshRegistrations = async (tid) => {
    if (!tid) return;
    try {
      const rows = await fetchTournamentRegistrations(tid);
      setRegistrations(rows);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const tid = tournament.tournamentId;
    if (tid) {
      fetchTournamentRegistrations(tid)
        .then((rows) => {
          if (!cancelled) setRegistrations(rows);
        })
        .catch((err) => {
          console.error('Failed to fetch registrations:', err);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [tournament.tournamentId]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, discordUsername: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFull) {
      return;
    }
    if (!trimmedName) {
      setError('Please enter your name or Discord username.');
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      await registerForTournament({
        tournamentId: tournamentId || slug || id,
        discordUsername: trimmedName,
      });

      markRegisteredForTournament(tournamentId || slug || id);
      setStatus('success');
      refreshRegistrations(tournament.tournamentId);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return <TournamentRegistrationSuccess tournament={tournament} />;
  }

  const slotsRemaining = registrationCount === null
    ? null
    : Math.max(0, REGISTRATION_CAPACITY - registrationCount);
  const progressPct = registrationCount === null
    ? 0
    : Math.min(100, (registrationCount / REGISTRATION_CAPACITY) * 100);

  return (
    <>
      <style>{tournamentRegistrationStyles}</style>
      <div className="tournament-page" data-game-slug="fc-26">
        <div className="page-shell">
          <div className="page-content">
            <div className="register-card">
              <div className="register-header">
                <h1 className="page-title">REGISTER</h1>
                <div className="tournament-badge">
                  <span className="tournament-number">Tournament #{tournament.number}</span>
                </div>
                <h2 className="tournament-title">{tournament.title}</h2>
                <div className="tournament-meta">
                  <span className="game-icon fc-26" />
                  <span className="game-name">{game}</span>
                  <span className="status-badge registrations-open">Registrations Open</span>
                </div>
              </div>

              <div className="register-body">
                <div className="register-info">
                  <h3>Tournament Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Format</span>
                      <span className="value">{format}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Match Type</span>
                      <span className="value">{matchType}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Prize Pool</span>
                      <span className="value text-accent">{prizePool}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Entry</span>
                      <span className="value">{entryFee}</span>
                    </div>
                  </div>
                </div>

                {registrationCount !== null && (
                  <div className="registration-status">
                    <div className="registration-status-row">
                      <span>Registered Players: <span className="value">{registrationCount} / {REGISTRATION_CAPACITY}</span></span>
                      <span>Slots Remaining: <span className="value">{slotsRemaining}</span></span>
                    </div>
                    <div className="registration-progress">
                      <div className="registration-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                <form className="registration-form" onSubmit={handleSubmit} noValidate>
                  <h3>Register Now</h3>

                  <div className="form-group discord-group">
                    <label htmlFor="discordUsername" className="form-label">
                      Name / Discord Username <span className="required">Required</span>
                    </label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1-2.5-2.5A2.5 2.5 0 0 1 12 7a2.5 2.5 0 0 1 2.5 2.5A2.5 2.5 0 0 1 12 11.5z" />
                        </svg>
                      </div>
                      <input
                        id="discordUsername"
                        type="text"
                        className="form-control"
                        placeholder="Your name or Discord username"
                        value={formData.discordUsername}
                        onChange={handleInputChange}
                        disabled={status === 'submitting' || isFull}
                        required
                      />
                    </div>
                    <p className="form-hint">Enter your Discord username, nickname, or real name.</p>
                    <p className="form-hint" style={{ opacity: 0.7, marginTop: '4px' }}>This helps us identify you on the Daddy Gaming Lobby Discord server.</p>
                  </div>

                  {error && (
                    <div className="alert alert-error">
                      <span>⚠️ {error}</span>
                    </div>
                  )}

                  {isFull ? (
                    <div className="registration-full-notice">Registrations Full</div>
                  ) : null}

                  <button
                    type="submit"
                    className={`submit-btn ${status === 'submitting' ? 'loading' : ''}`}
                    disabled={status === 'submitting' || !trimmedName || isFull}
                  >
                    <span className="btn-text">
                      {isFull
                        ? 'Registrations Full'
                        : status === 'submitting'
                          ? 'Registering...'
                          : '✓ REGISTER NOW'}
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {registrations !== null && (
              <div className="registered-players">
                <h3>Registered Players</h3>
                {registrations.length === 0 ? (
                  <p className="registered-players-empty">No players registered yet — be the first!</p>
                ) : (
                  <ul className="registered-players-list">
                    {registrations.map((registration, index) => {
                      const formatted = formatRegisteredAt(registration.registeredAt);
                      return (
                        <li key={index} className="registered-player-item">
                          <span className="registered-player-name">✓ {registration.name}</span>
                          {formatted && (
                            <span className="registered-player-time">Registered on {formatted}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

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
