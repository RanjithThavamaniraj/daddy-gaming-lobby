import AnimatedNumber from "./AnimatedNumber";

/**
 * Platform statistics cards for the Titan Dashboard.
 * @param {object} props
 * @param {object[]} props.stats
 */
export default function DashboardStats({ stats }) {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div className="stat-card" key={stat.id ?? stat.label}>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-number">
            {stat.displayValue ?? (
              <>
                <AnimatedNumber value={stat.value} duration={1500 + index * 200} />
                {stat.suffix}
              </>
            )}
          </div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
