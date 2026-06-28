/**
 * Single source of truth for all DGL tournaments.
 * Add new tournaments here — numbers are permanent and auto-increment.
 * Future: replace with supabase.from("tournaments").select("*")
 *
 * @typedef {object} TournamentRecord
 * @property {number} number - Permanent tournament number (never reassign)
 * @property {string} id
 * @property {string} [slug] - URL slug for dedicated results page
 * @property {string} name
 * @property {string} game
 * @property {string} gameSlug
 * @property {string} [format]
 * @property {string} [matchType]
 * @property {string} [prizePool]
 * @property {"Completed"|"Coming Soon"|"Active"} status
 * @property {string} [completedDate]
 * @property {string} accent
 * @property {string[]} [championPlayers]
 * @property {string[]} [runnerUpPlayers]
 */

/** @type {TournamentRecord[]} */
export const TOURNAMENT_REGISTRY = [
  {
    number: 1,
    id: "dgl-valorant-championship-1",
    slug: "valorant-1",
    name: "DGL Valorant Championship #1",
    game: "Valorant",
    gameSlug: "valorant",
    format: "5v5",
    matchType: "Best of 3",
    prizePool: "₹1,000 Awarded",
    status: "Completed",
    completedDate: "June 27, 2026",
    accent: "#ff4655",
    championPlayers: [
      "Girish",
      "Bumble_Bee",
      "cl_me_Brian",
      "Mrbean",
      "Victor",
    ],
    runnerUpPlayers: [
      "5am0anth0r",
      "Diddstein",
      "mike_",
      "St0rm",
      "Thelonewolf",
    ],
  },
  {
    number: 2,
    id: "dgl-cs2-championship-1",
    name: "DGL CS2 Championship #1",
    game: "CS2",
    gameSlug: "cs2",
    status: "Coming Soon",
    accent: "#de9b35",
  },
  // Future: Tournament #3 — DGL FC26 Championship #1
  // Future: Tournament #4 — Marvel Rivals Championship #1
  // Future: Tournament #5 — Rocket League Championship #1
  // Future: Tournament #6 — Arc Raiders Championship #1
];
