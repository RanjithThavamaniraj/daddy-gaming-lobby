import TournamentPresentationCard from "./TournamentPresentationCard";

/**
 * Next Tournament — medium version of the Main Event hero.
 * @param {object} props
 * @param {object} props.tournament
 */
export default function NextTournamentCard({ tournament }) {
  if (!tournament) return null;

  return (
    <section className="featured-section">
      <h2 className="section-heading">Next Tournament</h2>
      <TournamentPresentationCard tournament={tournament} variant="next" />
    </section>
  );
}
