import { Link } from "react-router-dom";

/**
 * Join Discord closing CTA section.
 * @param {object} props
 * @param {string} props.discordUrl
 */
export default function JoinDiscordCta({ discordUrl }) {
  return (
    <section className="section discord-cta-section">
      <div className="discord-cta-card">
        <p className="section-eyebrow discord-eyebrow">Join the Community</p>
        <h2 className="discord-cta-title">
          Ready to compete in <span>DGL</span>?
        </h2>
        <p className="discord-cta-text">
          Join the Daddy Gaming Lobby Discord to stay updated on upcoming tournaments,
          connect with players, and become part of the DGL competitive community.
        </p>
        <div className="discord-cta-actions">
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-btn"
          >
            Join Discord
          </a>
          <Link to="/tournaments" className="secondary-btn">
            Explore Tournaments
          </Link>
        </div>
      </div>
    </section>
  );
}
