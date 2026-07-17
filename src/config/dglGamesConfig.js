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
    id: "apex-legends",
    name: "Apex Legends",
    category: "Battle Royale",
    accent: "#da2f3d",
    glow: "rgba(218, 47, 61, 0.45)",
  },
  {
    id: "arc-raiders",
    name: "Arc Raiders",
    category: "Extraction",
    accent: "#ff6b4a",
    glow: "rgba(255, 107, 74, 0.45)",
  },
  {
    id: "delta-force",
    name: "Delta Force",
    category: "Tactical FPS",
    accent: "#4ade80",
    glow: "rgba(74, 222, 128, 0.4)",
  },
  {
    id: "rainbow-six-siege",
    name: "Rainbow Six Siege",
    category: "Tactical FPS",
    accent: "#f97316",
    glow: "rgba(249, 115, 22, 0.45)",
  },
  {
    id: "rocket-league",
    name: "Rocket League",
    category: "Sports",
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.4)",
  },
  {
    id: "pubg",
    name: "PUBG: Battlegrounds",
    category: "Battle Royale",
    accent: "#facc15",
    glow: "rgba(250, 204, 21, 0.4)",
  },
  {
    id: "among-us",
    name: "Among Us",
    category: "Social Deduction",
    accent: "#14b8a6",
    glow: "rgba(20, 184, 166, 0.4)",
  },
  {
    id: "fall-guys",
    name: "Fall Guys",
    category: "Party Platformer",
    accent: "#ec4899",
    glow: "rgba(236, 72, 153, 0.4)",
  },
];
