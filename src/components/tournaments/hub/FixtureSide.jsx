import PlayerNameLink from "./PlayerNameLink";

/**
 * One side of a fixture. Doubles stay a single "A + B" link.
 * Larger rosters stack every member under the stored team name.
 *
 * @param {object} props
 * @param {{ id?: string, name?: string, slug?: string | null } | null} [props.player]
 * @param {Array<{ id?: string, name?: string, slug?: string | null }>} [props.members]
 * @param {string} [props.fallback]
 * @param {string} [props.className]
 */
export default function FixtureSide({
  player,
  members = [],
  fallback = "TBD",
  className = "hub-player-link",
}) {
  if (members.length < 3) {
    return (
      <PlayerNameLink
        player={player}
        fallback={fallback}
        className={className}
      />
    );
  }

  const teamName = player?.name || fallback;

  return (
    <div className="hub-side-roster">
      <div className="hub-side-roster-title">{teamName}</div>
      <ul className="hub-side-roster-list">
        {members.map((member) => (
          <li key={member.id || member.name}>
            <PlayerNameLink player={member} className={className} />
          </li>
        ))}
      </ul>
    </div>
  );
}
