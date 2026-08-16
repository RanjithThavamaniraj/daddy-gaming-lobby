import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PageMeta from "../components/PageMeta";
import TopNav from "../components/TopNav";
import { fetchPlayerBySlug } from "../lib/supabase/players";
import { seoDescription } from "../config/siteConfig";
import { playerProfilePageStyles } from "../styles/playerProfilePageStyles";

export default function PlayerProfile() {
  const { slug } = useParams();
  const [player, setPlayer] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchPlayerBySlug(slug)
      .then((row) => {
        if (!cancelled) {
          setError(null);
          setPlayer(row);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setPlayer(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (player === undefined) {
    return (
      <>
        <PageMeta title="Player" path={`/players/${slug ?? ""}`} />
        <style>{playerProfilePageStyles}</style>
        <div className="player-profile-page">
          <div className="page-shell">
            <TopNav />
            <p className="player-profile-loading">Loading player…</p>
          </div>
        </div>
      </>
    );
  }

  if (!player || error) {
    return (
      <>
        <PageMeta
          title="Player Not Found"
          description={seoDescription(
            "This Daddy Gaming Lobby player profile could not be found. Browse tournaments and the leaderboard."
          )}
          path={`/players/${slug ?? ""}`}
          noindex
        />
        <style>{playerProfilePageStyles}</style>
        <div className="player-profile-page">
          <div className="page-shell">
            <TopNav />
            <div className="player-profile-card">
              <h1>Player Not Found</h1>
              <p>No profile exists for this slug yet.</p>
              <div className="player-profile-actions">
                <Link to="/leaderboard" className="cyber-btn primary">
                  <span>View Leaderboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const joined = player.joinedAt
    ? new Date(player.joinedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <>
      <PageMeta
        title={player.displayName}
        description={seoDescription(
          `${player.displayName} on Daddy Gaming Lobby — ${player.points} DGL Points, ${player.tournamentsPlayed} tournaments played.`
        )}
        path={`/players/${player.slug}`}
      />
      <style>{playerProfilePageStyles}</style>
      <div className="player-profile-page">
        <div className="page-shell">
          <TopNav />
          <article className="player-profile-card">
            <p className="player-profile-eyebrow">DGL PLAYER PROFILE</p>
            <h1>🎮 {player.displayName}</h1>
            {player.isNewPlayer ? (
              <p className="player-profile-new">
                🌱 New Player — No tournament history yet.
              </p>
            ) : null}
            <div className="player-profile-grid">
              <div className="player-profile-stat">
                <span className="label">🏆 DGL Points</span>
                <span className="value">{player.points}</span>
              </div>
              <div className="player-profile-stat">
                <span className="label">📈 Current Rank</span>
                <span className="value">
                  {player.rank != null ? `#${player.rank}` : "Unranked"}
                </span>
              </div>
              <div className="player-profile-stat">
                <span className="label">🎯 Tournaments Played</span>
                <span className="value">{player.tournamentsPlayed}</span>
              </div>
              <div className="player-profile-stat">
                <span className="label">🖥 Platform</span>
                <span className="value">{player.platform}</span>
              </div>
              <div className="player-profile-stat">
                <span className="label">🌱 Joined DGL</span>
                <span className="value">{joined}</span>
              </div>
              {(player.gameRanks ?? []).map((entry) => (
                <div className="player-profile-stat" key={entry.gameSlug ?? entry.gameName}>
                  <span className="label">{entry.gameName}</span>
                  <span className="value">{entry.rank}</span>
                </div>
              ))}
            </div>
            <div className="player-profile-actions">
              <Link to="/tournaments" className="cyber-btn outline">
                <span>Tournaments</span>
              </Link>
              <Link to="/leaderboard" className="cyber-btn primary">
                <span>Leaderboard</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
