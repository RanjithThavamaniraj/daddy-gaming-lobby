const DGL_POINTS_TIERS = [
  { icon: "🥇", label: "Champion", points: 200 },
  { icon: "🥈", label: "Runner-Up", points: 150 },
  { icon: "🥉", label: "Semi Final", points: 100 },
  { icon: "🎯", label: "Quarter Final", points: 50 },
  { icon: "👥", label: "Group Stage", points: 50 },
];

/**
 * Compact DGL Points legend — a quick reference for how points are earned.
 * The DGL Points Leaderboard below is the single source of truth for player
 * totals; this bar is informational only, kept deliberately small so the
 * leaderboard stays the primary focus of the page.
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
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.5rem 0.9rem",
            }}
          >
            {DGL_POINTS_TIERS.map((tier, i) => (
              <span
                key={tier.label}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                {i > 0 ? (
                  <span className="hall-meta-label" aria-hidden>
                    •
                  </span>
                ) : null}
                <span className="hall-meta-value">
                  {tier.icon} {tier.label}
                </span>
                <span className="hall-meta-value hall-accent">+{tier.points}</span>
              </span>
            ))}
          </div>
          <p
            className="hall-meta-label"
            style={{ textTransform: "none", letterSpacing: "0.01em", marginTop: "0.75rem" }}
          >
            Points are cumulative. Players earn points for every stage they reach.
          </p>
        </div>
      </article>
    </section>
  );
}
