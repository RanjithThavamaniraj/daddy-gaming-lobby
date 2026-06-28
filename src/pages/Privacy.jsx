import LegalPageLayout from "../components/legal/LegalPageLayout";
import { PAGE_META } from "../config/siteConfig";

export default function Privacy() {
  return (
    <LegalPageLayout
      pageMeta={PAGE_META.privacy}
      titleBefore="PRIVACY"
      titleHighlight="POLICY"
    >
<div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">01</span> Introduction
              </h2>
              <p className="legal-text">
                Welcome to Daddy Gaming Lobby. We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you interact with our gaming platform, tournaments, leaderboards, and Discord integrations.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">02</span> Information We Collect
              </h2>
              <p className="legal-text">
                To provide our matchmaking, tournament brackets, and leaderboard services, we may collect the following data types:
              </p>
              <ul className="legal-list">
                <li><strong>Connected Accounts:</strong> Discord account information (usernames, IDs, avatars) when you link with our platform.</li>
                <li><strong>Gaming Profiles & Statistics:</strong> In-game names, public game IDs, match history, win rates, and ranking statistics.</li>
                <li><strong>Usage & Device Data:</strong> IP address, device specifications, browser type, and navigation logs collected through cookies and local storage.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">03</span> How We Use Your Data
              </h2>
              <p className="legal-text">
                Your data is processed to deliver a premium competitive gaming experience:
              </p>
              <ul className="legal-list">
                <li>Creating and managing tournament brackets and player registrations.</li>
                <li>Calculating leaderboard ranks and verifying match outcomes.</li>
                <li>Preventing hacking, cheating, toxicity, and other violations of fair play.</li>
                <li>Communicating tournament updates, schedule changes, and community announcements via Discord.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">04</span> Data Sharing & Integrity
              </h2>
              <p className="legal-text">
                We believe in keeping your personal details secure. <strong>We do not sell your personal data.</strong> Public tournament standings, match statistics, and leaderboard rankings are displayed publicly on the platform to maintain competitive transparency. Other community members may see your linked Discord username and public gaming IDs.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">05</span> Data Security
              </h2>
              <p className="legal-text">
                We implement robust security measures to prevent unauthorized access, alteration, or exposure of your data. However, please remember that no transmission method over the Internet is 100% secure. You are responsible for maintaining the confidentiality of your connected accounts.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">06</span> Your Choices & Rights
              </h2>
              <p className="legal-text">
                You have control over your data. Depending on your location, you can request access to, correction of, or deletion of the data we hold. To unlink your Discord profile or request account removal, please reach out to our administration team on our Discord Server.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">07</span> Policy Updates
              </h2>
              <p className="legal-text">
                We may revise this Privacy Policy periodically to reflect shifts in our platform or regulatory requirements. Any adjustments will be indicated by an updated date at the bottom of this page.
              </p>
              <p className="legal-text" style={{ fontStyle: "italic", fontSize: "0.95rem", marginTop: "1rem" }}>
                Last updated: May 24, 2026
              </p>
            </div>
    </LegalPageLayout>
  );
}
