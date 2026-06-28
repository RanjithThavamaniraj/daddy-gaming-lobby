/**
 * Tournament results — derived from the central registry.
 * Future: supabase.from("tournament_results").select("*, players(*)")
 */

export {
  getTournamentResultsBySlug as getTournamentResults,
  getAllTournamentResultsSlugs,
} from "../lib/tournamentModel";
