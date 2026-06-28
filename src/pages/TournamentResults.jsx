import { useParams } from "react-router-dom";

import TournamentResultsView from "../components/tournaments/results/TournamentResultsView";
import PageMeta from "../components/PageMeta";
import { getTournamentResults } from "../config/tournamentResultsConfig";
import { SITE_DESCRIPTION } from "../config/siteConfig";

export default function TournamentResults() {
  const { slug } = useParams();
  const tournament = getTournamentResults(slug);

  return (
    <>
      <PageMeta
        title={tournament?.championshipName ?? "Tournament Results"}
        description={
          tournament
            ? `Results for ${tournament.championshipName} — champions, DGL Points, and prize breakdown.`
            : SITE_DESCRIPTION
        }
      />
      <TournamentResultsView tournament={tournament} />
    </>
  );
}
