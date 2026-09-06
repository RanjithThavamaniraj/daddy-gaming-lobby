import { useState } from "react";
import { isSaturdayShowdown } from "../../../config/eventTypeConfig";
import TeamSlotRoster from "./TeamSlotRoster";

function emptyPlayers(count) {
  return Array.from({ length: count }, () => ({ discordUsername: "" }));
}

/**
 * Team-slot registration: captains claim Team 1…N with a full main roster
 * and optional substitutes.
 *
 * @param {object} props
 * @param {object} props.tournament
 * @param {Array<object>} props.slots
 * @param {(payload: object) => Promise<void>} props.onSubmit
 */
export default function TeamSlotRegistrationForm({
  tournament,
  slots = [],
  onSubmit,
}) {
  const {
    id,
    tournamentId,
    slug,
    format,
    matchType,
    prizePool,
    entryFee,
    eventType,
    teamLimit,
    teamMainSize,
    teamSubstituteSize,
    registrationLimit,
    rules,
  } = tournament;

  const mainSize = Number(teamMainSize) || 0;
  const substituteSize = Number(teamSubstituteSize) || 0;
  const isShowdown = isSaturdayShowdown(eventType);
  const hasCashPrize = Boolean(prizePool && /[1-9]/.test(String(prizePool)));

  const [selectedTeam, setSelectedTeam] = useState("");
  const [mains, setMains] = useState(() => emptyPlayers(mainSize));
  const [substitutes, setSubstitutes] = useState(() =>
    emptyPlayers(substituteSize)
  );
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [acceptedRules, setAcceptedRules] = useState(false);

  const available = slots.filter((slot) => !slot.taken);
  const tournamentFull = available.length === 0;
  const submitting = status === "submitting";

  const handleMainChange = (index) => (event) => {
    const value = event.target.value;
    setMains((prev) =>
      prev.map((player, i) =>
        i === index ? { ...player, discordUsername: value } : player
      )
    );
  };

  const handleSubChange = (index) => (event) => {
    const value = event.target.value;
    setSubstitutes((prev) =>
      prev.map((player, i) =>
        i === index ? { ...player, discordUsername: value } : player
      )
    );
  };

  const validate = () => {
    if (!selectedTeam) return "Select an available team slot.";
    const selected = slots.find((slot) => slot.name === selectedTeam);
    if (!selected || selected.taken) {
      return "That team slot is no longer available.";
    }

    const mainNames = mains.map((player) => player.discordUsername.trim());
    if (mainNames.some((name) => !name)) {
      return `All ${mainSize} starting players are required.`;
    }

    const subNames = substitutes
      .map((player) => player.discordUsername.trim())
      .filter(Boolean);

    const all = [...mainNames, ...subNames].map((name) => name.toLowerCase());
    if (new Set(all).size !== all.length) {
      return "Each Discord username can only appear once on the roster.";
    }

    if (Array.isArray(rules) && rules.length > 0 && !acceptedRules) {
      return "Please accept the event rules to register.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (tournamentFull || submitting) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setStatus("submitting");
    setError(null);
    try {
      await onSubmit({
        registrationType: "team",
        tournamentId: tournamentId || slug || id,
        teamName: selectedTeam,
        mains: mains.map((player, index) => ({
          discordUsername: player.discordUsername.trim(),
          isCaptain: index === 0,
        })),
        substitutes: substitutes
          .map((player) => ({
            discordUsername: player.discordUsername.trim(),
          }))
          .filter((player) => player.discordUsername),
      });
    } catch (err) {
      setError(err.message || "Team registration failed. Please try again.");
      setStatus("idle");
    }
  };

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
          {hasCashPrize ? (
            <div className="info-item">
              <span className="label">Prize Pool</span>
              <span className="value text-accent">
                {/team prize/i.test(String(prizePool ?? ""))
                  ? prizePool
                  : `${prizePool} Team Prize`}
              </span>
            </div>
          ) : (
            <div className="info-item">
              <span className="label">Prize Pool</span>
              <span className="value">No cash prize</span>
            </div>
          )}
          <div className="info-item">
            <span className="label">Entry</span>
            <span className="value">{entryFee || "Free"}</span>
          </div>
          {teamLimit ? (
            <div className="info-item">
              <span className="label">Teams</span>
              <span className="value">{teamLimit}</span>
            </div>
          ) : null}
          {mainSize ? (
            <div className="info-item">
              <span className="label">Starting roster</span>
              <span className="value">
                {mainSize} players
                {registrationLimit ? ` · ${registrationLimit} total` : ""}
              </span>
            </div>
          ) : null}
          {substituteSize ? (
            <div className="info-item">
              <span className="label">Substitutes</span>
              <span className="value">
                {substituteSize} per team
                {teamLimit ? ` · ${teamLimit * substituteSize} max` : ""}
              </span>
            </div>
          ) : null}
          {isShowdown ? (
            <div className="info-item">
              <span className="label">Rewards</span>
              <span className="value text-accent">DGL Points</span>
            </div>
          ) : null}
        </div>
      </div>

      {Array.isArray(rules) && rules.length > 0 ? (
        <div className="register-info">
          <h3>Event Rules</h3>
          <ul className="form-hint" style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <TeamSlotRoster
        slots={slots}
        mainSize={mainSize}
        substituteSize={substituteSize}
        selectedName={selectedTeam}
        onSelect={(slot) => {
          setSelectedTeam(slot.name);
          setError(null);
        }}
      />

      <form className="registration-form" onSubmit={handleSubmit} noValidate>
        <h3>Register a Team</h3>
        <p className="form-hint">
          Choose an available team slot, then enter the starting roster.
          Substitutes are optional (up to {substituteSize} per team).
        </p>

        {tournamentFull ? (
          <div className="registration-full-notice">All team slots are taken</div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="teamSlot" className="form-label">
                Team slot <span className="required">*</span>
              </label>
              <select
                id="teamSlot"
                className="form-control team-slot-select"
                value={selectedTeam}
                onChange={(event) => setSelectedTeam(event.target.value)}
                disabled={submitting}
                required
              >
                <option value="">Select Team 1–{teamLimit}</option>
                {available.map((slot) => (
                  <option key={slot.id ?? slot.name} value={slot.name}>
                    {slot.name}
                  </option>
                ))}
              </select>
            </div>

            <h4 className="roster-section-heading">Main Roster</h4>
            {mains.map((player, index) => (
              <div key={`main-${index}`} className="team-player-block">
                <h4 className="team-player-title">
                  {index === 0
                    ? `Player 1 (Captain)`
                    : `Player ${index + 1}`}
                </h4>
                <div className="form-group">
                  <label
                    htmlFor={`mainDiscord${index}`}
                    className="form-label"
                  >
                    Discord Name / Username{" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    id={`mainDiscord${index}`}
                    type="text"
                    className="form-control team-slot-select"
                    placeholder="Enter Discord username"
                    value={player.discordUsername}
                    onChange={handleMainChange(index)}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
            ))}

            {substituteSize > 0 ? (
              <>
                <h4 className="roster-section-heading">Substitutes</h4>
                {substitutes.map((player, index) => (
                  <div key={`sub-${index}`} className="team-player-block">
                    <h4 className="team-player-title">
                      Substitute {index + 1}
                    </h4>
                    <div className="form-group">
                      <label
                        htmlFor={`subDiscord${index}`}
                        className="form-label"
                      >
                        Discord Name / Username
                      </label>
                      <input
                        id={`subDiscord${index}`}
                        type="text"
                        className="form-control team-slot-select"
                        placeholder="Optional"
                        value={player.discordUsername}
                        onChange={handleSubChange(index)}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : null}

            {Array.isArray(rules) && rules.length > 0 ? (
              <div className="form-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={acceptedRules}
                    onChange={(event) => setAcceptedRules(event.target.checked)}
                    disabled={submitting}
                  />
                  I accept the event rules
                </label>
              </div>
            ) : null}

            {error ? (
              <div className="alert alert-error">
                <span>⚠️ {error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              className={`submit-btn${submitting ? " loading" : ""}`}
              disabled={submitting || tournamentFull}
            >
              {submitting ? "Registering…" : "Register Team"}
            </button>
          </>
        )}
      </form>
    </>
  );
}
