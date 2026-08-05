import RegisteredPlayerCard from "./RegisteredPlayerCard";
import ReserveInfoTooltip from "./ReserveInfoTooltip";

/**
 * Responsive grid of player cards (registration / reserve order).
 * @param {object} props
 * @param {Array<object> | null} props.players
 * @param {string} [props.accent]
 * @param {string} [props.title]
 * @param {boolean} [props.showReserveTooltip]
 * @param {string} [props.emptyMessage]
 */
export default function RegisteredPlayersGrid({
  players,
  accent = "#a855f7",
  title = "Registered Players",
  showReserveTooltip = false,
  emptyMessage = "No registered players yet.",
}) {
  if (players === null) {
    return (
      <section className="registered-players-section">
        <h3 className="registered-players-heading">
          {title}
          {showReserveTooltip ? <ReserveInfoTooltip /> : null}
        </h3>
        <p className="registered-players-empty">Loading players…</p>
      </section>
    );
  }

  return (
    <section className="registered-players-section">
      <h3 className="registered-players-heading">
        {title}
        <span className="registered-players-count"> ({players.length})</span>
        {showReserveTooltip ? <ReserveInfoTooltip /> : null}
      </h3>
      {players.length === 0 ? (
        <p className="registered-players-empty">{emptyMessage}</p>
      ) : (
        <div className="registered-players-grid">
          {players.map((player, index) => (
            <RegisteredPlayerCard
              key={player.id ?? player.slug ?? `${player.name}-${index}`}
              player={player}
              accent={accent}
            />
          ))}
        </div>
      )}
    </section>
  );
}
