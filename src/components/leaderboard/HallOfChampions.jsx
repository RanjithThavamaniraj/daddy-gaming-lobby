import HallOfChampionsCard from "./HallOfChampionsCard";

/**
 * Hall of Champions section — one card per completed tournament.
 * @param {object} props
 * @param {object[]} props.tournaments
 */
export default function HallOfChampions({ tournaments }) {
  return (
    <section className="hall-section">
      <h2 className="section-heading hall-section-heading">🏆 Hall of Champions</h2>
      <div className="hall-grid">
        {tournaments.map((tournament, index) => (
          <HallOfChampionsCard key={tournament.slug} tournament={tournament} index={index} />
        ))}
      </div>
    </section>
  );
}
