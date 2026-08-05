import PlayerNameLink from "./PlayerNameLink";
import { completedFixtures } from "../../../lib/supabase/tournamentBracket";

/**
 * Recently completed matches with winner + score.
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
          {done.map((match) => {
            const score =
              match.player1Score != null && match.player2Score != null
                ? `${match.player1Score} – ${match.player2Score}`
                : "—";
            return (
              <article key={match.id} className="hub-result-card">
                <div className="hub-result-round">{match.roundLabel}</div>
                <div className="hub-result-body">
                  <div>
                    <span className="label">Winner</span>
                    <PlayerNameLink
                      player={match.winner}
                      fallback="—"
                      className="hub-player-link hub-winner"
                    />
                  </div>
                  <div>
                    <span className="label">Score</span>
                    <span className="value">{score}</span>
                  </div>
                </div>
                <div className="hub-result-matchup">
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
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
