/**
 * What is DGL — platform introduction section.
 * @param {object} props
 * @param {{ id: string; icon: string; title: string; description: string }[]} props.highlights
 */
export default function WhatIsDgl({ highlights }) {
  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Platform Overview</p>
        <h2 className="section-title">
          What is <span>DGL</span>?
        </h2>
      </div>

      <p className="section-intro">
        Daddy Gaming Lobby is a multi-game community esports platform where players compete
        in organized tournaments, earn DGL Points, climb the leaderboard, and build a
        permanent legacy in the Hall of Champions.
      </p>

      <div className="highlights-grid">
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
