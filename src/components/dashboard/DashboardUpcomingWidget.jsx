import { Link } from "react-router-dom";

import { DGL_DEFAULT_ACCENT } from "../../config/designTokens";
import {
  getLifecycleDashboardBadge,
  LIFECYCLE,
  deriveTournamentLifecycle,
} from "../../lib/tournamentLifecycle";

/**
 * Upcoming tournament preview for the Titan Dashboard.
 * Entire card links to the existing tournament hub route.
 * @param {object} props
 * @param {object|null} props.tournament
 */
export default function DashboardUpcomingWidget({ tournament }) {
  if (!tournament) return null;

  const slug = tournament.slug ?? tournament.resultsSlug ?? null;
  const href = tournament.resultsPath ?? (slug ? `/tournaments/${slug}` : null);
  if (!href) return null;

  const lifecycle =
    tournament.lifecycle ?? deriveTournamentLifecycle(tournament);
  const badge = getLifecycleDashboardBadge(tournament);
  const title =
    tournament.championshipName ?? tournament.title ?? tournament.name ?? "Tournament";

  return (
    <Link
      to={href}
      className="glass-panel dashboard-widget upcoming-widget dashboard-widget-link"
      style={{ "--accent": tournament.accent ?? DGL_DEFAULT_ACCENT }}
      aria-label={`${title} — ${badge}. Open tournament page.`}
    >
      <div className="panel-header">
        <h2 className="section-title">Upcoming Tournament</h2>
        <span
          className={`section-badge lifecycle-dashboard-badge lifecycle-dashboard-badge--${lifecycle || LIFECYCLE.COMING_SOON}`}
        >
          {badge}
        </span>
      </div>

      <div className="widget-body">
        <h3 className="widget-championship-name widget-championship-name--featured">
          {title}
        </h3>
      </div>
    </Link>
  );
}
