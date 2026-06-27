/**
 * Tournament rewards summary card.
 * @param {object} props
 * @param {number} props.dglPoints
 * @param {string} props.prizePool
 */
export default function TournamentResultsRewards({ dglPoints, prizePool }) {
  return (
    <section className="results-section">
      <h2 className="results-section-heading">Tournament Rewards</h2>
      <div className="results-rewards-card">
        <div className="results-rewards-inner">
          <div className="results-reward-item">
            <span className="results-reward-label">🏅 Every Champion Received</span>
            <span className="results-reward-value gold">+{dglPoints} DGL Points</span>
          </div>
          <div className="results-reward-item">
            <span className="results-reward-label">💰 Prize Pool</span>
            <span className="results-reward-value purple">{prizePool}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
