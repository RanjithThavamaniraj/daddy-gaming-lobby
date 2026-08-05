import {
  formatCountdown,
  isLifecycleClosed,
  isLifecycleCompleted,
  isLifecycleLive,
} from "../../../lib/tournamentLifecycle";

/**
 * Countdown / live / finished panel based on lifecycle.
 * @param {object} props
 * @param {object} props.tournament
 */
export default function TournamentCountdown({ tournament }) {
  if (isLifecycleLive(tournament)) {
    return (
      <section className="hub-countdown hub-countdown-live">
        <h2>🔴 LIVE NOW</h2>
        <p>Matches are in progress. Follow the bracket and live results below.</p>
      </section>
    );
  }

  if (isLifecycleCompleted(tournament)) {
    return (
      <section className="hub-countdown hub-countdown-done">
        <h2>Tournament Finished</h2>
        <p>Final standings and the full bracket remain available below.</p>
      </section>
    );
  }

  if (isLifecycleClosed(tournament)) {
    const countdown = formatCountdown(tournament.startsAt);
    return (
      <section className="hub-countdown">
        <h2>Tournament begins in</h2>
        <p className="hub-countdown-value">{countdown}</p>
        {countdown === "TBA" ? (
          <p className="hub-muted">Start date will be announced soon.</p>
        ) : null}
      </section>
    );
  }

  return null;
}
