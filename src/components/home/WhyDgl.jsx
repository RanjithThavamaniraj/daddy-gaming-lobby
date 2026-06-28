/**
 * Combined platform introduction — why join DGL.
 * @param {object} props
 * @param {{ id: string; icon: string; title: string; description: string }[]} props.pillars
 */
export default function WhyDgl({ pillars }) {
  return (
    <section className="section why-dgl-section">
      <div className="section-header">
        <p className="section-eyebrow">The Platform</p>
        <h2 className="section-title">
          Why <span>DGL</span>?
        </h2>
      </div>

      <div className="why-dgl-grid">
        {pillars.map((pillar, index) => (
          <article
            className="why-dgl-card"
            key={pillar.id}
            style={{ animationDelay: `${0.06 * index}s` }}
          >
            <span className="why-dgl-icon" aria-hidden>
              {pillar.icon}
            </span>
            <h3 className="why-dgl-title">{pillar.title}</h3>
            <p className="why-dgl-desc">{pillar.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
