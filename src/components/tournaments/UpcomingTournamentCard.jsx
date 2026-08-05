import GameIcon from "./GameIcon";
import TournamentLifecycleCta from "./TournamentLifecycleCta";
import { LIFECYCLE_BADGE } from "../../lib/tournamentLifecycle";
import { isSaturdayShowdown, EVENT_TYPES } from "../../config/eventTypeConfig";

/**
 * Card for non-featured / non-next upcoming tournaments.
 * CTA is lifecycle-driven only — Tournament Series affects branding only.
 *
 * @param {object} props
 * @param {object} props.tournament
 */
export default function UpcomingTournamentCard({ tournament }) {
  const gameSlug =
    tournament.gameSlug ??
    tournament.game?.toLowerCase?.().replace(/\s+/g, "-") ??
    "dgl";
  const isShowdown = isSaturdayShowdown(tournament.eventType);
  const badge =
    LIFECYCLE_BADGE[tournament.lifecycle] ?? tournament.status ?? "Tournament";
  const statusKey = String(tournament.status ?? "coming-soon")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <article
      className="tournament-hub-card upcoming-card"
      style={{
        "--accent": tournament.accent,
        animationDelay: `${0.08 * (tournament.index ?? 0)}s`,
      }}
    >
      <div className="tournament-hub-card-inner">
        <div className="hub-card-header">
          <div className="hub-card-icon">
            <GameIcon slug={gameSlug} />
          </div>
          <div className="hub-card-titles">
            {tournament.tournamentNumber ? (
              <span className="hub-card-tournament-number">
                {tournament.tournamentNumber}
              </span>
            ) : null}
            {isShowdown ? (
              <span
                className="hub-card-tournament-number"
                style={{
                  color: EVENT_TYPES.saturday_showdown.goldAccent,
                  borderColor: `color-mix(in srgb, ${EVENT_TYPES.saturday_showdown.goldAccent} 45%, transparent)`,
                  background: `color-mix(in srgb, ${EVENT_TYPES.saturday_showdown.goldAccent} 12%, transparent)`,
                  marginLeft: "0.35rem",
                }}
              >
                {EVENT_TYPES.saturday_showdown.heroBadge}
              </span>
            ) : null}
            <h4 className="hub-card-title">
              {tournament.championshipName ?? tournament.title}
            </h4>
            <span className="hub-card-game">{tournament.game}</span>
          </div>
          <span className={`status-badge-custom ${statusKey}`}>{badge}</span>
        </div>
        <div className="hub-card-action">
          <TournamentLifecycleCta tournament={tournament} />
        </div>
      </div>
    </article>
  );
}
