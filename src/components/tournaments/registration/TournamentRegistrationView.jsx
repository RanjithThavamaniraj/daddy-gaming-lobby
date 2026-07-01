import { Link } from "react-router-dom";
import { useState } from "react";
import { registerForTournament, markRegisteredForTournament } from "../../../lib/supabase/registrations";
import TournamentRegistrationSuccess from "./TournamentRegistrationSuccess"; 
import { tournamentRegistrationStyles } from "../../../styles/tournamentRegistrationStyles";

/**
 * Tournament registration page for individual players.
 *
 * Collects ONLY Discord username as required by the mandate.
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
  const { id, tournamentId, championshipName, slug, resultsPath, format, matchType, prizePool, entryFee, game } = tournament;

  const [formData, setFormData] = useState({ discordUsername: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, discordUsername: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.discordUsername) {
      setError('Discord username is required');
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      const { duplicate } = await registerForTournament({
        tournamentId: tournamentId || slug || id,
        discordUsername: formData.discordUsername,
      });

      markRegisteredForTournament(tournamentId || slug || id);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return <TournamentRegistrationSuccess tournament={tournament} />;
  }

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

                <form className="registration-form" onSubmit={handleSubmit} noValidate>
                  <h3>Register Now</h3>

                  <div className="form-group discord-group">
                    <label htmlFor="discordUsername" className="form-label">
                      Discord Username <span className="required">Required</span>
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
                        placeholder="Your Discord username"
                        value={formData.discordUsername}
                        onChange={handleInputChange}
                        disabled={status === 'submitting'}
                        required
                      />
                    </div>
                    <p className="form-hint">Enter your Discord username (example: ranjith_t)</p>
                    <p className="form-hint" style={{ opacity: 0.7, marginTop: '4px' }}>We'll use this to identify you on the Daddy Gaming Lobby Discord server.</p>
                  </div>

                  {error && (
                    <div className="alert alert-error">
                      <span>⚠️ {error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`submit-btn ${status === 'submitting' ? 'loading' : ''}`}
                    disabled={status === 'submitting' || !formData.discordUsername}
                  >
                    <span className="btn-text">
                      {status === 'submitting' ? 'Registering...' : '✓ REGISTER NOW'}
                    </span>
                  </button>
                </form>
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