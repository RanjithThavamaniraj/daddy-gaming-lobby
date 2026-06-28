/**
 * What is DGL — platform introduction (mechanics & identity).
 * @param {object} props
 * @param {string} props.intro
 * @param {{ id: string; icon: string; title: string; description: string }[]} props.highlights
 */
export default function WhatIsDgl({ intro, highlights }) {
  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Platform Overview</p>
        <h2 className="section-title">
          What is <span>DGL</span>?
        </h2>
      </div>

      <p className="section-intro">{intro}</p>

      <div className="highlights-grid pillars-grid">
        {highlights.map((item, index) => (
          <article
            className="highlight-card"
            key={item.id}
            style={{ animationDelay: `${0.08 * index}s` }}
          >
            <span className="highlight-icon">{item.icon}</span>
            <h3 className="highlight-title">{item.title}</h3>
            <p className="highlight-desc">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
