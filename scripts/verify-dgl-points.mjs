/**
 * Asserts the centralized DGL Points calculator matches the global rules.
 */
import assert from "node:assert/strict";
import {
  calculateDglPoints,
  DGL_POINTS,
  DGL_POINTS_CUMULATIVE,
  DGL_POINTS_RULES,
} from "../src/config/dglPointsConfig.js";

assert.equal(DGL_POINTS_RULES, DGL_POINTS);
assert.equal(DGL_POINTS.champion, 200);
assert.equal(DGL_POINTS.runnerUp, 150);
assert.equal(DGL_POINTS.semiFinalist, 100);
assert.equal(DGL_POINTS.quarterFinalist, 50);
assert.equal(DGL_POINTS.groupStage, 50);

assert.equal(
  calculateDglPoints({
    reachedQuarterfinal: true,
    reachedSemifinal: true,
    reachedFinal: true,
    wonFinal: true,
  }),
  350,
  "knockout champion"
);
assert.equal(
  calculateDglPoints({
    reachedQuarterfinal: true,
    reachedSemifinal: true,
    reachedFinal: true,
    wonFinal: false,
  }),
  300,
  "knockout runner-up"
);
assert.equal(
  calculateDglPoints({
    reachedQuarterfinal: true,
    reachedSemifinal: true,
  }),
  150,
  "semifinalist"
);
assert.equal(calculateDglPoints({ reachedQuarterfinal: true }), 50, "quarterfinalist");
assert.equal(calculateDglPoints({ reachedGroupStage: true }), 50, "group only");
assert.equal(calculateDglPoints({}), 0, "round 1 / no stage");

assert.equal(
  calculateDglPoints({
    reachedGroupStage: true,
    reachedQuarterfinal: true,
    reachedSemifinal: true,
    reachedFinal: true,
    wonFinal: true,
  }),
  400,
  "group-stage champion"
);

assert.equal(DGL_POINTS_CUMULATIVE.champion, 350);
assert.equal(DGL_POINTS_CUMULATIVE.runnerUp, 300);
assert.equal(DGL_POINTS_CUMULATIVE.semiFinalist, 150);
assert.equal(DGL_POINTS_CUMULATIVE.quarterFinalist, 50);
assert.equal(DGL_POINTS_CUMULATIVE.groupStage, 50);

console.log("verify-dgl-points: ok");
