import { Link } from "react-router-dom";

const leaderboardPlayers = [
  { rank: 1, name: "ShadowX", game: "Valorant", points: 2480, wins: 42 },
  { rank: 2, name: "VenomYT", game: "CS2", points: 2310, wins: 38 },
  { rank: 3, name: "Inferno", game: "Apex Legends", points: 2200, wins: 35 },
  { rank: 4, name: "AlphaSniper", game: "Marvel Rivals", points: 2140, wins: 32 },
  { rank: 5, name: "GhostMode", game: "Arc Raiders", points: 2050, wins: 29 },
  { rank: 6, name: "TitanWolf", game: "The Finals", points: 1980, wins: 27 },
  { rank: 7, name: "NightFury", game: "FC 26", points: 1920, wins: 25 },
  { rank: 8, name: "DarkKnight", game: "Dota 2", points: 1870, wins: 24 },
  { rank: 9, name: "BlazeStorm", game: "League of Legends", points: 1800, wins: 22 },
  { rank: 10, name: "ReaperZX", game: "Marvel Rivals", points: 1740, wins: 20 },
];

const RANK_CONFIG = {
  1: { badge: "🥇", label: "GOLD", color: "#f59e0b", glow: "rgba(245,158,11,0.5)", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.5)", avatarBorder: "#f59e0b", avatarGlow: "rgba(245,158,11,0.6)", rowBg: "rgba(245,158,11,0.04)" },
  2: { badge: "🥈", label: "SILVER", color: "#e2e8f0", glow: "rgba(226,232,240,0.4)", bg: "rgba(226,232,240,0.08)", border: "rgba(226,232,240,0.4)", avatarBorder: "#e2e8f0", avatarGlow: "rgba(226,232,240,0.5)", rowBg: "rgba(226,232,240,0.03)" },
  3: { badge: "🥉", label: "BRONZE", color: "#cd7c2f", glow: "rgba(205,124,47,0.4)", bg: "rgba(205,124,47,0.1)", border: "rgba(205,124,47,0.4)", avatarBorder: "#cd7c2f", avatarGlow: "rgba(205,124,47,0.5)", rowBg: "rgba(205,124,47,0.04)" },
};

function getInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

function Avatar({ player }) {
  const cfg = RANK_CONFIG[player.rank];
  const color = cfg ? cfg.avatarBorder : "#a855f7";
  const glow = cfg ? cfg.avatarGlow : "rgba(168,85,247,0.3)";
  const size = player.rank <= 3 ? 52 : 42;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, ${color}22, #0d0d12)`,
      border: `2px solid ${color}`,
      boxShadow: `0 0 12px ${glow}, inset 0 0 8px ${color}22`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Bebas Neue', sans-serif", fontSize: size * 0.36,
      color, letterSpacing: "0.05em", flexShrink: 0, position: "relative",
    }}>
      {getInitials(player.name)}
      {cfg && (
        <div style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          border: `1px solid ${color}`, opacity: 0.4,
          animation: "ringPulse 2s ease-in-out infinite",
        }} />
      )}
    </div>
  );
}

function RankBadge({ rank }) {
  const cfg = RANK_CONFIG[rank];
  if (cfg) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: cfg.bg, border: `2px solid ${cfg.border}`,
          boxShadow: `0 0 16px ${cfg.glow}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem", position: "relative",
        }}>
          {cfg.badge}
          <div style={{
            position: "absolute", inset: -3, borderRadius: "50%",
            border: `1px solid ${cfg.color}`, opacity: 0.3,
            animation: "ringPulse 2s ease-in-out infinite",
          }} />
        </div>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: cfg.color, letterSpacing: "0.05em", lineHeight: 1, textShadow: `0 0 10px ${cfg.glow}` }}>#{rank}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.5rem", color: cfg.color, opacity: 0.7, letterSpacing: "0.15em" }}>{cfg.label}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem",
        color: "#6b7280", letterSpacing: "0.05em",
      }}>#{rank}</div>
    </div>
  );
}

export default function Leaderboard() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@500;700;800;900&family=Rajdhani:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #060608; color: white; font-family: 'Rajdhani', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060608; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 2px; }
        @keyframes ringPulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.15); opacity: 0.1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .page { min-height: 100vh; background: #060608; position: relative; overflow: hidden; padding: 2.5rem 2rem; }
        .glow-1 { position: absolute; width: 500px; height: 500px; background: rgba(168,85,247,0.12); border-radius: 50%; filter: blur(140px); top: -150px; left: -150px; pointer-events: none; }
        .glow-2 { position: absolute; width: 450px; height: 450px; background: rgba(124,58,237,0.12); border-radius: 50%; filter: blur(140px); bottom: -150px; right: -150px; pointer-events: none; }
        .content { position: relative; z-index: 2; max-width: 1000px; margin: 0 auto; }
        .title-link { text-decoration: none; display: inline-block; margin-bottom: 2.5rem; }
        .title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 900; color: #a855f7;
          text-transform: uppercase; letter-spacing: 0.08em;
          text-shadow: 0 0 12px rgba(168,85,247,0.45), 0 0 40px rgba(168,85,247,0.12);
          line-height: 1;
          transition: text-shadow 0.2s, color 0.2s;
        }
        .title-link:hover .title {
          color: #c084fc;
          text-shadow: 0 0 20px rgba(168,85,247,0.7), 0 0 60px rgba(168,85,247,0.2);
        }
        .podium { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
        .podium-card { background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.08); padding: 1.75rem 1rem; text-align: center; position: relative; overflow: hidden; animation: fadeUp 0.5s ease both; }
        .podium-card.rank-1 { border-color: rgba(245,158,11,0.35); background: linear-gradient(145deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02)); order: 2; padding-top: 2.25rem; }
        .podium-card.rank-2 { border-color: rgba(226,232,240,0.25); order: 1; }
        .podium-card.rank-3 { border-color: rgba(205,124,47,0.25); order: 3; }
        .podium-crown { font-size: 1.5rem; margin-bottom: 0.5rem; display: block; }
        .podium-avatar-wrap { display: flex; justify-content: center; margin-bottom: 0.75rem; }
        .podium-name { font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .podium-game { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; margin-bottom: 0.5rem; }
        .podium-points { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; letter-spacing: 0.05em; line-height: 1; }
        .podium-wins { font-family: 'JetBrains Mono', monospace; font-size: 0.58rem; color: #6b7280; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.2rem; }
        .leaderboard-panel { background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.07); overflow: hidden; }
        .leaderboard-header { display: grid; grid-template-columns: 140px 1fr 1fr 120px 100px; padding: 1rem 1.5rem; background: rgba(168,85,247,0.06); border-bottom: 1px solid rgba(255,255,255,0.07); font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; color: #6b7280; }
        .leaderboard-row { display: grid; grid-template-columns: 140px 1fr 1fr 120px 100px; padding: 1rem 1.5rem; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.2s; animation: fadeUp 0.4s ease both; }
        .leaderboard-row:last-child { border-bottom: none; }
        .leaderboard-row:hover { background: rgba(168,85,247,0.04); }
        .player-cell { display: flex; align-items: center; gap: 0.75rem; }
        .player-name { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 1rem; color: #f0f0f5; }
        .game-cell { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.08em; color: #a855f7; background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.15); padding: 0.25rem 0.6rem; display: inline-block; width: fit-content; }
        .points-cell { font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; color: #f0f0f5; letter-spacing: 0.05em; }
        .wins-cell { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #6b7280; letter-spacing: 0.08em; }
        @media (max-width: 768px) {
          .podium { grid-template-columns: 1fr; }
          .podium-card.rank-1, .podium-card.rank-2, .podium-card.rank-3 { order: unset; }
          .leaderboard-header { display: none; }
          .leaderboard-row { grid-template-columns: 1fr; gap: 0.5rem; padding: 1rem; }
          .page { padding: 1.25rem 1rem; }
        }
      `}</style>

      <div className="page">
        <div className="glow-1" />
        <div className="glow-2" />

        <div className="content">

          {/* TITLE — clicks back to home */}
          <Link to="/" className="title-link">
            <div className="title">Hall of Titans</div>
          </Link>

          {/* TOP 3 PODIUM */}
          <div className="podium">
            {leaderboardPlayers.slice(0, 3).map((player) => {
              const cfg = RANK_CONFIG[player.rank];
              return (
                <div key={player.rank} className={`podium-card rank-${player.rank}`}
                  style={{ animationDelay: `${player.rank * 0.1}s` }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: `radial-gradient(ellipse at top, ${cfg.bg}, transparent 70%)`,
                    pointerEvents: "none",
                  }} />
                  <span className="podium-crown">{cfg.badge}</span>
                  <div className="podium-avatar-wrap"><Avatar player={player} /></div>
                  <div className="podium-name" style={{ color: cfg.color }}>{player.name}</div>
                  <div className="podium-game">{player.game}</div>
                  <div className="podium-points" style={{ color: cfg.color, textShadow: `0 0 15px ${cfg.glow}` }}>
                    {player.points.toLocaleString()}
                  </div>
                  <div className="podium-wins">{player.wins} wins</div>
                </div>
              );
            })}
          </div>

          {/* TABLE — ranks 4-10 */}
          <div className="leaderboard-panel">
            <div className="leaderboard-header">
              <div>Rank</div><div>Player</div><div>Game</div><div>Points</div><div>Wins</div>
            </div>
            {leaderboardPlayers.slice(3).map((player, i) => (
              <div className="leaderboard-row" key={player.rank}
                style={{ animationDelay: `${i * 0.05}s` }}>
                <RankBadge rank={player.rank} />
                <div className="player-cell">
                  <Avatar player={player} />
                  <span className="player-name">{player.name}</span>
                </div>
                <div><span className="game-cell">{player.game}</span></div>
                <div className="points-cell">{player.points.toLocaleString()}</div>
                <div className="wins-cell">{player.wins} wins</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}