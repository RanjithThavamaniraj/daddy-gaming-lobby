/**
 * Closing conversion CTA — Discord is the primary entry point.
 * @param {object} props
 * @param {string} props.discordUrl
 */
export default function JoinDiscordCta({ discordUrl }) {
  return (
    <section className="section discord-cta-section">
      <div className="discord-cta-card">
        <h2 className="discord-cta-title">Ready to Compete?</h2>
        <p className="discord-cta-text">
          Join Daddy Gaming Lobby to participate in tournaments, earn DGL Points, climb the
          leaderboard and become a Hall of Champion.
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
        </div>
      </div>
    </section>
  );
}
