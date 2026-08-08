import PlayerNameLink from "./PlayerNameLink";
import {
  KNOCKOUT_STAGE_ORDER,
  groupKnockoutByStage,
  knockoutStageTitle,
  fixtureStatusLabel,
} from "../../../lib/supabase/tournamentBracket";

/**
 * Knockout bracket rounds once knockout stages exist.
 * @param {object} props
 * @param {import("../../../lib/supabase/tournamentBracket").TournamentFixture[]} props.fixtures
 * @param {boolean} props.hasKnockout
 * @param {boolean} props.loading
 */
export default function TournamentBracket({ fixtures, hasKnockout, loading }) {
  const byStage = groupKnockoutByStage(fixtures);
  const stages = KNOCKOUT_STAGE_ORDER.filter((s) => byStage[s]?.length);

  if (loading) {
    return (
      <section className="hub-section">
        <h2 className="hub-section-title">Bracket</h2>
        <p className="hub-muted">Loading bracket…</p>
      </section>
    );
  }

  if (!hasKnockout || stages.length === 0) {
    return null;
  }

  return (
    <section className="hub-section">
      <h2 className="hub-section-title">Bracket</h2>
      <div className="hub-bracket">
        {stages.map((stage) => (
          <div key={stage} className="hub-bracket-round">
            <h3>{knockoutStageTitle(stage)}</h3>
            <div className="hub-bracket-matches">
              {byStage[stage].map((match) => (
                <article key={match.id} className="hub-match-card">
                  <div className="hub-match-players">
                    <div
                      className={
                        match.winner?.id &&
                        (match.player1TeamIds?.includes(match.winner.id) ||
                          match.player1?.id === match.winner.id)
                          ? "hub-match-player winner"
                          : "hub-match-player"
                      }
                    >
                      <PlayerNameLink
                        player={match.player1}
                        fallback={match.player1Placeholder || "TBD"}
                      />
                      {match.player1Score != null ? (
                        <span className="hub-score">{match.player1Score}</span>
                      ) : null}
                    </div>
                    <span className="hub-vs">vs</span>
                    <div
                      className={
                        match.winner?.id &&
                        (match.player2TeamIds?.includes(match.winner.id) ||
                          match.player2?.id === match.winner.id)
                          ? "hub-match-player winner"
                          : "hub-match-player"
                      }
                    >
                      <PlayerNameLink
                        player={match.player2}
                        fallback={match.player2Placeholder || "TBD"}
                      />
                      {match.player2Score != null ? (
                        <span className="hub-score">{match.player2Score}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="hub-match-footer">
                    <span className="hub-round-label">{match.roundLabel}</span>
                    <span
                      className={`hub-match-status status-${match.status}`}
                    >
                      {fixtureStatusLabel(match.status)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
