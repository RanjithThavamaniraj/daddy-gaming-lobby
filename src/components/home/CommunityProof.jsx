import { Link } from "react-router-dom";

/**
 * Community proof — platform stats and latest champions highlight.
 * @param {object} props
 * @param {{ stats: object[]; latestChampion: object | null }} props.proof
 */
export default function CommunityProof({ proof }) {
  const { stats, latestChampion } = proof;

  return (
    <section className="section community-proof-section">
      <div className="section-header">
        <p className="section-eyebrow">Tournament History</p>
        <h2 className="section-title">
          DGL <span>Archives</span>
        </h2>
      </div>

      <div className="community-proof-grid">
        <div className="community-proof-stats">
          {stats.map((stat, index) => (
            <div
              className="proof-stat-card"
              key={stat.id}
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <span className="proof-stat-icon" aria-hidden>
                {stat.icon}
              </span>
              <div className="proof-stat-value">
                {stat.displayValue ?? stat.value}
              </div>
              <div className="proof-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {latestChampion ? (
          <article
            className="community-proof-champion"
            style={{ "--accent": latestChampion.accent ?? "#f59e0b" }}
          >
            <p className="community-proof-champion-eyebrow">Latest Champions</p>
            <span className="community-proof-champion-badge">
              {latestChampion.tournamentNumber}
            </span>
            <h3 className="community-proof-champion-title">
              {latestChampion.championshipName}
            </h3>
            {latestChampion.resultsPath ? (
              <Link to={latestChampion.resultsPath} className="community-proof-link">
                View Results →
              </Link>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  );
}
