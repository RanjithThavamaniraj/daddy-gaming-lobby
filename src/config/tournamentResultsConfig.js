/**
 * Tournament pages — derived from the central registry and Supabase.
 * Future: supabase.from("v_tournaments_enriched").select("*").eq("slug", slug)
 */

export {
  getTournamentBySlug as getTournamentResults,
  getTournamentBySlug,
  getAllTournamentResultsSlugs,
} from "../lib/tournamentModel";