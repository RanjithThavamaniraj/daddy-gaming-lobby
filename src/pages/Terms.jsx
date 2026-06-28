import LegalPageLayout from "../components/legal/LegalPageLayout";
import { PAGE_META } from "../config/siteConfig";

export default function Terms() {
  return (
    <LegalPageLayout
      pageMeta={PAGE_META.terms}
      titleBefore="TERMS OF"
      titleHighlight="SERVICE"
    >
<div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">01</span> Agreement to Terms
              </h2>
              <p className="legal-text">
                By accessing or using Daddy Gaming Lobby (the "Platform"), registering for our tournaments, or linking your gaming accounts, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must refrain from using our Platform immediately.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">02</span> User Accounts & Registrations
              </h2>
              <p className="legal-text">
                To participate in competitive matches, you may be required to sign in via Discord and link valid, active in-game accounts. You represent that all information provided is accurate and belongs to you. You are solely responsible for:
              </p>
              <ul className="legal-list">
                <li>Safeguarding your accounts and login credentials.</li>
                <li>Any activity that occurs under your profile.</li>
                <li>Ensuring your connected accounts are in good standing with third-party game publishers (e.g., Riot Games, Valve, Epic Games).</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">03</span> Tournament Rules & Fair Play
              </h2>
              <p className="legal-text">
                Competition is the core of Daddy Gaming Lobby. To maintain tournament integrity, all players must abide by our competitive guidelines:
              </p>
              <ul className="legal-list">
                <li><strong>No Cheating:</strong> The use of hacks, aiming assistants, wallhacks, macros, script exploits, or any third-party software that gives an unfair advantage is strictly prohibited.</li>
                <li><strong>No Smurfing or Account Sharing:</strong> Players must compete using their primary, registered accounts. Playing on another player's behalf or intentionally lowering ranks to enter lower-tier matches is forbidden.</li>
                <li><strong>Respectful Conduct:</strong> Toxicity, hate speech, harassment, spamming, and unsportsmanlike behavior will not be tolerated inside our Platform or Discord.</li>
              </ul>
              <p className="legal-text">
                Violations of fair play rules will result in immediate disqualification, bracket forfeit, leaderboard ban, and termination of Platform access.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">04</span> Prizes & Payouts
              </h2>
              <p className="legal-text">
                Certain tournaments may feature prizes. Winners are determined based on verified match results as evaluated by platform administrators. Any prize distributions are subject to verification and compliance with eligibility requirements. Daddy Gaming Lobby reserves the right to withhold prizes if there is a suspected violation of competitive rules.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">05</span> Limitation of Liability
              </h2>
              <p className="legal-text">
                The Platform and its services are provided on an "as is" and "as available" basis. Daddy Gaming Lobby makes no warranties, express or implied, regarding uptime, matchmaking latency, server issues, or errors. We are not liable for any losses resulting from platform downtime or tournament disqualification.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-sec-title">
                <span className="legal-sec-num">06</span> Modifications to Service
              </h2>
              <p className="legal-text">
                We reserve the right to modify, suspend, or discontinue any aspect of the Platform, including specific tournament styles, matchmaking rules, or overall availability, at any time without prior notice.
              </p>
              <p className="legal-text" style={{ fontStyle: "italic", fontSize: "0.95rem", marginTop: "1rem" }}>
                Last updated: May 24, 2026
              </p>
            </div>
    </LegalPageLayout>
  );
}
