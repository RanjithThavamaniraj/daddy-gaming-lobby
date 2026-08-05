/** Site-wide constants for SEO, social links, and shared URLs. */

export const SITE_NAME = "Daddy Gaming Lobby";

export const SITE_TAGLINE = "Play Together. Win Together.";

/**
 * Keep meta descriptions in the 140–160 character SEO range.
 * @param {string} text
 * @returns {string}
 */
export function seoDescription(text) {
  let value = String(text ?? "").replace(/\s+/g, " ").trim();
  if (value.length > 160) {
    value = `${value.slice(0, 157).replace(/\s+\S*$/, "").trimEnd()}…`;
  }
  if (value.length < 140) {
    const fillers = [
      " Play Together. Win Together.",
      " Join the DGL community today.",
      " Built for competitive players.",
    ];
    for (const filler of fillers) {
      if (value.length >= 140) break;
      if (value.length + filler.length <= 160) {
        value += filler;
      }
    }
  }
  return value;
}

/** Fallback / default description (also used in index.html). Target ~150 chars. */
export const SITE_DESCRIPTION = seoDescription(
  "Daddy Gaming Lobby is a competitive gaming community hosting Rocket League, Valorant, FC, Among Us and community tournaments."
);

/**
 * Canonical production origin. Override with VITE_SITE_URL when deploying
 * to a preview or alternate host.
 */
const viteEnv = import.meta.env ?? {};
export const SITE_URL = (
  viteEnv.VITE_SITE_URL ?? "https://www.daddygaminglobby.com"
).replace(/\/$/, "");

/** Primary DGL brand blue (logo / PWA theme). */
export const SITE_THEME_COLOR = "#5EA9FF";

/** Absolute logo URL for Organization schema. */
export const SITE_LOGO_URL = `${SITE_URL}/images/logo/dgl-logo.jpg`;

/** Social share image (1200×630). */
export const SITE_OG_IMAGE = `${SITE_URL}/images/logo/dgl-og.jpg`;

export const DISCORD_INVITE_URL = "https://discord.gg/gf7Ecat6Ka";

/**
 * Public social profiles for Organization.sameAs.
 * Add Instagram / YouTube URLs here when official accounts are live.
 * @type {string[]}
 */
export const SITE_SAME_AS = [DISCORD_INVITE_URL];

/**
 * Absolute URL for a site path.
 * @param {string} [path="/"]
 * @returns {string}
 */
export function absoluteUrl(path = "/") {
  if (!path || path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const PAGE_META = {
  home: {
    title: "Home",
    path: "/",
    description: seoDescription(
      "Daddy Gaming Lobby is a competitive gaming community hosting Rocket League, Valorant, FC, Among Us and community tournaments."
    ),
  },
  dashboard: {
    title: "Titan Dashboard",
    path: "/dashboard",
    description: seoDescription(
      "Titan Dashboard shows DGL platform stats, featured games, community activity, and upcoming tournament previews."
    ),
  },
  tournaments: {
    title: "Tournaments",
    path: "/tournaments",
    description: seoDescription(
      "Browse DGL main events, open registrations, and completed championship archives across Rocket League, Valorant, FC and more."
    ),
  },
  leaderboard: {
    title: "Leaderboard",
    path: "/leaderboard",
    description: seoDescription(
      "View the official DGL Points leaderboard and Hall of Champions — permanent records from every DGL championship."
    ),
  },
  privacy: {
    title: "Privacy Policy",
    path: "/privacy",
    description: seoDescription(
      "Read how Daddy Gaming Lobby collects, uses, and protects your Discord, gaming profile, and tournament platform data."
    ),
  },
  terms: {
    title: "Terms of Service",
    path: "/terms",
    description: seoDescription(
      "Review Daddy Gaming Lobby terms for tournament play, DGL Points, prizes, fair play rules, and community platform use."
    ),
  },
  legal: {
    title: "Legal",
    path: "/legal",
    description: seoDescription(
      "Daddy Gaming Lobby legal hub covering privacy policy, terms of service, tournament rules, and player contact details."
    ),
  },
  contact: {
    title: "Contact",
    path: "/contact",
    description: seoDescription(
      "Contact Daddy Gaming Lobby via Discord for tournament support, partnerships, and community help from the DGL team."
    ),
  },
  notFound: {
    title: "Page Not Found",
    path: undefined,
    description: seoDescription(
      "The page you requested was not found on Daddy Gaming Lobby. Browse tournaments, the leaderboard, or return home."
    ),
    noindex: true,
  },
};
