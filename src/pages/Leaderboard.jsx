import { useRef, useState } from "react";

import TopNav from "../components/TopNav";
import PageMeta from "../components/PageMeta";
import HallOfChampions from "../components/leaderboard/HallOfChampions";
import DglPointsInfo from "../components/leaderboard/DglPointsInfo";
import DGLPointsLeaderboard from "../components/leaderboard/DGLPointsLeaderboard";
import useCursorGlow from "../hooks/useCursorGlow";
import useSupabaseData from "../hooks/useSupabaseData";
import {
  hallOfChampions,
  dglPointsLeaderboard,
} from "../config/leaderboardConfig";
import {
  fetchDglPointsLeaderboard,
  fetchHallOfChampions,
} from "../lib/supabase/dglRepository";
import { PAGE_META } from "../config/siteConfig";
import { leaderboardPageStyles } from "../styles/leaderboardPageStyles";

export default function Leaderboard() {
  const containerRef = useRef(null);
  const [activeRank, setActiveRank] = useState(null);
  const champions = useSupabaseData(hallOfChampions, fetchHallOfChampions);
  const players = useSupabaseData(dglPointsLeaderboard, fetchDglPointsLeaderboard);

  useCursorGlow(containerRef, { glowLerp: 0.12, trailLerp: 0.05 });

  return (
    <>
      <PageMeta {...PAGE_META.leaderboard} />
      <style>{leaderboardPageStyles}</style>

      <div className="lb-page" ref={containerRef}>
        <div className="grid-bg" aria-hidden />
        <div className="glow-cursor-trail" aria-hidden />
        <div className="glow-cursor" aria-hidden />
        <div className="glow-1" aria-hidden />
        <div className="glow-2" aria-hidden />

        <div className="content">
          <TopNav />

          <h1 className="page-title">Hall of Titans</h1>

          <HallOfChampions tournaments={champions} />

          <DglPointsInfo />

          <DGLPointsLeaderboard
            players={players}
            activeRank={activeRank}
            onToggleRank={(rank) => setActiveRank((current) => (current === rank ? null : rank))}
          />
        </div>
      </div>
    </>
  );
}
