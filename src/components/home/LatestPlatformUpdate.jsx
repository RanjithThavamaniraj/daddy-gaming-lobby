/**
 * Compact platform announcement strip below the hero.
 * @param {object} props
 * @param {{ highlights: { id: string; icon: string; text: string }[]; nextAnnouncement: { label: string; title: string } | null } | null} props.update
 */
export default function LatestPlatformUpdate({ update }) {
  if (!update) return null;

  const { highlights, nextAnnouncement } = update;

  return (
    <section className="section section-compact platform-update" aria-label="Latest platform update">
      <div className="platform-update-inner">
        <div className="platform-update-highlights">
          {highlights.map((item, index) => (
            <div
              className="platform-update-item"
              key={item.id}
              style={{ animationDelay: `${0.05 * index}s` }}
            >
              <span className="platform-update-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="platform-update-text">{item.text}</span>
            </div>
          ))}
        </div>

        {nextAnnouncement ? (
          <div className="platform-update-next">
            <span className="platform-update-next-label">
              {nextAnnouncement.label}
            </span>
            <span className="platform-update-next-title">
              {nextAnnouncement.title}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
