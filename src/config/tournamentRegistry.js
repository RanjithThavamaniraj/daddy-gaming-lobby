/**
 * Single source of truth for all DGL tournaments.
 * Add new tournaments here — global numbers are permanent and auto-increment.
 * Championship names are derived from game + per-game sequence (see tournamentModel).
 * Future: replace with supabase.from("tournaments").select("*")
 *
 * @typedef {object} TournamentRecord
 * @property {number} number - Permanent global tournament number (never reassign)
 * @property {string} id
 * @property {string} [slug] - URL slug for dedicated results page
 * @property {string} game - Display game name (e.g. "Valorant", "CS2")
 * @property {string} gameSlug
 * @property {string} [championshipLabel] - Used in "DGL {label} Championship #N" (defaults to `game`)
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
    id: "dgl-fc26-championship-1",
    game: "FC 26",
    gameSlug: "fc-26",
    championshipLabel: "FC 26",
    status: "Coming Soon",
    accent: "#00c853",
  },
  {
    number: 3,
    id: "dgl-cs2-championship-1",
    game: "CS2",
    gameSlug: "cs2",
    status: "Coming Soon",
    accent: "#de9b35",
  },
  // Future: number 4 — gameSlug "valorant" → DGL Valorant Championship #2
  // Future: number 5 — gameSlug "marvel-rivals"
  // Future: number 6 — gameSlug "arc-raiders"
];
