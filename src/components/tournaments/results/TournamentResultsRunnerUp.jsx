import PlayerResultCard from "./PlayerResultCard";

/**
 * Runner-up team roster section.
 * @param {object} props
 * @param {string[]} props.players
 */
export default function TournamentResultsRunnerUp({ players }) {
  return (
    <section className="results-section">
      <h2 className="results-section-heading runner-up-heading">🥈 Runner-Up</h2>
      <div className="results-players-grid">
        {players.map((name, index) => (
          <PlayerResultCard
            key={name}
            name={name}
            variant="runner-up"
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
