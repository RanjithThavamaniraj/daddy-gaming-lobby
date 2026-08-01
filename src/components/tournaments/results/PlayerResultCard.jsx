/**
 * Premium player card for tournament results.
 * Only the champion tier gets the gold treatment — every other tier
 * (runner-up, semi-finalist, quarter-finalist, participant) reuses the same
 * neutral "runner-up" card style, distinguished by the badge label passed in.
 * @param {object} props
 * @param {string} props.name
 * @param {"champion"|"runner-up"} props.variant
 * @param {string} [props.badgeLabel] - overrides the default "Champion"/"Runner-up" badge text
 * @param {number} [props.dglPoints]
 * @param {number} [props.index] - stagger animation delay
 */
export default function PlayerResultCard({
  name,
  variant = "champion",
  badgeLabel,
  dglPoints,
  index = 0,
}) {
  const isChampion = variant === "champion";
  const label = badgeLabel ?? (isChampion ? "Champion" : "Runner-up");

  return (
    <article
      className={`results-player-card ${isChampion ? "champion-card" : "runner-up-card"}`}
      style={{ animationDelay: `${0.06 * index}s` }}
    >
      <div className="results-player-inner">
        <span className={`results-player-badge ${isChampion ? "champion" : "runner-up"}`}>
          {label}
        </span>
        <span className="results-player-name">{name}</span>
        {dglPoints != null ? (
          <span className="results-player-points">+{dglPoints} DGL Points</span>
        ) : null}
      </div>
    </article>
  );
}
