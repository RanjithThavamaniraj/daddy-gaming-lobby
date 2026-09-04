import FixtureSide from "./FixtureSide";
import { completedFixtures } from "../../../lib/supabase/tournamentBracket";

/**
 * Recently completed matches — round, winner, and matchup only.
 * @param {object} props
 * @param {import("../../../lib/supabase/tournamentBracket").TournamentFixture[]} props.fixtures
 * @param {boolean} props.loading
 */
export default function LiveResults({ fixtures, loading }) {
  const done = completedFixtures(fixtures);

  return (
    <section className="hub-section">
      <h2 className="hub-section-title">Live Results</h2>
      {loading ? (
        <p className="hub-muted">Loading results…</p>
      ) : done.length === 0 ? (
        <p className="hub-empty">
          Results appear here as soon as matches are completed.
        </p>
      ) : (
        <div className="hub-results-list">
          {done.map((match) => (
            <article key={match.id} className="hub-result-card">
              <div className="hub-result-round">{match.roundLabel}</div>
              <div className="hub-result-body">
                <div>
                  <span className="label">Winner</span>
                  <FixtureSide
                    player={match.winner}
                    members={match.winnerMembers}
                    fallback="—"
                    className="hub-player-link hub-winner"
                  />
                </div>
              </div>
              <div className="hub-result-matchup">
                <FixtureSide
                  player={match.player1}
                  members={match.player1Members}
                  fallback={match.player1Placeholder || "TBD"}
                />
                <span className="hub-vs">vs</span>
                <FixtureSide
                  player={match.player2}
                  members={match.player2Members}
                  fallback={match.player2Placeholder || "TBD"}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
