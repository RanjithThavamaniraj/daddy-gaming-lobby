/**
 * Premium player card for tournament results.
 * @param {object} props
 * @param {string} props.name
 * @param {"champion"|"runner-up"} props.variant
 * @param {number} [props.dglPoints] - shown for champions only
 * @param {number} [props.index] - stagger animation delay
 */
export default function PlayerResultCard({ name, variant = "champion", dglPoints, index = 0 }) {
  const isChampion = variant === "champion";

  return (
    <article
      className={`results-player-card ${isChampion ? "champion-card" : "runner-up-card"}`}
      style={{ animationDelay: `${0.06 * index}s` }}
    >
      <div className="results-player-inner">
        <span className={`results-player-badge ${isChampion ? "champion" : "runner-up"}`}>
          {isChampion ? "Champion" : "Runner-Up"}
        </span>
        <span className="results-player-name">{name}</span>
        {isChampion && dglPoints != null ? (
          <span className="results-player-points">+{dglPoints} DGL Points</span>
        ) : null}
      </div>
    </article>
  );
}
