import PlayerResultCard from "./PlayerResultCard";

/**
 * Runner-up team roster section.
 * @param {object} props
 * @param {string[]} props.players
 * @param {number} props.dglPoints
 */
export default function TournamentResultsRunnerUp({ players, dglPoints }) {
  return (
    <section className="results-section">
      <h2 className="results-section-heading runner-up-heading">🥈 Runner-up</h2>
      <div className="results-players-grid">
        {players.map((name, index) => (
          <PlayerResultCard
            key={name}
            name={name}
            variant="runner-up"
            dglPoints={dglPoints}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
