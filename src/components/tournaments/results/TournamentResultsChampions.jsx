import PlayerResultCard from "./PlayerResultCard";

/**
 * Highlight section for the winning team roster.
 * @param {object} props
 * @param {string[]} props.players
 * @param {number} props.dglPoints
 */
export default function TournamentResultsChampions({ players, dglPoints }) {
  return (
    <section className="results-section champions-section-wrap">
      <div className="champions-section-inner">
        <div className="champions-glow" aria-hidden />
        <h2 className="results-section-heading champions-heading">🏆 Champions</h2>
        <div className="results-players-grid champions-grid">
          {players.map((name, index) => (
            <PlayerResultCard
              key={name}
              name={name}
              variant="champion"
              dglPoints={dglPoints}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
