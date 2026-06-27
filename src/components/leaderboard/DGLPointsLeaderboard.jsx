import DGLPointsRow from "./DGLPointsRow";

/**
 * Official DGL Points leaderboard table.
 * @param {object} props
 * @param {object[]} props.players
 * @param {number|null} props.activeRank
 * @param {function} props.onToggleRank
 */
export default function DGLPointsLeaderboard({ players, activeRank, onToggleRank }) {
  return (
    <section className="dgl-section">
      <div className="dgl-header">
        <h2 className="dgl-title">
          <span className="slash">///</span> DGL Points Leaderboard
        </h2>
      </div>

      <div className="dgl-table-head" aria-hidden>
        <span>Rank</span>
        <span>Player</span>
        <span>Game</span>
        <span>DGL Points</span>
        <span>Championships</span>
        <span>Tournaments Played</span>
      </div>

      <div className="table-wrap">
        {players.map((player) => (
          <DGLPointsRow
            key={player.name}
            player={player}
            isActive={activeRank === player.rank}
            onToggle={() => onToggleRank(player.rank)}
          />
        ))}
      </div>
    </section>
  );
}
