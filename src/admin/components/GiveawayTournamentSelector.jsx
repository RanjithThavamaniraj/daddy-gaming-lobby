/**
 * Multi-select official tournaments for giveaway eligibility.
 * @param {object} props
 * @param {{ id: string, label: string, game: string, status: string }[]} props.tournaments
 * @param {string[]} props.selectedIds
 * @param {(ids: string[]) => void} props.onChange
 * @param {string} [props.error]
 */
export default function GiveawayTournamentSelector({
  tournaments,
  selectedIds,
  onChange,
  error,
}) {
  const selected = new Set(selectedIds);

  function toggle(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  }

  return (
    <div className={`admin-form-field${error ? " has-error" : ""}`}>
      <span className="admin-toolbar-label">Eligible Tournaments *</span>
      <p className="admin-form-hint">
        Distinct registered players across these tournaments become giveaway
        entries (one entry per player).
      </p>
      <div className="admin-tournament-selector" role="group" aria-label="Tournaments">
        {tournaments.length === 0 ? (
          <p className="admin-form-hint">No tournaments available.</p>
        ) : (
          tournaments.map((tournament) => (
            <label key={tournament.id} className="admin-tournament-option">
              <input
                type="checkbox"
                checked={selected.has(tournament.id)}
                onChange={() => toggle(tournament.id)}
              />
              <span>
                <span className="admin-tournament-option-label">
                  {tournament.label}
                </span>
                <span className="admin-tournament-option-meta">
                  {tournament.game} · {tournament.status}
                </span>
              </span>
            </label>
          ))
        )}
      </div>
      {error ? <p className="admin-form-error">{error}</p> : null}
    </div>
  );
}
