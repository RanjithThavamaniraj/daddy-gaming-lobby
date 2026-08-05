import { useParams } from "react-router-dom";

import PageMeta from "../components/PageMeta";
import useSupabaseData from "../hooks/useSupabaseData";
import { getTournamentBySlug } from "../config/tournamentResultsConfig";
import { fetchTournamentBySlug } from "../lib/supabase/dglRepository";
import TournamentHubView from "../components/tournaments/hub/TournamentHubView";
import RegistrationErrorBoundary from "../components/tournaments/registration/RegistrationErrorBoundary";
import { SITE_DESCRIPTION, seoDescription } from "../config/siteConfig";
import { tournamentEventJsonLd } from "../lib/seoSchema";
import {
  deriveTournamentLifecycle,
  isLifecycleCompleted,
  LIFECYCLE,
} from "../lib/tournamentLifecycle";

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

/**
 * Tournament detail route — Phase 2 live hub for every lifecycle state.
 */
export default function TournamentResults() {
  const { slug } = useParams();
  const staticTournament = getTournamentBySlug(slug);
  const tournament = useSupabaseData(
    staticTournament,
    () => fetchTournamentBySlug(slug),
    [slug]
  );

  const lifecycle =
    tournament?.lifecycle ??
    (tournament ? deriveTournamentLifecycle(tournament) : LIFECYCLE.COMING_SOON);
  const completed = tournament
    ? isLifecycleCompleted({ ...tournament, lifecycle })
    : false;

  const meta = tournamentMeta(tournament, completed ? "results" : "register");

  if (!tournament) {
    return (
      <>
        <PageMeta {...meta} />
        <div className="tournament-page" style={{ padding: "2rem" }}>
          <p>Tournament not found.</p>
          <a href="/tournaments">← Back to Tournaments</a>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta {...meta} />
      <RegistrationErrorBoundary>
        <TournamentHubView tournament={{ ...tournament, lifecycle }} />
      </RegistrationErrorBoundary>
    </>
  );
}
