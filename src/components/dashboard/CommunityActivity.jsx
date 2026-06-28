/**
 * Community activity feed for the Titan Dashboard.
 * @param {object} props
 * @param {object[]} props.items
 */
export default function CommunityActivity({ items }) {
  return (
    <section className="glass-panel activity-panel">
      <div className="panel-header">
        <h2 className="section-title">Community Activity</h2>
        <span className="section-badge">Platform</span>
      </div>

      <div className="activity-list">
        {items.map((item, index) => (
          <div key={item.id ?? index}>
            <div
              className={`activity-card type-${item.type} ${index === 0 ? "live-pulse" : ""}`}
            >
              <div className="activity-text">{item.text}</div>
              <div className="activity-time">{item.time}</div>
            </div>
            {index < items.length - 1 ? <div className="activity-divider" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
