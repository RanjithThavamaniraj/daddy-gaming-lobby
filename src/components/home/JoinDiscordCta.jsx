import { Link } from "react-router-dom";

/**
 * Join Discord closing CTA — community depth (distinct from hero quick-link).
 * @param {object} props
 * @param {string} props.discordUrl
 */
export default function JoinDiscordCta({ discordUrl }) {
  return (
    <section className="section discord-cta-section">
      <div className="discord-cta-card">
        <p className="section-eyebrow discord-eyebrow">Join the Community</p>
        <h2 className="discord-cta-title">
          Stay event-ready on <span>Discord</span>
        </h2>
        <p className="discord-cta-text">
          Get tournament announcements, find teammates, and be first to know when the next
          DGL championship opens. The community lives on Discord — that is where events begin.
        </p>
        <div className="discord-cta-actions">
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-btn"
          >
            Join Discord Server
          </a>
          <Link to="/tournaments" className="secondary-btn">
            Browse Tournaments
          </Link>
        </div>
      </div>
    </section>
  );
}
