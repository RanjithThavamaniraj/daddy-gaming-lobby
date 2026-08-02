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
 * @property {"championship"|"saturday_showdown"} [eventType] - Defaults to "championship". Saturday Showdown gets its own burnt-orange accent and card treatment (see eventTypeConfig.js) regardless of the `accent` field below.
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
    slug: "cs2-1",
    game: "Counter Strike 2",
    gameSlug: "cs2",
    format: "5v5",
    matchType: "Best of 3",
    prizePool: "₹2,000 Team Prize",
    entryFee: "Free",
    registrationLimit: 10,
    status: "Completed",
    completedDate: "July 25, 2026",
    accent: "#de9b35",
    pointsAwarded: {
      champion: 50,
      runnerUp: 20,
    },
    championPlayers: [
      "Hackers_Tale",
      "SamF",
      "Shinigami Ishigami",
      "Lynxcreed",
      "Wolf Diedrich",
    ],
    runnerUpPlayers: [
      "g1rish",
      "saber_tooth24",
      "Bumblee_Bee",
      "Cl_me_brian",
      "Victor",
    ],
  },
  {
    number: 4,
    id: "dgl-fc26-championship-2",
    slug: "fc26-2",
    game: "EA SPORTS FC 26",
    gameSlug: "fc-26",
    championshipLabel: "FC 26",
    format: "1v1",
    matchType: "Group Stage → Knockout",
    prizePool: "₹3,000 Awarded",
    entryFee: "Free",
    registrationLimit: 16,
    status: "Completed",
    completedDate: "August 1, 2026",
    accent: "#00c853",
    pointsAwarded: {
      champion: 400,
      runnerUp: 350,
      semiFinalist: 200,
      quarterFinalist: 100,
      groupStage: 50,
    },
    championPlayers: ["ak4642"],
    runnerUpPlayers: ["VALUS_VX"],
    semiFinalistPlayers: ["suriya_sr12", "danish01769"],
    quarterFinalistPlayers: ["Pranav", "Mokey D Luffy", "viddy1485", "noisyboy96"],
    groupStagePlayers: [
      "SamF",
      "iambalas",
      "K2k",
      "Palnikumar",
      "naveen kumar",
      "Shinigami Ishigami",
      "sabaresh9801",
      "RamRoyce",
      "Niwas Khan",
    ],
  },
  {
    number: 5,
    id: "dgl-rocket-league-championship-1",
    slug: "rocket-league-1",
    game: "Rocket League",
    gameSlug: "rocket-league",
    championshipLabel: "Rocket League",
    format: "2v2",
    matchType: "Knockout",
    prizePool: "₹2,000 Team Prize",
    entryFee: "₹50 Per Player",
    status: "Coming Soon",
    accent: "#38bdf8",
    // Mirrors the DB is_featured flag — takes the Main Event slot ahead of
    // the status-priority fallback (see selectFeaturedTournament), the same
    // mechanism promote_next_tournament() uses live.
    isFeatured: true,
  },
  {
    number: 6,
    id: "dgl-valorant-saturday-showdown-1",
    slug: "valorant-saturday-showdown-1",
    game: "Valorant",
    gameSlug: "valorant",
    championshipLabel: "Valorant",
    eventType: "saturday_showdown",
    format: "2v2",
    matchType: "Knockout",
    entryFee: "Free",
    status: "Coming Soon",
    accent: "#ff4655", // overridden to burnt orange automatically — see eventTypeConfig.js
  },
  // Future: number 7 — gameSlug "valorant" → DGL Valorant Championship #2
  // Future: number 8 — gameSlug "marvel-rivals"
  // Future: number 9 — gameSlug "arc-raiders"
];
