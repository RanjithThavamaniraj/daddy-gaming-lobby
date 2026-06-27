import { useParams } from "react-router-dom";

import TournamentResultsView from "../components/tournaments/results/TournamentResultsView";
import { getTournamentResults } from "../config/tournamentResultsConfig";

export default function TournamentResults() {
  const { slug } = useParams();
  const tournament = getTournamentResults(slug);

  return <TournamentResultsView tournament={tournament} />;
}
