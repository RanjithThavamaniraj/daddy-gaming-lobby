import { LIFECYCLE_BADGE } from "../../../lib/tournamentLifecycle";

/**
 * @param {string | null | undefined} iso
 * @returns {{ date: string, time: string }}
 */
function splitStartDateTime(iso) {
  if (!iso) return { date: "TBA", time: "TBA" };
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return { date: "TBA", time: "TBA" };
  const d = new Date(ms);
  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

/**
 * Tournament hub hero — name, game, date/time, prize, status, count, banner.
 * @param {object} props
 * @param {object} props.tournament
 * @param {number} props.playerCount
 * @param {number} props.capacity
 */
export default function TournamentHero({ tournament, playerCount, capacity }) {
  const badge =
    LIFECYCLE_BADGE[tournament.lifecycle] ?? tournament.status ?? "Tournament";
  const accent = tournament.accent || "#a855f7";
  const { date: datePart, time: timePart } = splitStartDateTime(
    tournament.startsAt
  );
  const prize =
    tournament.prizePool && String(tournament.prizePool).trim()
      ? tournament.prizePool
      : "TBA";

  return (
    <section className="hub-hero" style={{ "--accent": accent }}>
      <div className="hub-hero-banner" aria-hidden="true" />
      <div className="hub-hero-content">
        <p className="hub-hero-eyebrow">
          Tournament #{tournament.number ?? tournament.globalNumber ?? "—"}
        </p>
        <h1 className="hub-hero-title">
          {tournament.title || tournament.championshipName || tournament.name}
        </h1>
        <div className="hub-hero-meta">
          <span className="hub-hero-game">{tournament.game || "DGL"}</span>
          <span className="hub-status-badge">{badge}</span>
        </div>
        <div className="hub-hero-stats">
          <div className="hub-hero-stat">
            <span className="label">Date</span>
            <span className="value">{datePart}</span>
          </div>
          <div className="hub-hero-stat">
            <span className="label">Time</span>
            <span className="value">{timePart}</span>
          </div>
          <div className="hub-hero-stat">
            <span className="label">Prize Pool</span>
            <span className="value text-accent">{prize}</span>
          </div>
          <div className="hub-hero-stat">
            <span className="label">Players</span>
            <span className="value">
              {playerCount} / {capacity}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
