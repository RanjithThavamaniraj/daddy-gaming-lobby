/**
 * Full tournament summary card.
 * @param {object} props
 * @param {import("../../../lib/tournamentModel").ReturnType<import("../../../lib/tournamentModel").enrichTournament>} props.tournament
 */
export default function TournamentResultsSummary({ tournament }) {
  const rows = [
    { label: "Championship", value: tournament.championshipName },
    { label: "Global Tournament", value: tournament.tournamentNumber },
    { label: "Game Championship", value: `#${tournament.gameChampionshipNumber}` },
    { label: "Game", value: tournament.game },
    { label: "Format", value: tournament.format },
    { label: "Match Type", value: tournament.matchType },
    { label: "Status", value: tournament.status },
    { label: "Prize Pool", value: tournament.prizePool },
  ];

  return (
    <section className="results-section">
      <h2 className="results-section-heading">Tournament Summary</h2>
      <div className="results-summary-card" style={{ "--accent": tournament.accent }}>
        <div className="results-summary-inner">
          <div className="results-summary-grid">
            {rows.map((row) => (
              <div className="results-summary-row" key={row.label}>
                <span className="results-summary-label">{row.label}</span>
                <span className="results-summary-value">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
