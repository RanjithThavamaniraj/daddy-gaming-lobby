/**
 * Central DGL Points award values — the tournament-progression standard.
 * Points are cumulative: a player's total reflects every stage they
 * reached (see supabase/migrations/20260801100000_dgl_points_progression_system.sql).
 * Future: supabase.from("dgl_points_rules").select("*").single()
 */
export const DGL_POINTS = {
  champion: 200,
  runnerUp: 150,
  semiFinalist: 100,
  quarterFinalist: 50,
  groupStage: 50,
  thirdPlace: 10,
};
