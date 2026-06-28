/**
 * DGL platform journey timeline with next-event teaser.
 * @param {object} props
 * @param {{ completed: object[]; upcoming: object[] }} props.journey
 * @param {{ tournamentNumber: string; message: string } | null} [props.upcomingTeaser]
 */
export default function DglJourney({ journey, upcomingTeaser }) {
  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Roadmap</p>
        <h2 className="section-title">
          DGL <span>Journey</span>
        </h2>
      </div>

        {upcomingTeaser ? (
        <div className="journey-teaser">
          <span className="journey-teaser-label">{upcomingTeaser.tournamentNumber}</span>
          {upcomingTeaser.championshipName ? (
            <span className="journey-teaser-championship">{upcomingTeaser.championshipName}</span>
          ) : null}
          <span className="journey-teaser-text">{upcomingTeaser.message}</span>
        </div>
      ) : null}

      <div className="journey-grid">
        <div className="journey-column">
          <h3 className="journey-heading completed-heading">Completed</h3>
          <ul className="journey-list">
            {journey.completed.map((item, index) => (
              <li
                className="journey-item completed"
                key={item.id}
                style={{ animationDelay: `${0.06 * index}s` }}
              >
                <span className="journey-marker">✓</span>
                <span className="journey-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="journey-column">
          <h3 className="journey-heading upcoming-heading">Upcoming</h3>
          <ul className="journey-list">
            {journey.upcoming.map((item, index) => (
              <li
                className="journey-item upcoming"
                key={item.id}
                style={{ animationDelay: `${0.06 * index}s` }}
              >
                <span className="journey-marker upcoming-marker" />
                <span className="journey-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
