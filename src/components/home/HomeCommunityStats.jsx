/**
 * High-level community statistics for the homepage.
 * @param {object} props
 * @param {object[]} props.stats
 */
export default function HomeCommunityStats({ stats }) {
  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Platform Growth</p>
        <h2 className="section-title">
          Community <span>Statistics</span>
        </h2>
      </div>

      <div className="stats-bar">
        {stats.map((stat, index) => (
          <div
            className="stat-card"
            key={stat.id ?? stat.label}
            style={{ animationDelay: `${0.05 * (index + 1)}s` }}
          >
            <div className="stat-number">
              {stat.displayValue ?? stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
