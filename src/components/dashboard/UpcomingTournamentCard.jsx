/**
 * Upcoming tournament preview for the Titan Dashboard.
 * @param {object} props
 * @param {object|null} props.tournament
 */
export default function UpcomingTournamentCard({ tournament }) {
  if (!tournament) return null;

  return (
    <section
      className="glass-panel dashboard-widget upcoming-widget"
      style={{ "--accent": tournament.accent ?? "#a855f7" }}
    >
      <div className="panel-header">
        <h2 className="section-title">Upcoming Tournament</h2>
        <span className="section-badge coming-soon-badge">Coming Soon</span>
      </div>

      <div className="widget-body">
        <span className="widget-eyebrow">COMING SOON</span>
        <h3 className="widget-title">{tournament.tournamentNumber}</h3>
        <p className="widget-championship-name">{tournament.championshipName}</p>

        <div className="widget-meta-row">
          <span className="widget-meta-label">Status</span>
          <span className="widget-meta-value">{tournament.status}</span>
        </div>
      </div>
    </section>
  );
}
