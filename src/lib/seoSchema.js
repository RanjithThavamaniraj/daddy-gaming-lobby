import {
  DISCORD_INVITE_URL,
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_SAME_AS,
  SITE_URL,
  absoluteUrl,
  seoDescription,
} from "../config/siteConfig";

/**
 * @returns {object} Organization JSON-LD for the homepage
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO_URL,
    sameAs: SITE_SAME_AS,
    description:
      "India's multi-game community esports platform hosting competitive tournaments.",
  };
}

/**
 * @param {object} tournament
 * @returns {object|null}
 */
export function tournamentEventJsonLd(tournament) {
  if (!tournament) return null;

  const slug = tournament.slug ?? tournament.resultsSlug;
  const path = slug ? `/tournaments/${slug}` : "/tournaments";
  const name = tournament.championshipName ?? tournament.title ?? tournament.name;
  const startDate =
    toIsoDate(tournament.startDate) ??
    toIsoDate(tournament.completedDate) ??
    undefined;

  /** @type {Record<string, unknown>} */
  const event = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description: seoDescription(
      `${name} — ${tournament.game ?? "DGL"} ${tournament.status ?? "tournament"}. Join Daddy Gaming Lobby.`
    ),
    url: absoluteUrl(path),
    image: SITE_OG_IMAGE,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: mapEventStatus(tournament.status),
    location: {
      "@type": "VirtualLocation",
      url: absoluteUrl(path),
      name: "Online",
    },
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: SITE_LOGO_URL,
    },
  };

  if (startDate) event.startDate = startDate;
  if (tournament.game) {
    event.about = {
      "@type": "Thing",
      name: tournament.game,
    };
  }

  return event;
}

/**
 * @returns {object}
 */
export function leaderboardCollectionJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Leaderboard | ${SITE_NAME}`,
    description: seoDescription(
      "Official DGL Points leaderboard and Hall of Champions for Daddy Gaming Lobby."
    ),
    url: absoluteUrl("/leaderboard"),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

/**
 * @param {string | undefined} status
 * @returns {string}
 */
function mapEventStatus(status) {
  switch (status) {
    case "Completed":
      return "https://schema.org/EventScheduled";
    case "Live":
      return "https://schema.org/EventScheduled";
    case "Registrations Open":
      return "https://schema.org/EventScheduled";
    case "Coming Soon":
      return "https://schema.org/EventScheduled";
    default:
      return "https://schema.org/EventScheduled";
  }
}

/**
 * Best-effort parse of labels like "June 27, 2026" into ISO dates.
 * @param {string | undefined | null} value
 * @returns {string | null}
 */
function toIsoDate(value) {
  if (!value || typeof value !== "string") return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

/** Exported for contact/legal pages that mention Discord. */
export { DISCORD_INVITE_URL };
