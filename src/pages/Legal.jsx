import LegalPageLayout from "../components/legal/LegalPageLayout";
import { Link } from "react-router-dom";
import { PAGE_META } from "../config/siteConfig";

export default function Legal() {
  return (
    <LegalPageLayout
      pageMeta={PAGE_META.legal}
      titleBefore="LEGAL"
      titleHighlight="CENTER"
    >
      <div className="legal-section">
        <h2 className="legal-sec-title">
          <span className="legal-sec-num">01</span> Policies
        </h2>
        <p className="legal-text">
          Review Daddy Gaming Lobby policies that protect players and keep
          competition fair across every event.
        </p>
        <ul className="legal-list">
          <li>
            <Link to="/privacy">Privacy Policy</Link> — how we collect and protect
            your data.
          </li>
          <li>
            <Link to="/terms">Terms of Service / Tournament Rules</Link> — fair
            play, prizes, and platform terms.
          </li>
        </ul>
      </div>

      <div className="legal-section">
        <h2 className="legal-sec-title">
          <span className="legal-sec-num">02</span> Play &amp; Compete
        </h2>
        <p className="legal-text">
          Explore <Link to="/tournaments">open and archived tournaments</Link>,
          check the <Link to="/leaderboard">DGL Points leaderboard</Link>, or{" "}
          <Link to="/contact">contact the team</Link> on Discord.
        </p>
      </div>
    </LegalPageLayout>
  );
}
