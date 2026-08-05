import { useEffect, useState } from "react";
import {
  formatCountdown,
  isLifecycleClosed,
  isLifecycleCompleted,
  isLifecycleLive,
} from "../../../lib/tournamentLifecycle";

/**
 * Countdown / live / finished panel based on lifecycle.
 * Tick every second when a real start time exists so the clock stays live.
 * @param {object} props
 * @param {object} props.tournament
 */
export default function TournamentCountdown({ tournament }) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const closed = isLifecycleClosed(tournament);
  const hasStart = Boolean(
    tournament?.startsAt && !Number.isNaN(Date.parse(tournament.startsAt))
  );

  useEffect(() => {
    if (!hasStart || !closed) return undefined;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasStart, closed]);

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

  if (closed) {
    if (!hasStart) {
      return (
        <section className="hub-countdown">
          <h2>Tournament begins in</h2>
          <p className="hub-countdown-value">TBA</p>
          <p className="hub-muted">Start date will be announced soon.</p>
        </section>
      );
    }

    const countdown = formatCountdown(tournament.startsAt, nowMs);
    return (
      <section className="hub-countdown">
        <h2>Tournament begins in</h2>
        <p className="hub-countdown-value">{countdown}</p>
      </section>
    );
  }

  return null;
}
