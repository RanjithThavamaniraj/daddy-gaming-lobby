/**
 * Team 1…N occupancy board — Main vs Substitutes.
 *
 * @param {object} props
 * @param {Array<{ name: string; mains: object[]; substitutes: object[]; taken?: boolean }>} props.slots
 * @param {number} props.mainSize
 * @param {number} props.substituteSize
 * @param {string | null} [props.selectedName]
 * @param {(slot: object) => void} [props.onSelect]
 */
export default function TeamSlotRoster({
  slots = [],
  mainSize,
  substituteSize,
  selectedName = null,
  onSelect,
}) {
  const selectable = typeof onSelect === "function";

  return (
    <div className="team-slot-board">
      <h3>Team Slots</h3>
      <div className="team-slot-grid">
        {slots.map((slot) => {
          const taken = Boolean(slot.taken || slot.mains?.length);
          const selected = selectedName === slot.name;
          const className = `team-slot-card${taken ? " taken" : ""}${
            selected ? " selected" : ""
          }`;
          const mainCount = slot.mains?.length ?? 0;
          const subCount = slot.substitutes?.length ?? 0;
          const label = String(slot.name || "").toUpperCase();
          const body = (
            <>
              <h4 className="team-slot-title">{label}</h4>
              <p className="team-slot-count">
                Main: {mainCount}/{mainSize}
              </p>
              <p className="team-slot-count">
                Substitutes: {subCount}/{substituteSize}
              </p>
              {taken ? (
                <p className="team-slot-status">Taken</p>
              ) : selectable ? (
                <p className="team-slot-status">Available</p>
              ) : null}
              {mainCount > 0 ? (
                <ul className="team-slot-names">
                  {slot.mains.map((player) => (
                    <li key={`main-${player.playerId ?? player.name}`}>
                      {player.name}
                    </li>
                  ))}
                </ul>
              ) : null}
              {subCount > 0 ? (
                <ul className="team-slot-names team-slot-names--subs">
                  {slot.substitutes.map((player) => (
                    <li key={`sub-${player.playerId ?? player.name}`}>
                      Sub · {player.name}
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          );

          if (selectable && !taken) {
            return (
              <button
                key={slot.id ?? slot.name}
                type="button"
                className={className}
                onClick={() => onSelect(slot)}
              >
                {body}
              </button>
            );
          }

          return (
            <article key={slot.id ?? slot.name} className={className}>
              {body}
            </article>
          );
        })}
      </div>
    </div>
  );
}
