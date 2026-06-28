import { useRef } from "react";

import TopNav from "../components/TopNav";
import PageMeta from "../components/PageMeta";
import useCursorGlow from "../hooks/useCursorGlow";
import FeaturedTournament from "../components/tournaments/FeaturedTournament";
import UpcomingTournamentCard from "../components/tournaments/UpcomingTournamentCard";
import CompletedTournamentCard from "../components/tournaments/CompletedTournamentCard";
import {
  getTournamentsPageLayout,
} from "../config/tournamentConfig";
import { PAGE_META } from "../config/siteConfig";
import { tournamentsPageStyles } from "../styles/tournamentsPageStyles";

export default function Tournaments() {
  const { mainEvent, upcomingDisplay, showCompletedArchive, archivedCompleted } =
    getTournamentsPageLayout();
  const containerRef = useRef(null);

  useCursorGlow(containerRef, { glowLerp: 0.1, trailLerp: 0.04 });

  return (
    <>
      <PageMeta {...PAGE_META.tournaments} />
      <style>{tournamentsPageStyles}</style>

      <div className="tournaments-page" ref={containerRef}>
        <div className="grid-bg" />
        <div className="glow-cursor-trail" />
        <div className="glow-cursor" />
        <div className="glow-1" />
        <div className="glow-2" />

        <div className="content">
          <TopNav />

          <h1 className="page-title">Titan Grindhouse</h1>

          <div className="layout-grid">
            <FeaturedTournament tournament={mainEvent} />

            {upcomingDisplay.length > 0 ? (
              <section className="upcoming-section">
                <h2 className="section-heading">Upcoming Tournaments</h2>
                <div className="hub-cards-grid">
                  {upcomingDisplay.map((tournament, index) => (
                    <UpcomingTournamentCard
                      key={tournament.id}
                      tournament={{ ...tournament, index }}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {showCompletedArchive ? (
              <section className="completed-section">
                <h2 className="section-heading">Completed Tournaments</h2>
                <div className="hub-cards-grid">
                  {archivedCompleted.map((tournament, index) => (
                    <CompletedTournamentCard
                      key={tournament.id}
                      tournament={{ ...tournament, index }}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
