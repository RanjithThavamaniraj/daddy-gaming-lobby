import { LIFECYCLE_BADGE } from "../../../lib/tournamentLifecycle";
import { parsePrizePoolAmount } from "../../../lib/prizePool";
import ReserveInfoTooltip from "../ReserveInfoTooltip";

/**
 * Format start timestamp for the hub hero in IST.
 * @param {string | null | undefined} iso
 * @returns {{ date: string, time: string }}
 */
function splitStartDateTimeIst(iso, endsAt) {
  if (!iso) return { date: "TBA", time: "TBA" };
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return { date: "TBA", time: "TBA" };
  const d = new Date(ms);
  const date = d.toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const clock = d.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endMs = endsAt ? Date.parse(endsAt) : Number.NaN;
  if (Number.isNaN(endMs)) {
    return { date, time: `${clock} IST` };
  }
  const endClock = new Date(endMs).toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time: `${clock} – ${endClock} IST` };
}

/**
 * Tournament hub hero.
 * @param {object} props
 * @param {object} props.tournament
 * @param {number} props.playerCount
 * @param {number} props.capacity
 * @param {number} [props.reserveCount]
 * @param {number} [props.reserveLimit]
 * @param {number} [props.teamFilled]
 */
export default function TournamentHero({
  tournament,
  playerCount,
  capacity,
  reserveCount = 0,
  reserveLimit = 4,
  teamFilled = 0,
}) {
  const badge =
    LIFECYCLE_BADGE[tournament.lifecycle] ?? tournament.status ?? "Tournament";
  const accent = tournament.accent || "#a855f7";
  const { date: datePart, time: timePart } = splitStartDateTimeIst(
    tournament.startsAt,
    tournament.endsAt
  );
  const cash =
    parsePrizePoolAmount(tournament.prizePool) > 0 ||
    Number(tournament.prizePerConfirmed) > 0;
  const entryFee =
    (tournament.entryFee && String(tournament.entryFee).trim()) || "Free";
  const isTeamSlots = tournament.registrationMode === "team_slots";
  const prizeLabel =
    isTeamSlots && cash
      ? /team prize/i.test(String(tournament.prizePool ?? ""))
        ? tournament.prizePool.trim()
        : `${tournament.prizePool?.trim() || "₹0"} Team Prize`
      : tournament.prizePool?.trim() || "₹0";

  return (
    <section className="hub-hero" style={{ "--accent": accent }}>
      <div className="hub-hero-banner" aria-hidden="true" />
      <div className="hub-hero-content">
        {tournament.tournamentNumber ? (
          <p className="hub-hero-eyebrow">{tournament.tournamentNumber}</p>
        ) : null}
        <h1 className="hub-hero-title">
          {tournament.title || tournament.championshipName || tournament.name}
        </h1>
        {tournament.subtitle ? (
          <p className="hub-hero-subtitle">{tournament.subtitle}</p>
        ) : null}
        <div className="hub-hero-meta">
          <span className="hub-hero-game">{tournament.game || "DGL"}</span>
          <span className="hub-status-badge">{badge}</span>
        </div>
        <div className="hub-hero-stats">
          <div className="hub-hero-stat">
            <span className="label">Game</span>
            <span className="value">{tournament.game || "DGL"}</span>
          </div>
          <div className="hub-hero-stat">
            <span className="label">Mode</span>
            <span className="value">{tournament.format || "—"}</span>
          </div>
          <div className="hub-hero-stat">
            <span className="label">Format</span>
            <span className="value">{tournament.matchType || "—"}</span>
          </div>
          <div className="hub-hero-stat">
            <span className="label">Date</span>
            <span className="value">{datePart}</span>
          </div>
          <div className="hub-hero-stat">
            <span className="label">Time</span>
            <span className="value">{timePart}</span>
          </div>
          {cash ? (
            <div className="hub-hero-stat">
              <span className="label">Prize Pool</span>
              <span className="value text-accent">
                {isTeamSlots ? prizeLabel : tournament.prizePool?.trim() || "₹0"}
              </span>
            </div>
          ) : null}
          {tournament.platform ? (
            <div className="hub-hero-stat">
              <span className="label">Platform</span>
              <span className="value">{tournament.platform}</span>
            </div>
          ) : null}
          {isTeamSlots ? (
            <div className="hub-hero-stat">
              <span className="label">Teams</span>
              <span className="value">
                {teamFilled} / {tournament.teamLimit}
              </span>
            </div>
          ) : (
            <div className="hub-hero-stat">
              <span className="label">Players</span>
              <span className="value">
                {playerCount} / {capacity}
              </span>
            </div>
          )}
          {Number(reserveLimit) > 0 ? (
            <div className="hub-hero-stat">
              <span className="label">
                Reserve <ReserveInfoTooltip />
              </span>
              <span className="value">
                {reserveCount} / {reserveLimit}
              </span>
            </div>
          ) : null}
          <div className="hub-hero-stat">
            <span className="label">Entry</span>
            <span className="value">{entryFee}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
