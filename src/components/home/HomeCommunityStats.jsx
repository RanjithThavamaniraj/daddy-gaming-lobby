import { Link } from "react-router-dom";

/**
 * High-level community statistics with funnel to Dashboard.
 * @param {object} props
 * @param {object[]} props.stats
 * @param {string} [props.intro]
 */
export default function HomeCommunityStats({ stats, intro }) {
  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Platform Growth</p>
        <h2 className="section-title">
          Community <span>Statistics</span>
        </h2>
      </div>

      {intro ? <p className="section-intro section-intro-compact">{intro}</p> : null}

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

      <div className="section-footnote">
        <Link to="/dashboard" className="section-footnote-link">
          Explore the full Titan Dashboard →
        </Link>
      </div>
    </section>
  );
}
