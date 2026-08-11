import TournamentPresentationCard from "./TournamentPresentationCard";

/**
 * Compact upcoming tournament card — same DGL hero system, smaller scale.
 * @param {object} props
 * @param {object} props.tournament
 */
export default function UpcomingTournamentCard({ tournament }) {
  if (!tournament) return null;

  return (
    <TournamentPresentationCard
      tournament={tournament}
      variant="compact"
      index={tournament.index ?? 0}
    />
  );
}
