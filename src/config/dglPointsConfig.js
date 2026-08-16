/**
 * Central DGL Points source of truth.
 *
 * Stage increments live in `DGL_POINTS` / `DGL_POINTS_RULES`.
 * Cumulative totals for a player's highest stage are produced only by
 * `calculateDglPoints` — do not re-add these numbers in pages or components.
 *
 * Stored awards (`tournament_placements.points_awarded`) are already
 * cumulative; the leaderboard sums `player_points_ledger`.
 *
 * DB reference copy: public.dgl_points_rules (active row) and
 * public.dgl_calculate_points().
 */

export const DGL_POINTS = {
  champion: 200,
  runnerUp: 150,
  semiFinalist: 100,
  quarterFinalist: 50,
  groupStage: 50,
  thirdPlace: 10,
};

/** Preferred alias — same object as `DGL_POINTS`. */
export const DGL_POINTS_RULES = DGL_POINTS;

/**
 * Cumulative DGL Points for one tournament, from stages actually reached.
 * Champion and runner-up are mutually exclusive.
 *
 * @param {object} [stages]
 * @param {boolean} [stages.reachedGroupStage]
 * @param {boolean} [stages.reachedQuarterfinal]
 * @param {boolean} [stages.reachedSemifinal]
 * @param {boolean} [stages.reachedFinal]
 * @param {boolean} [stages.wonFinal]
 * @returns {number}
 */
export function calculateDglPoints({
  reachedGroupStage = false,
  reachedQuarterfinal = false,
  reachedSemifinal = false,
  reachedFinal = false,
  wonFinal = false,
} = {}) {
  let total = 0;
  if (reachedGroupStage) total += DGL_POINTS.groupStage;
  if (reachedQuarterfinal) total += DGL_POINTS.quarterFinalist;
  if (reachedSemifinal) total += DGL_POINTS.semiFinalist;
  if (wonFinal) total += DGL_POINTS.champion;
  else if (reachedFinal) total += DGL_POINTS.runnerUp;
  return total;
}

/**
 * Default knockout path (QF → SF → Final) with no group stage.
 * Use when a results row has no stored `points_awarded` yet.
 * Tournaments with a group stage add `DGL_POINTS.groupStage` via
 * `calculateDglPoints({ reachedGroupStage: true, ... })`.
 */
export const DGL_POINTS_CUMULATIVE = {
  champion: calculateDglPoints({
    reachedQuarterfinal: true,
    reachedSemifinal: true,
    reachedFinal: true,
    wonFinal: true,
  }),
  runnerUp: calculateDglPoints({
    reachedQuarterfinal: true,
    reachedSemifinal: true,
    reachedFinal: true,
    wonFinal: false,
  }),
  semiFinalist: calculateDglPoints({
    reachedQuarterfinal: true,
    reachedSemifinal: true,
  }),
  quarterFinalist: calculateDglPoints({
    reachedQuarterfinal: true,
  }),
  groupStage: calculateDglPoints({
    reachedGroupStage: true,
  }),
  thirdPlace: DGL_POINTS.thirdPlace,
};

/** Legend copy — stage increments, not cumulative totals. */
export const DGL_POINTS_LEGEND = [
  { icon: "🏆", label: "Champion", points: DGL_POINTS.champion },
  { icon: "🥈", label: "Runner-Up", points: DGL_POINTS.runnerUp },
  { icon: "🥉", label: "Semi Final", points: DGL_POINTS.semiFinalist },
  { icon: "🎯", label: "Quarter Final", points: DGL_POINTS.quarterFinalist },
  { icon: "👥", label: "Group Stage", points: DGL_POINTS.groupStage },
];
