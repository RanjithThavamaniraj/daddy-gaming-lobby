/**
 * Why Join DGL — feature cards section.
 * @param {object} props
 * @param {{ id: string; icon: string; title: string; description: string }[]} props.features
 */
export default function WhyJoinDgl({ features }) {
  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Player Benefits</p>
        <h2 className="section-title">
          Why Join <span>DGL</span>?
        </h2>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <article
            className="feature-card"
            key={feature.id}
            style={{ animationDelay: `${0.08 * index}s` }}
          >
            <span className="feature-icon">{feature.icon}</span>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
