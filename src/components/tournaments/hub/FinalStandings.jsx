import { Link } from "react-router-dom";
import { formatTournamentStartDate } from "../../../lib/tournamentLifecycle";

/**
 * Final standings after completion — champion / runner-up / semis + totals.
 *
 * @param {object} props
 * @param {object} props.tournament
 * @param {number} props.totalPlayers
 * @param {number} props.matchesPlayed
 * @param {Record<string, string>} [props.slugByName]
 */
export default function FinalStandings({
  tournament,
  totalPlayers,
  matchesPlayed,
  slugByName = {},
}) {
  const champions = tournament.championPlayers ?? [];
  const runners = tournament.runnerUpPlayers ?? [];
  const semis = tournament.semiFinalistPlayers ?? [];

  const hasAny =
    champions.length > 0 || runners.length > 0 || semis.length > 0;

  if (!hasAny && matchesPlayed === 0) {
    return null;
  }

  return (
    <section className="hub-section hub-standings">
      <h2 className="hub-section-title">Final Standings</h2>

      <div className="hub-standings-tiers">
        <div className="hub-standing-tier">
          <h3>🥇 Champion</h3>
          <StandingNames names={champions} slugByName={slugByName} />
        </div>
        <div className="hub-standing-tier">
          <h3>🥈 Runner-up</h3>
          <StandingNames names={runners} slugByName={slugByName} />
        </div>
        <div className="hub-standing-tier">
          <h3>🥉 Semi-finalists</h3>
          <StandingNames names={semis} slugByName={slugByName} />
        </div>
      </div>

      <div className="hub-standings-meta">
        <div>
          <span className="label">Total Players</span>
          <span className="value">{totalPlayers}</span>
        </div>
        <div>
          <span className="label">Matches Played</span>
          <span className="value">{matchesPlayed}</span>
        </div>
        <div>
          <span className="label">Tournament Date</span>
          <span className="value">
            {tournament.completedDate ||
              formatTournamentStartDate(
                tournament.startsAt || tournament.completedAt
              )}
          </span>
        </div>
      </div>
    </section>
  );
}

/**
 * @param {{ names: string[], slugByName: Record<string, string> }} props
 */
function StandingNames({ names, slugByName }) {
  if (!names?.length) {
    return <p className="hub-muted">—</p>;
  }
  return (
    <ul className="hub-standing-names">
      {names.map((name) => {
        const slug = slugByName[name.trim().toLowerCase()];
        return (
          <li key={name}>
            {slug ? (
              <Link to={`/players/${slug}`} className="hub-player-link">
                {name}
              </Link>
            ) : (
              <span>{name}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
