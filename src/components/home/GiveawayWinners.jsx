/**
 * Compact community milestone — confirmed Discord giveaway winners.
 * @param {object} props
 * @param {{ id: string; event: string; winner: string; prize: string }[]} props.winners
 */
export default function GiveawayWinners({ winners }) {
  if (!winners?.length) return null;

  return (
    <section className="section section-compact giveaway-winners" aria-label="Giveaway winners">
      <p className="section-eyebrow">Giveaway Winners</p>
      <div className="giveaway-winners-inner">
        {winners.map((item, index) => (
          <article
            className="giveaway-winner"
            key={item.id}
            style={{ animationDelay: `${0.05 * index}s` }}
          >
            <p className="giveaway-winner-event">🏆 {item.event}</p>
            <p className="giveaway-winner-line">
              <span className="giveaway-winner-name">{item.winner}</span>
              <span className="giveaway-winner-prize"> — {item.prize}</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
