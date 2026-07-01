import { useParams } from "react-router-dom";

import PageMeta from "../components/PageMeta";
import useSupabaseData from "../hooks/useSupabaseData";
import { getTournamentBySlug } from "../config/tournamentResultsConfig";
import { fetchTournamentBySlug } from "../lib/supabase/dglRepository";
import TournamentResultsView from "../components/tournaments/results/TournamentResultsView";
import TournamentRegistrationView from "../components/tournaments/registration/TournamentRegistrationView";
import { SITE_DESCRIPTION } from "../config/siteConfig";

export default function TournamentResults() {
  const { slug } = useParams();
  const staticTournament = getTournamentBySlug(slug);
  const tournament = useSupabaseData(
    staticTournament,
    () => fetchTournamentBySlug(slug),
    [slug]
  );

  if (tournament && tournament.status !== "Completed") {
    return (
      <>
        <PageMeta
          title={tournament?.championshipName ?? "Tournament"}
          description={
            tournament
              ? `${tournament.championshipName} — ${tournament.game}. ${tournament.status}. Register and compete in the DGL ${tournament.championshipName}.`
              : SITE_DESCRIPTION
          }
        />
        <TournamentRegistrationView tournament={tournament} />
      </>
    );
  }

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