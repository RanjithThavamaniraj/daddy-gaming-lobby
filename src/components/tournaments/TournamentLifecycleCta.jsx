import { Link } from "react-router-dom";

import { resolveTournamentLifecycleCta } from "../../lib/tournamentLifecycle";
import { isRegisteredForTournament } from "../../lib/registrationSession";

/**
 * Shared lifecycle-driven CTA for Featured / Next / Upcoming cards.
 * Tournament Series branding must never change this button.
 *
 * @param {object} props
 * @param {object} props.tournament
 * @param {string} [props.className]
 */
export default function TournamentLifecycleCta({
  tournament,
  className = "cyber-btn primary",
}) {
  const alreadyRegistered = isRegisteredForTournament(tournament?.id);
  const cta = resolveTournamentLifecycleCta(tournament, { alreadyRegistered });

  if (cta.disabled || !cta.href) {
    return (
      <button
        type="button"
        className={`cyber-btn disabled${cta.kind === "registered" ? " registered-cta" : ""}`}
        disabled
      >
        <span>{cta.label}</span>
      </button>
    );
  }

  if (cta.external) {
    return (
      <a
        href={cta.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{cta.label}</span>
      </a>
    );
  }

  return (
    <Link to={cta.href} className={className}>
      <span>{cta.label}</span>
    </Link>
  );
}
