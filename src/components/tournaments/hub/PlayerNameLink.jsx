import { Link } from "react-router-dom";

/**
 * Player name → /players/{slug}. Never exposes UUID.
 * @param {object} props
 * @param {{ name?: string, slug?: string | null } | null} [props.player]
 * @param {string} [props.fallback]
 * @param {string} [props.className]
 */
export default function PlayerNameLink({
  player,
  fallback = "TBD",
  className = "hub-player-link",
}) {
  const name = player?.name || fallback;
  if (player?.slug) {
    return (
      <Link to={`/players/${player.slug}`} className={className}>
        {name}
      </Link>
    );
  }
  return <span className={className}>{name}</span>;
}
