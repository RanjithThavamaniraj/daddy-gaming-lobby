import LegalPageLayout from "../components/legal/LegalPageLayout";
import { Link } from "react-router-dom";
import { DISCORD_INVITE_URL, PAGE_META } from "../config/siteConfig";

export default function Contact() {
  return (
    <LegalPageLayout
      pageMeta={PAGE_META.contact}
      titleBefore="CONTACT"
      titleHighlight="DGL"
    >
      <div className="legal-section">
        <h2 className="legal-sec-title">
          <span className="legal-sec-num">01</span> Community Discord
        </h2>
        <p className="legal-text">
          The fastest way to reach Daddy Gaming Lobby is our official Discord server.
          Use it for tournament questions, registration help, schedule updates, and
          community support from the DGL team.
        </p>
        <p className="legal-text">
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
            Join the Daddy Gaming Lobby Discord
          </a>
        </p>
      </div>

      <div className="legal-section">
        <h2 className="legal-sec-title">
          <span className="legal-sec-num">02</span> Tournaments &amp; Rules
        </h2>
        <p className="legal-text">
          Looking for an open event? Browse{" "}
          <Link to="/tournaments">current tournaments</Link>. For competitive
          guidelines and platform terms, read our{" "}
          <Link to="/terms">Rules &amp; Terms</Link>.
        </p>
      </div>

      <div className="legal-section">
        <h2 className="legal-sec-title">
          <span className="legal-sec-num">03</span> Legal
        </h2>
        <p className="legal-text">
          Privacy and policy documents live in our{" "}
          <Link to="/legal">Legal</Link> hub, including the{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </LegalPageLayout>
  );
}
