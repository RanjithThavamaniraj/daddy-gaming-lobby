/**
 * Generates public/sitemap.xml and public/robots.txt from the static
 * tournament registry + core public routes. Run automatically on `npm run build`.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");

const SITE_URL = (
  process.env.VITE_SITE_URL ?? "https://www.daddygaminglobby.com"
).replace(/\/$/, "");

const STATIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/tournaments", changefreq: "daily", priority: "0.9" },
  { path: "/leaderboard", changefreq: "daily", priority: "0.9" },
  { path: "/dashboard", changefreq: "weekly", priority: "0.7" },
  { path: "/legal", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "monthly", priority: "0.4" },
  { path: "/terms", changefreq: "monthly", priority: "0.4" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
];

function absolute(path) {
  if (!path || path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function loadTournamentSlugs() {
  const mod = await import(
    pathToFileURL(join(root, "src/config/tournamentRegistry.js")).href
  );
  return (mod.TOURNAMENT_REGISTRY ?? [])
    .map((row) => row.slug)
    .filter(Boolean);
}

function buildSitemap(slugs) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...STATIC_ROUTES.map((route) => ({
      loc: absolute(route.path),
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    })),
    ...slugs.map((slug) => ({
      loc: absolute(`/tournaments/${slug}`),
      lastmod: today,
      changefreq: "weekly",
      priority: "0.8",
    })),
  ];

  const body = urls
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /

# Admin is not for public indexing
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

mkdirSync(publicDir, { recursive: true });
const slugs = await loadTournamentSlugs();
writeFileSync(join(publicDir, "sitemap.xml"), buildSitemap(slugs));
writeFileSync(join(publicDir, "robots.txt"), buildRobots());
console.log(
  `SEO: wrote robots.txt + sitemap.xml (${STATIC_ROUTES.length + slugs.length} URLs) → ${SITE_URL}`
);
