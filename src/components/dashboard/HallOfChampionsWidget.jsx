/**
 * Completed tournaments list for the Titan Dashboard.
 * @param {object} props
 * @param {Array<{ id: string; name: string }>|null} props.tournaments - completed tournaments, newest first
 */
export default function HallOfChampionsWidget({ tournaments }) {
  if (!tournaments?.length) return null;

  return (
    <section className="glass-panel dashboard-widget hall-widget">
      <div className="panel-header">
        <h2 className="section-title">Completed Tournaments</h2>
        <span className="section-badge">Total Completed: {tournaments.length}</span>
      </div>

      <div className="widget-body">
        <div className="widget-meta-grid">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="widget-meta-row">
              <span className="widget-meta-value">🏆 {tournament.name} - Completed</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
