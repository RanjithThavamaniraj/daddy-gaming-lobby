import { Link } from "react-router-dom";
import { useState } from "react";
import { VALORANT_RANKS } from "../../../config/valorantRanks";

const TEAM_SIZE = 5;

const EMPTY_TEAM_PLAYERS = () =>
  Array.from({ length: TEAM_SIZE }, (_, index) => ({
    discordUsername: "",
    rank: "",
    label: index === 0 ? "Captain" : `Player ${index + 1}`,
    isCaptain: index === 0,
  }));

/**
 * Valorant Championship #2 registration — solo or full 5-player team.
 *
 * @param {object} props
 * @param {object} props.tournament
 * @param {number} props.capacity
 * @param {number | null} props.registrationCount
 * @param {number} [props.reserveCount]
 * @param {number} [props.reserveLimit]
 * @param {boolean} [props.isReserveMode]
 * @param {boolean} [props.tournamentFull]
 * @param {(payload: object) => Promise<void>} props.onSubmit
 */
export default function ValorantRegistrationForm({
  tournament,
  capacity,
  registrationCount,
  reserveCount = 0,
  reserveLimit = 4,
  isReserveMode = false,
  tournamentFull = false,
  onSubmit,
}) {
  const {
    tournamentId,
    slug,
    id,
    format,
    matchType,
    prizePool,
    entryFee,
    registrationLimit,
    rules,
  } = tournament;

  const [registrationMode, setRegistrationMode] = useState(null);
  const [soloForm, setSoloForm] = useState({
    discordUsername: "",
    rank: "",
  });
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    players: EMPTY_TEAM_PLAYERS(),
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [acceptedRules, setAcceptedRules] = useState(false);

  const mainSlotsRemaining =
    registrationCount === null
      ? capacity
      : Math.max(0, capacity - registrationCount);
  const reserveSlotsRemaining = Math.max(0, reserveLimit - reserveCount);
  const mainFull = registrationCount !== null && registrationCount >= capacity;
  const reserveFull = reserveCount >= reserveLimit;
  const isFull = tournamentFull
    ? true
    : isReserveMode
      ? reserveFull
      : mainFull && reserveFull;

  const canRegisterSolo = isReserveMode
    ? reserveSlotsRemaining >= 1
    : mainSlotsRemaining >= 1;

  // Full teams use MAIN slots only — never reserve.
  const canRegisterTeam = !isReserveMode && mainSlotsRemaining >= TEAM_SIZE;

  const handleModeSelect = (mode) => {
    setRegistrationMode(mode);
    setError(null);
  };

  const handleSoloChange = (field) => (e) => {
    setSoloForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError(null);
  };

  const handleTeamMetaChange = (field) => (e) => {
    setTeamForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) setError(null);
  };

  const handleTeamPlayerChange = (index, field) => (e) => {
    setTeamForm((prev) => ({
      ...prev,
      players: prev.players.map((player, i) =>
        i === index ? { ...player, [field]: e.target.value } : player
      ),
    }));
    if (error) setError(null);
  };

  const validateTeamPlayers = () => {
    const names = [];
    for (const player of teamForm.players) {
      const discord = player.discordUsername.trim();
      const rank = player.rank.trim();
      if (!discord) {
        return `${player.label}: Discord username is required.`;
      }
      if (!rank) {
        return `${player.label}: Valorant rank is required.`;
      }
      const key = discord.toLowerCase();
      if (names.includes(key)) {
        return `Duplicate Discord username: ${discord}`;
      }
      names.push(key);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFull || !registrationMode) return;

    if (!acceptedRules) {
      setError("Please accept the Tournament Rules to continue.");
      return;
    }

    if (registrationMode === "solo") {
      const discord = soloForm.discordUsername.trim();
      const rank = soloForm.rank.trim();
      if (!discord) {
        setError("Please enter your Discord username.");
        return;
      }
      if (!rank) {
        setError("Please select your Valorant rank.");
        return;
      }
      if (!canRegisterSolo) {
        setError("Not enough capacity for solo registration.");
        return;
      }

      setStatus("submitting");
      setError(null);
      try {
        await onSubmit({
          registrationType: "solo",
          tournamentId: tournamentId || slug || id,
          discordUsername: discord,
          valorantRank: rank,
        });
      } catch (err) {
        setError(err.message || "Registration failed. Please try again.");
        setStatus("idle");
      }
      return;
    }

    const teamName = teamForm.teamName.trim();
    if (!teamName) {
      setError("Team name is required.");
      return;
    }
    const teamValidationError = validateTeamPlayers();
    if (teamValidationError) {
      setError(teamValidationError);
      return;
    }
    if (!canRegisterTeam) {
      setError(
        "Not enough main capacity for a full team. Teams require 5 available main player slots."
      );
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      await onSubmit({
        registrationType: "team",
        tournamentId: tournamentId || slug || id,
        teamName,
        players: teamForm.players.map((player, index) => ({
          discordUsername: player.discordUsername.trim(),
          rank: player.rank.trim(),
          isCaptain: index === 0,
        })),
      });
    } catch (err) {
      setError(err.message || "Team registration failed. Please try again.");
      setStatus("idle");
    }
  };

  const submitting = status === "submitting";

  return (
    <>
      <div className="register-info">
        <h3>Tournament Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Mode</span>
            <span className="value">{format}</span>
          </div>
          <div className="info-item">
            <span className="label">Format</span>
            <span className="value">{matchType}</span>
          </div>
          <div className="info-item">
            <span className="label">Prize Pool</span>
            <span className="value text-accent">{prizePool || "₹0"}</span>
          </div>
          <div className="info-item">
            <span className="label">Entry</span>
            <span className="value">{entryFee || "Free"}</span>
          </div>
          {registrationLimit ? (
            <div className="info-item">
              <span className="label">Main Capacity</span>
              <span className="value">{registrationLimit} players</span>
            </div>
          ) : null}
        </div>
      </div>

      {Array.isArray(rules) && rules.length > 0 ? (
        <div className="register-info">
          <h3>Event Rules</h3>
          <ul
            className="form-hint"
            style={{ margin: 0, paddingLeft: "1.2rem" }}
          >
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="registration-status">
        <div className="registration-status-row">
          <span>
            Main Slots:{" "}
            <span className="value">
              {registrationCount ?? 0} / {capacity} Players
            </span>
          </span>
          <span>
            Reserve Slots:{" "}
            <span className="value">
              {reserveCount} / {reserveLimit} Players
            </span>
          </span>
        </div>
        <div className="registration-progress">
          <div
            className="registration-progress-fill"
            style={{
              width: `${
                registrationCount === null
                  ? 0
                  : Math.min(100, (registrationCount / capacity) * 100)
              }%`,
            }}
          />
        </div>
      </div>

      {isReserveMode ? (
        <div className="reserve-join-banner">
          <h3>Main roster is full — solo reserve registration only.</h3>
          <p>
            Reserve slots are for individual solo players only. Full teams must
            register while at least 5 main player slots remain.
          </p>
        </div>
      ) : null}

      <form className="registration-form" onSubmit={handleSubmit} noValidate>
        <h3>{isReserveMode ? "Join Reserve List" : "Register"}</h3>

        {!registrationMode ? (
          <>
            <p className="form-hint">
              {isReserveMode
                ? "Register as a solo reserve player."
                : "How are you registering?"}
            </p>
            <div className="registration-mode-grid">
              <button
                type="button"
                className={`registration-mode-card${
                  !canRegisterSolo ? " disabled" : ""
                }`}
                onClick={() => canRegisterSolo && handleModeSelect("solo")}
                disabled={submitting || isFull || !canRegisterSolo}
              >
                <span className="mode-icon" aria-hidden="true">
                  🧑
                </span>
                <span className="mode-title">Solo Player</span>
                <span className="mode-copy">
                  {isReserveMode
                    ? "Join reserve list (1 slot)"
                    : "Register yourself (1 main slot)"}
                </span>
              </button>
              {!isReserveMode ? (
                <button
                  type="button"
                  className={`registration-mode-card${
                    !canRegisterTeam ? " disabled" : ""
                  }`}
                  onClick={() => canRegisterTeam && handleModeSelect("team")}
                  disabled={submitting || isFull || !canRegisterTeam}
                >
                  <span className="mode-icon" aria-hidden="true">
                    👥
                  </span>
                  <span className="mode-title">Full Team</span>
                  <span className="mode-copy">
                    Register a complete 5-player team (5 main slots)
                  </span>
                </button>
              ) : null}
            </div>
            {!isReserveMode && !canRegisterTeam && canRegisterSolo ? (
              <p className="form-hint">
                Full team registration requires 5 available main player slots.
              </p>
            ) : null}
          </>
        ) : (
          <>
            <button
              type="button"
              className="registration-mode-back"
              onClick={() => {
                setRegistrationMode(null);
                setError(null);
              }}
              disabled={submitting}
            >
              ← Change registration type
            </button>

            {registrationMode === "solo" ? (
              <>
                <div className="form-group">
                  <label htmlFor="soloDiscord" className="form-label">
                    Discord Name / Username{" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    id="soloDiscord"
                    type="text"
                    className="form-control"
                    placeholder="Enter your Discord username"
                    value={soloForm.discordUsername}
                    onChange={handleSoloChange("discordUsername")}
                    disabled={submitting || isFull}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="soloRank" className="form-label">
                    Valorant Rank <span className="required">*</span>
                  </label>
                  <select
                    id="soloRank"
                    className="form-control"
                    value={soloForm.rank}
                    onChange={handleSoloChange("rank")}
                    disabled={submitting || isFull}
                    required
                  >
                    <option value="" disabled>
                      Select your rank
                    </option>
                    {VALORANT_RANKS.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="teamName" className="form-label">
                    Team Name <span className="required">*</span>
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    className="form-control"
                    placeholder="Enter your team name"
                    value={teamForm.teamName}
                    onChange={handleTeamMetaChange("teamName")}
                    disabled={submitting || isFull}
                    required
                  />
                </div>

                {teamForm.players.map((player, index) => (
                  <div key={player.label} className="team-player-block">
                    <h4 className="team-player-title">{player.label}</h4>
                    <div className="form-group">
                      <label
                        htmlFor={`teamDiscord${index}`}
                        className="form-label"
                      >
                        Discord Name / Username{" "}
                        <span className="required">*</span>
                      </label>
                      <input
                        id={`teamDiscord${index}`}
                        type="text"
                        className="form-control"
                        placeholder="Enter Discord username"
                        value={player.discordUsername}
                        onChange={handleTeamPlayerChange(
                          index,
                          "discordUsername"
                        )}
                        disabled={submitting || isFull}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label
                        htmlFor={`teamRank${index}`}
                        className="form-label"
                      >
                        Valorant Rank <span className="required">*</span>
                      </label>
                      <select
                        id={`teamRank${index}`}
                        className="form-control"
                        value={player.rank}
                        onChange={handleTeamPlayerChange(index, "rank")}
                        disabled={submitting || isFull}
                        required
                      >
                        <option value="" disabled>
                          Select rank
                        </option>
                        {VALORANT_RANKS.map((rank) => (
                          <option key={rank} value={rank}>
                            {rank}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        <div className="form-group rules-group">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              checked={acceptedRules}
              onChange={(e) => {
                setAcceptedRules(e.target.checked);
                if (error) setError(null);
              }}
              disabled={submitting || isFull}
            />
            <span>
              I accept the{" "}
              <Link to="/terms" target="_blank" rel="noopener noreferrer">
                Tournament Rules
              </Link>{" "}
              <span className="required">Required</span>
            </span>
          </label>
        </div>

        {error ? (
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
          </div>
        ) : null}

        {isFull ? (
          <div className="registration-full-notice">Tournament Full</div>
        ) : null}

        {registrationMode ? (
          <button
            type="submit"
            className={`submit-btn ${submitting ? "loading" : ""}`}
            disabled={
              submitting ||
              !acceptedRules ||
              isFull ||
              (registrationMode === "solo" && !canRegisterSolo) ||
              (registrationMode === "team" && !canRegisterTeam)
            }
          >
            <span className="btn-text">
              {isFull
                ? "Tournament Full"
                : submitting
                  ? registrationMode === "team"
                    ? "Registering team…"
                    : isReserveMode
                      ? "Joining reserve…"
                      : "Registering…"
                  : registrationMode === "team"
                    ? "Register Team"
                    : isReserveMode
                      ? "🟡 JOIN RESERVE LIST"
                      : "✓ REGISTER NOW"}
            </span>
          </button>
        ) : null}
      </form>
    </>
  );
}
