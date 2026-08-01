import PlayerResultCard from "./PlayerResultCard";

/**
 * Generic tournament-progression tier section (Semi Finalists, Quarter
 * Finalists, Participants) — reuses the same neutral card style as
 * Runner-Up, since only the Champion tier gets the gold treatment. Renders
 * nothing when the tier has no players, so it's safe to include
 * unconditionally for tournaments that don't record every tier.
 * @param {object} props
 * @param {string} props.icon
 * @param {string} props.heading
 * @param {string} props.badgeLabel
 * @param {string[]} props.players
 * @param {number} [props.dglPoints]
 */
export default function TournamentResultsPlayerTier({ icon, heading, badgeLabel, players, dglPoints }) {
  if (!players?.length) return null;

  return (
    <section className="results-section">
      <h2 className="results-section-heading runner-up-heading">
        {icon} {heading}
      </h2>
      <div className="results-players-grid">
        {players.map((name, index) => (
          <PlayerResultCard
            key={name}
            name={name}
            variant="runner-up"
            badgeLabel={badgeLabel}
            dglPoints={dglPoints}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
