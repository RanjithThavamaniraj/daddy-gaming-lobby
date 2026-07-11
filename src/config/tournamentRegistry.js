/**
 * Static tournament registry — development and offline fallback.
 * When Supabase is configured and reachable, pages load live data from
 * src/lib/supabase/dglRepository.js instead. Remove this fallback in a
 * future release once Supabase is fully validated in production.
 *
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
 * @property {string} [entryFee] - Display string e.g. "Free"
 * @property {"Completed"|"Coming Soon"|"Registrations Open"|"Live"} status
 * @property {string} [completedDate]
 * @property {string} accent
 * @property {string[]} [championPlayers]
 * @property {string[]} [runnerUpPlayers]
 * @property {{ champion?: number; runnerUp?: number; thirdPlace?: number }} [pointsAwarded] - Per-tournament override; missing fields fall back to DGL_POINTS
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
    pointsAwarded: {
      champion: 50,
      runnerUp: 20,
    },
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
    slug: "fc26-1",
    game: "EA SPORTS FC 26",
    gameSlug: "fc-26",
    championshipLabel: "FC 26",
    format: "11v11",
    matchType: "Best of 3",
    prizePool: "₹2,000",
    entryFee: "Free",
    status: "Completed",
    completedDate: "July 11, 2026",
    accent: "#00c853",
    pointsAwarded: {
      champion: 150,
      runnerUp: 100,
    },
    championPlayers: [
      "viddy1485",
      "noisyboy96",
      "sabaresh9801",
      "ironfist3525",
      "iambalas",
      "ak4642",
      "danish01769",
      "Ash4U",
      "K2k",
      "vinsonxavier12",
    ],
    runnerUpPlayers: [
      "atlas.key",
      "Limbo",
      "Naveen kumar",
      "Frez",
      "Richie",
      "Palnikumar",
      "Herooo",
      "Jai",
    ],
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
