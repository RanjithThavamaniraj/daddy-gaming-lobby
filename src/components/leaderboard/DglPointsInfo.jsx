const DGL_POINTS_TIERS = [
  { icon: "🏆", label: "Champion", points: 200 },
  { icon: "🥈", label: "Runner-Up", points: 150 },
  { icon: "🥉", label: "Semi Final", points: 100 },
  { icon: "🎯", label: "Quarter Final", points: 50 },
  { icon: "👥", label: "Group Stage", points: 50 },
];

/**
 * DGL Points progression reference card — explains how the cumulative
 * points system works. The DGL Points Leaderboard below is the single
 * source of truth for player totals; this card is informational only.
 */
export default function DglPointsInfo() {
  return (
    <section className="hall-section">
      <h2 className="section-heading hall-section-heading">🏆 DGL Points</h2>
      <article className="hall-card" style={{ "--accent": "#a855f7" }}>
        <div className="card-border" aria-hidden />
        <div className="card-shine" aria-hidden />
        <div className="card-glow" aria-hidden />
        <div className="hall-card-inner">
          <div className="hall-meta-grid">
            {DGL_POINTS_TIERS.map((tier) => (
              <div className="hall-meta-box" key={tier.label}>
                <span className="hall-meta-label">
                  {tier.icon} {tier.label}
                </span>
                <span className="hall-meta-value hall-accent">+{tier.points} DGL Points</span>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
