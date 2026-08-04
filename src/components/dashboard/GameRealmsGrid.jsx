import GameIcon from "../tournaments/GameIcon";

/**
 * Supported games grid for the Titan Dashboard.
 * @param {object} props
 * @param {object[]} props.games
 */
export default function GameRealmsGrid({ games }) {
  return (
    <section className="glass-panel">
      <div className="panel-header">
        <h2 className="section-title">Active Realms</h2>
        <span className="section-badge">{games.length} Supported</span>
      </div>

      <div className="games-grid">
        {games.map((realm, index) => {
          const status = realm.status ?? "available";
          const statusLabel = realm.statusLabel ?? "Active";

          return (
            <article
              className={`game-card game-card-${status}`}
              key={realm.id}
              style={{
                "--realm-accent": realm.accent,
                "--realm-glow": realm.glow,
              }}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -12;
                const rotateY = ((x - centerX) / centerX) * 12;
                card.style.setProperty("--rx", `${rotateX}deg`);
                card.style.setProperty("--ry", `${rotateY}deg`);
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                card.style.setProperty("--rx", "0deg");
                card.style.setProperty("--ry", "0deg");
              }}
            >
              <div className="game-card-border" aria-hidden="true" />
              <div className="game-card-glow" aria-hidden="true" />
              <div className="game-card-inner">
                <div className="game-card-header">
                  <span className="game-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="game-category">{realm.category}</span>
                </div>

                <div className="game-icon-wrap">
                  <GameIcon slug={realm.id} />
                </div>

                <div className="game-card-body">
                  <h3 className="game-name">{realm.name}</h3>
                  <p className="game-players">
                    <strong>DGL</strong> Roadmap
                  </p>
                </div>

                <div className="game-card-footer">
                  <div className="game-signal" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={`game-status game-status-${status}`}>
                    <span className="game-status-dot" />
                    {statusLabel}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
