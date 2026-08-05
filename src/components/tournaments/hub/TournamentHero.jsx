import {
  LIFECYCLE_BADGE,
  formatTournamentStartDate,
} from "../../../lib/tournamentLifecycle";

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
  const startLabel = formatTournamentStartDate(tournament.startsAt);
  const datePart = startLabel === "TBA" ? "TBA" : startLabel.split(",")[0];
  const timePart =
    startLabel === "TBA"
      ? "TBA"
      : startLabel.includes(",")
        ? startLabel.split(",").slice(1).join(",").trim()
        : startLabel;

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
            <span className="value text-accent">
              {tournament.prizePool || "TBA"}
            </span>
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
