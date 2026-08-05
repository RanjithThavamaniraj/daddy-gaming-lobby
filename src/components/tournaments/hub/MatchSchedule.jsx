import PlayerNameLink from "./PlayerNameLink";
import { fixtureStatusLabel } from "../../../lib/supabase/tournamentBracket";
import { formatTournamentStartDate } from "../../../lib/tournamentLifecycle";

/**
 * Full match schedule list.
 * @param {object} props
 * @param {import("../../../lib/supabase/tournamentBracket").TournamentFixture[]} props.fixtures
 * @param {boolean} props.loading
 */
export default function MatchSchedule({ fixtures, loading }) {
  const list = [...(fixtures ?? [])].sort((a, b) => {
    const at = a.scheduledAt ? Date.parse(a.scheduledAt) : Number.MAX_SAFE_INTEGER;
    const bt = b.scheduledAt ? Date.parse(b.scheduledAt) : Number.MAX_SAFE_INTEGER;
    if (at !== bt) return at - bt;
    if (a.stage !== b.stage) return String(a.stage).localeCompare(String(b.stage));
    return a.fixtureOrder - b.fixtureOrder;
  });

  return (
    <section className="hub-section">
      <h2 className="hub-section-title">Match Schedule</h2>
      {loading ? (
        <p className="hub-muted">Loading schedule…</p>
      ) : list.length === 0 ? (
        <p className="hub-empty">
          Match times will appear once the group draw is complete.
        </p>
      ) : (
        <div className="hub-schedule-list">
          {list.map((match) => (
            <article key={match.id} className="hub-schedule-row">
              <div className="hub-schedule-players">
                <PlayerNameLink
                  player={match.player1}
                  fallback={match.player1Placeholder || "TBD"}
                />
                <span className="hub-vs">vs</span>
                <PlayerNameLink
                  player={match.player2}
                  fallback={match.player2Placeholder || "TBD"}
                />
              </div>
              <div className="hub-schedule-meta">
                <span>{match.roundLabel}</span>
                <span>
                  {match.scheduledAt
                    ? formatTournamentStartDate(match.scheduledAt)
                    : "Time TBA"}
                </span>
                <span className={`hub-match-status status-${match.status}`}>
                  {fixtureStatusLabel(match.status)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
