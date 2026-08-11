import TournamentPresentationCard from "./TournamentPresentationCard";

/**
 * Featured / Main Event tournament hero.
 * @param {object} props
 * @param {object} props.tournament
 * @param {number} [props.activeTournamentCount=0]
 */
export default function FeaturedTournament({
  tournament,
  activeTournamentCount = 0,
  openRegistrationCount = activeTournamentCount,
}) {
  if (!tournament) return null;

  const liveTournamentCount = activeTournamentCount || openRegistrationCount;
  const showLiveCount = liveTournamentCount >= 2;

  return (
    <section className="featured-section">
      <h2 className="section-heading">
        Main Event
        {showLiveCount ? (
          <span className="status-badge-custom live">
            LIVE NOW • {liveTournamentCount}
          </span>
        ) : null}
      </h2>
      <TournamentPresentationCard tournament={tournament} variant="main" />
    </section>
  );
}
