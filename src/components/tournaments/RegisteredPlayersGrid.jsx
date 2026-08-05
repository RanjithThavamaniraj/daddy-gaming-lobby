import RegisteredPlayerCard from "./RegisteredPlayerCard";

/**
 * Responsive grid of registered player cards (registration order).
 * @param {object} props
 * @param {Array<object> | null} props.players
 * @param {string} [props.accent]
 * @param {string} [props.title]
 */
export default function RegisteredPlayersGrid({
  players,
  accent = "#a855f7",
  title = "Registered Players",
}) {
  if (players === null) {
    return (
      <section className="registered-players-section">
        <h3>{title}</h3>
        <p className="registered-players-empty">Loading players…</p>
      </section>
    );
  }

  return (
    <section className="registered-players-section">
      <h3>
        {title}
        <span className="registered-players-count"> ({players.length})</span>
      </h3>
      {players.length === 0 ? (
        <p className="registered-players-empty">
          No players registered yet — be the first!
        </p>
      ) : (
        <div className="registered-players-grid">
          {players.map((player, index) => (
            <RegisteredPlayerCard
              key={player.slug ?? `${player.name}-${index}`}
              player={player}
              accent={accent}
            />
          ))}
        </div>
      )}
    </section>
  );
}
