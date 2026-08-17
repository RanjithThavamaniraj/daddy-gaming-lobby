/**
 * DGL supported games roadmap.
 * Future: supabase.from("games").select("*").order("sort_order")
 *
 * @typedef {object} DglGame
 * @property {string} id - URL-safe slug
 * @property {string} name
 * @property {string} category
 * @property {string} accent
 * @property {string} glow
 */

/** @type {DglGame[]} */
export const DGL_GAMES = [
  {
    id: "valorant",
    name: "Valorant",
    category: "Tactical FPS",
    accent: "#ff4655",
    glow: "rgba(255, 70, 85, 0.45)",
  },
  {
    id: "cs2",
    name: "Counter-Strike 2",
    category: "Tactical FPS",
    accent: "#de9b35",
    glow: "rgba(222, 155, 53, 0.45)",
  },
  {
    id: "fc-26",
    name: "EA SPORTS FC 26",
    category: "Sports",
    accent: "#00c853",
    glow: "rgba(0, 200, 83, 0.4)",
  },
  {
    id: "marvel-rivals",
    name: "Marvel Rivals",
    category: "Hero Shooter",
    accent: "#f5c518",
    glow: "rgba(245, 197, 24, 0.4)",
  },
  {
    id: "rocket-league",
    name: "Rocket League",
    category: "Sports",
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.4)",
  },
  {
    id: "league-of-legends",
    name: "League of Legends",
    category: "MOBA",
    accent: "#c89b3c",
    glow: "rgba(200, 155, 60, 0.45)",
  },
  {
    id: "f1",
    name: "F1",
    category: "Racing",
    accent: "#e10600",
    glow: "rgba(225, 6, 0, 0.45)",
  },
  {
    id: "among-us",
    name: "Among Us",
    category: "Social Deduction",
    accent: "#14b8a6",
    glow: "rgba(20, 184, 166, 0.4)",
  },
];
