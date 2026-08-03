import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { registerForTournament, markRegisteredForTournament, fetchTournamentRegistrations } from "../../../lib/supabase/registrations";
import TournamentRegistrationSuccess from "./TournamentRegistrationSuccess";
import { tournamentRegistrationStyles } from "../../../styles/tournamentRegistrationStyles";
import { isSaturdayShowdown } from "../../../config/eventTypeConfig";

const DEFAULT_REGISTRATION_CAPACITY = 22;

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
 * Collects a Discord Username field as required by the mandate.
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
  const {
    id,
    tournamentId,
    slug,
    format,
    matchType,
    prizePool,
    entryFee,
    game,
    gameSlug,
    accent,
    registrationLimit,
    eventType,
    teamLimit,
    matchDuration,
    overtimeRule,
  } = tournament;

  const capacity = registrationLimit ?? DEFAULT_REGISTRATION_CAPACITY;
  const tsGameSlug = gameSlug ?? (game ? game.toLowerCase().replace(/\s+/g, "-") : "dgl");
  const tsAccent = accent || "#a855f7";
  const isShowdown = isSaturdayShowdown(eventType);
  const isRocketLeague = tsGameSlug === "rocket-league";

  const [formData, setFormData] = useState({
    discordUsername: "",
    epicId: "",
    rocketLeagueRank: "",
    registrationMode: "team", // 'team' | 'solo' — only relevant for Rocket League
    teammateDisplayName: "",
    teamName: "",
  });
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const [error, setError] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [lastRegistrantNumber, setLastRegistrantNumber] = useState(null);

  const trimmedName = formData.discordUsername.trim();
  const trimmedEpicId = formData.epicId.trim();
  const trimmedTeammateName = formData.teammateDisplayName.trim();
  const isTeamMode = formData.registrationMode === "team";

  const registrationCount = registrations === null ? null : registrations.length;
  const isFull = registrationCount !== null && registrationCount >= capacity;

  const rocketLeagueFieldsValid =
    !isRocketLeague ||
    (Boolean(trimmedEpicId) &&
      Boolean(formData.rocketLeagueRank) &&
      (!isTeamMode || Boolean(trimmedTeammateName)));

  const refreshRegistrations = async (tid) => {
    if (!tid) return null;
    try {
      const rows = await fetchTournamentRegistrations(tid);
      setRegistrations(rows);
      return rows;
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
      return null;
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

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFull) {
      return;
    }
    if (!trimmedName) {
      setError('Please enter your Discord username.');
      return;
    }
    if (isRocketLeague) {
      if (!trimmedEpicId) {
        setError('Please enter your Epic ID.');
        return;
      }
      if (!formData.rocketLeagueRank) {
        setError('Please select your Rocket League Rank.');
        return;
      }
      if (isTeamMode && !trimmedTeammateName) {
        setError("Please enter your teammate's Discord username, or switch to solo registration.");
        return;
      }
    }
    if (!acceptedRules) {
      setError('Please accept the Tournament Rules to continue.');
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      await registerForTournament({
        tournamentId: tournamentId || slug || id,
        discordUsername: trimmedName,
        ...(isRocketLeague
          ? {
              epicId: trimmedEpicId,
              rocketLeagueRank: formData.rocketLeagueRank,
              teamName: formData.teamName.trim() || null,
              needsTeammate: !isTeamMode,
              teammateDisplayName: isTeamMode ? trimmedTeammateName : null,
            }
          : {}),
      });

      markRegisteredForTournament(tournamentId || slug || id);
      const rows = await refreshRegistrations(tournament.tournamentId);
      const registrantNumber = rows
        ? (rows.map((r) => r.name.trim().toLowerCase()).lastIndexOf(trimmedName.toLowerCase()) + 1) || rows.length
        : null;
      setLastRegistrantNumber(registrantNumber);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <TournamentRegistrationSuccess
        tournament={tournament}
        capacity={capacity}
        registrationCount={registrations ? registrations.length : null}
        registrantNumber={lastRegistrantNumber}
      />
    );
  }

  const slotsRemaining = registrationCount === null
    ? null
    : Math.max(0, capacity - registrationCount);
  const progressPct = registrationCount === null
    ? 0
    : Math.min(100, (registrationCount / capacity) * 100);

  return (
    <>
      <style>{tournamentRegistrationStyles}</style>
      <div
        className="tournament-page"
        data-game-slug={tsGameSlug}
        style={{ "--accent": tsAccent }}
      >
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
                      {isShowdown ? (
                        <>
                          <span className="label">Reward</span>
                          <span className="value text-accent">DGL Points</span>
                        </>
                      ) : (
                        <>
                          <span className="label">Prize Pool</span>
                          <span className="value text-accent">{prizePool}</span>
                        </>
                      )}
                    </div>
                    <div className="info-item">
                      <span className="label">Entry</span>
                      <span className="value">{entryFee}</span>
                    </div>
                    {registrationLimit ? (
                      <div className="info-item">
                        <span className="label">Players</span>
                        <span className="value">{registrationLimit}</span>
                      </div>
                    ) : null}
                    {teamLimit ? (
                      <div className="info-item">
                        <span className="label">Teams</span>
                        <span className="value">{teamLimit}</span>
                      </div>
                    ) : null}
                    {matchDuration ? (
                      <div className="info-item">
                        <span className="label">Match Length</span>
                        <span className="value">{matchDuration}</span>
                      </div>
                    ) : null}
                    {overtimeRule ? (
                      <div className="info-item">
                        <span className="label">Overtime</span>
                        <span className="value">{overtimeRule}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {registrationCount !== null && (
                  <div className="registration-status">
                    <div className="registration-status-row">
                      <span>Registered Players: <span className="value">{registrationCount} / {capacity}</span></span>
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
                      Discord Username <span className="required">*</span>
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
                        placeholder="Enter your Discord username"
                        value={formData.discordUsername}
                        onChange={handleInputChange("discordUsername")}
                        disabled={status === 'submitting' || isFull}
                        required
                      />
                    </div>
                    <p className="form-hint">Enter the username you use in the Daddy Gaming Lobby Discord server.</p>
                    <p className="form-hint" style={{ opacity: 0.7, marginTop: '4px' }}>This helps us identify you on the Daddy Gaming Lobby Discord server.</p>
                  </div>

                  {isRocketLeague ? (
                    <>
                      <div className="form-group">
                        <label htmlFor="epicId" className="form-label">
                          Epic ID <span className="required">*</span>
                        </label>
                        <div className="input-wrapper">
                          <input
                            id="epicId"
                            type="text"
                            className="form-control"
                            placeholder="Enter your Epic Games ID"
                            value={formData.epicId}
                            onChange={handleInputChange("epicId")}
                            disabled={status === 'submitting' || isFull}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="rocketLeagueRank" className="form-label">
                          Rocket League Rank <span className="required">*</span>
                        </label>
                        <div className="input-wrapper">
                          <select
                            id="rocketLeagueRank"
                            className="form-control"
                            value={formData.rocketLeagueRank}
                            onChange={handleInputChange("rocketLeagueRank")}
                            disabled={status === 'submitting' || isFull}
                            required
                          >
                            <option value="" disabled>
                              Select your rank
                            </option>
                            <option value="Unranked">Unranked</option>
                            <option value="Bronze">Bronze</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Diamond">Diamond</option>
                            <option value="Champion">Champion</option>
                            <option value="Grand Champion">Grand Champion</option>
                            <option value="Supersonic Legend">Supersonic Legend</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group rules-group">
                        <label className="form-checkbox-label">
                          <input
                            type="radio"
                            name="registrationMode"
                            checked={isTeamMode}
                            onChange={() =>
                              setFormData((prev) => ({ ...prev, registrationMode: "team" }))
                            }
                            disabled={status === 'submitting' || isFull}
                          />
                          <span>Team Registration — I already have a teammate</span>
                        </label>
                        <label className="form-checkbox-label">
                          <input
                            type="radio"
                            name="registrationMode"
                            checked={!isTeamMode}
                            onChange={() =>
                              setFormData((prev) => ({ ...prev, registrationMode: "solo" }))
                            }
                            disabled={status === 'submitting' || isFull}
                          />
                          <span>Solo Registration — pair me with a teammate</span>
                        </label>
                      </div>

                      {isTeamMode ? (
                        <>
                          <div className="form-group">
                            <label htmlFor="teammateDisplayName" className="form-label">
                              Teammate Discord Username <span className="required">*</span>
                            </label>
                            <div className="input-wrapper">
                              <input
                                id="teammateDisplayName"
                                type="text"
                                className="form-control"
                                placeholder="Enter your teammate's Discord username"
                                value={formData.teammateDisplayName}
                                onChange={handleInputChange("teammateDisplayName")}
                                disabled={status === 'submitting' || isFull}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="teamName" className="form-label">
                              Team Name <span style={{ opacity: 0.6 }}>(optional)</span>
                            </label>
                            <div className="input-wrapper">
                              <input
                                id="teamName"
                                type="text"
                                className="form-control"
                                placeholder="Enter a team name"
                                value={formData.teamName}
                                onChange={handleInputChange("teamName")}
                                disabled={status === 'submitting' || isFull}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="form-hint">
                          DGL will pair you with another solo player before the tournament begins.
                        </p>
                      )}
                    </>
                  ) : null}

                  <div className="form-group rules-group">
                    <label className="form-checkbox-label">
                      <input
                        type="checkbox"
                        checked={acceptedRules}
                        onChange={(e) => {
                          setAcceptedRules(e.target.checked);
                          if (error) setError(null);
                        }}
                        disabled={status === 'submitting' || isFull}
                      />
                      <span>
                        I accept the{" "}
                        <Link to="/terms" target="_blank" rel="noopener noreferrer">Tournament Rules</Link>
                        {" "}<span className="required">Required</span>
                      </span>
                    </label>
                  </div>

                  {error && (
                    <div className="alert alert-error">
                      <span>⚠️ {error}</span>
                    </div>
                  )}

                  {isFull ? (
                    <div className="registration-full-notice">Tournament Full</div>
                  ) : null}

                  <button
                    type="submit"
                    className={`submit-btn ${status === 'submitting' ? 'loading' : ''}`}
                    disabled={
                      status === 'submitting' ||
                      !trimmedName ||
                      !acceptedRules ||
                      !rocketLeagueFieldsValid ||
                      isFull
                    }
                  >
                    <span className="btn-text">
                      {isFull
                        ? 'Tournament Full'
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
