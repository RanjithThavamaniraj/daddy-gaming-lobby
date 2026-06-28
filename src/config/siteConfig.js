/** Site-wide constants for SEO, social links, and shared URLs. */

export const SITE_NAME = "Daddy Gaming Lobby";

export const SITE_DESCRIPTION =
  "India's multi-game community esports platform. Compete in DGL tournaments, earn DGL Points, and build a permanent legacy in the Hall of Champions.";

export const SITE_URL =
  import.meta.env.VITE_SITE_URL ?? "https://daddy-gaming-lobby.vercel.app";

export const DISCORD_INVITE_URL = "https://discord.gg/gf7Ecat6Ka";

export const PAGE_META = {
  home: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  dashboard: {
    title: "Titan Dashboard",
    description:
      "Your DGL command center — platform stats, supported games, community activity, and tournament previews.",
  },
  tournaments: {
    title: "Tournaments",
    description:
      "Browse DGL main events, upcoming championships, and completed tournament archives.",
  },
  leaderboard: {
    title: "Leaderboard",
    description:
      "Official DGL Points leaderboard and Hall of Champions — permanent records of every championship.",
  },
  privacy: {
    title: "Privacy Policy",
    description: "How Daddy Gaming Lobby collects, uses, and protects your information.",
  },
  terms: {
    title: "Terms of Service",
    description: "Terms and conditions for participating in Daddy Gaming Lobby events.",
  },
  notFound: {
    title: "Page Not Found",
    description: "The page you requested could not be found on Daddy Gaming Lobby.",
  },
};
