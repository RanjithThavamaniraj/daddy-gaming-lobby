/**
 * Display-only: strip the leading "DGL " brand prefix inside this widget.
 * @param {string} name
 * @returns {string}
 */
function stripDglPrefix(name) {
  return name.startsWith("DGL ") ? name.slice(4) : name;
}

/**
 * Completed tournaments list for the Titan Dashboard.
 * @param {object} props
 * @param {Array<{ id: string; name: string; completedDate?: string|null }>|null} props.tournaments - completed tournaments, newest first
 */
export default function HallOfChampionsWidget({ tournaments }) {
  if (!tournaments?.length) return null;

  return (
    <section className="glass-panel dashboard-widget hall-widget">
      <div className="panel-header">
        <h2 className="section-title">Completed Tournaments - {tournaments.length}</h2>
      </div>

      <div className="widget-body">
        <ul className="completed-list">
          {tournaments.map((tournament) => (
            <li key={tournament.id} className="completed-list-item">
              <span className="widget-meta-value">
                🏆 {stripDglPrefix(tournament.name)}
              </span>
              {tournament.completedDate ? (
                <span className="completed-list-date">{tournament.completedDate}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
