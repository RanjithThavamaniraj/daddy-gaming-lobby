import { useParams } from "react-router-dom";

import PageMeta from "../components/PageMeta";
import useSupabaseData from "../hooks/useSupabaseData";
import { getTournamentBySlug } from "../config/tournamentResultsConfig";
import { fetchTournamentBySlug } from "../lib/supabase/dglRepository";
import TournamentResultsView from "../components/tournaments/results/TournamentResultsView";
import TournamentRegistrationView from "../components/tournaments/registration/TournamentRegistrationView";
import RegistrationErrorBoundary from "../components/tournaments/registration/RegistrationErrorBoundary";
import { SITE_DESCRIPTION, seoDescription } from "../config/siteConfig";
import { tournamentEventJsonLd } from "../lib/seoSchema";

/**
 * @param {object | null} tournament
 * @param {"register" | "results"} mode
 */
function tournamentMeta(tournament, mode) {
  if (!tournament) {
    return {
      title: mode === "results" ? "Tournament Results" : "Tournament",
      description: SITE_DESCRIPTION,
      path: undefined,
      jsonLd: null,
    };
  }

  const name = tournament.championshipName ?? "Tournament";
  const slug = tournament.slug ?? tournament.resultsSlug;
  const path = slug ? `/tournaments/${slug}` : undefined;

  const description =
    mode === "results"
      ? seoDescription(
          `Results for ${name} (${tournament.game}). Champions, DGL Points, and prize breakdown from Daddy Gaming Lobby.`
        )
      : seoDescription(
          `${name} — ${tournament.game}. ${tournament.status}. Register and compete in this Daddy Gaming Lobby event.`
        );

  return {
    title: name,
    description,
    path,
    jsonLd: tournamentEventJsonLd(tournament),
  };
}

export default function TournamentResults() {
  const { slug } = useParams();
  const staticTournament = getTournamentBySlug(slug);
  const tournament = useSupabaseData(
    staticTournament,
    () => fetchTournamentBySlug(slug),
    [slug]
  );

  if (tournament && tournament.status !== "Completed") {
    const meta = tournamentMeta(tournament, "register");
    return (
      <>
        <PageMeta {...meta} />
        <RegistrationErrorBoundary>
          <TournamentRegistrationView tournament={tournament} />
        </RegistrationErrorBoundary>
      </>
    );
  }

  const meta = tournamentMeta(tournament, "results");
  return (
    <>
      <PageMeta {...meta} />
      <TournamentResultsView tournament={tournament} />
    </>
  );
}
