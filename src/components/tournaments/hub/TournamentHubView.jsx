import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  registerForTournament,
  markRegisteredForTournament,
  fetchTournamentRegistrations,
} from "../../../lib/supabase/registrations";
import TournamentRegistrationSuccess from "../registration/TournamentRegistrationSuccess";
import RegisteredPlayersGrid from "../RegisteredPlayersGrid";
import TournamentHero from "./TournamentHero";
import TournamentCountdown from "./TournamentCountdown";
import TournamentGroups from "./TournamentGroups";
import TournamentBracket from "./TournamentBracket";
import MatchSchedule from "./MatchSchedule";
import LiveResults from "./LiveResults";
import FinalStandings from "./FinalStandings";
import TournamentRegistrationForm from "./TournamentRegistrationForm";
import useTournamentBracket from "../../../hooks/useTournamentBracket";
import { tournamentRegistrationStyles } from "../../../styles/tournamentRegistrationStyles";
import { registeredPlayersStyles } from "../../../styles/playerProfilePageStyles";
import { tournamentHubStyles } from "../../../styles/tournamentHubStyles";
import {
  LIFECYCLE_BADGE,
  isLifecycleClosed,
  isLifecycleCompleted,
  isLifecycleLive,
  isLifecycleOpen,
} from "../../../lib/tournamentLifecycle";

const DEFAULT_REGISTRATION_CAPACITY = 22;

/**
 * Live tournament hub — single source of truth before / during / after.
 * Section order: Hero → Status → Countdown → Players → Groups/Bracket →
 * Schedule → Live Results → Final Standings.
 *
 * @param {object} props
 * @param {object} props.tournament
 */
export default function TournamentHubView({ tournament }) {
  const capacity =
    tournament.registrationLimit ?? DEFAULT_REGISTRATION_CAPACITY;
  const tsAccent = tournament.accent || "#a855f7";
  const isOpen = isLifecycleOpen(tournament);
  const isClosed = isLifecycleClosed(tournament);
  const isLive = isLifecycleLive(tournament);
  const isCompleted = isLifecycleCompleted(tournament);
  const statusBadge =
    LIFECYCLE_BADGE[tournament.lifecycle] ?? tournament.status;

  const [registrations, setRegistrations] = useState(null);
  const [regStatus, setRegStatus] = useState("idle");
  const [lastRegistrantNumber, setLastRegistrantNumber] = useState(null);

  const loadBracket =
    Boolean(tournament.tournamentId) &&
    (isClosed || isLive || isCompleted || !isOpen);

  const {
    data: bracket,
    loading: bracketLoading,
  } = useTournamentBracket(tournament.tournamentId, loadBracket);

  useEffect(() => {
    let cancelled = false;
    const tid = tournament.tournamentId;
    if (!tid) return undefined;
    fetchTournamentRegistrations(tid)
      .then((rows) => {
        if (!cancelled) setRegistrations(rows);
      })
      .catch((err) => {
        console.error("Failed to fetch registrations:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [tournament.tournamentId]);

  const registrationCount =
    registrations === null ? null : registrations.length;
  const playerCount =
    registrationCount ?? tournament.registeredCount ?? 0;

  const slugByName = useMemo(() => {
    /** @type {Record<string, string>} */
    const map = {};
    for (const p of registrations ?? []) {
      if (p?.name && p?.slug) {
        map[String(p.name).trim().toLowerCase()] = p.slug;
      }
    }
    for (const g of bracket?.groups ?? []) {
      for (const m of g.members ?? []) {
        if (m.player?.name && m.player?.slug) {
          map[m.player.name.trim().toLowerCase()] = m.player.slug;
        }
      }
    }
    for (const f of bracket?.fixtures ?? []) {
      for (const side of [f.player1, f.player2, f.winner]) {
        if (side?.name && side?.slug) {
          map[side.name.trim().toLowerCase()] = side.slug;
        }
      }
    }
    return map;
  }, [registrations, bracket]);

  const matchesPlayed = (bracket?.fixtures ?? []).filter(
    (f) => f.status === "completed"
  ).length;

  const handleRegister = async (payload) => {
    await registerForTournament(payload);
    markRegisteredForTournament(
      tournament.tournamentId || tournament.slug || tournament.id
    );
    const rows = await fetchTournamentRegistrations(tournament.tournamentId);
    setRegistrations(rows);
    const trimmed = String(payload.discordUsername || "")
      .trim()
      .toLowerCase();
    const registrantNumber = rows
      ? rows
          .map((r) => r.name.trim().toLowerCase())
          .lastIndexOf(trimmed) + 1 || rows.length
      : null;
    setLastRegistrantNumber(registrantNumber);
    setRegStatus("success");
  };

  if (regStatus === "success") {
    return (
      <>
        <style>{tournamentRegistrationStyles}</style>
        <TournamentRegistrationSuccess
          tournament={tournament}
          capacity={capacity}
          registrationCount={registrations ? registrations.length : null}
          registrantNumber={lastRegistrantNumber}
        />
      </>
    );
  }

  const tsGameSlug =
    tournament.gameSlug ??
    (tournament.game
      ? tournament.game.toLowerCase().replace(/\s+/g, "-")
      : "dgl");

  return (
    <>
      <style>{tournamentRegistrationStyles}</style>
      <style>{registeredPlayersStyles}</style>
      <style>{tournamentHubStyles}</style>
      <div
        className="tournament-page"
        data-game-slug={tsGameSlug}
        style={{ "--accent": tsAccent }}
      >
        <div className="page-shell">
          <div className="page-content">
            {/* 1. Hero (includes status badge + player count) */}
            <TournamentHero
              tournament={tournament}
              playerCount={playerCount}
              capacity={capacity}
            />

            {/* 2. Tournament Status (explicit strip for clarity) */}
            <section className="hub-section" aria-label="Tournament status">
              <div className="hub-status-badge">{statusBadge}</div>
            </section>

            {/* 3. Countdown */}
            <TournamentCountdown tournament={tournament} />

            {/* Registration form while open */}
            {isOpen ? (
              <div className="register-card">
                <div className="register-body">
                  <TournamentRegistrationForm
                    tournament={tournament}
                    capacity={capacity}
                    registrationCount={registrationCount}
                    onSubmit={handleRegister}
                  />
                </div>
              </div>
            ) : null}

            {/* 4. Registered Players — always visible */}
            <RegisteredPlayersGrid
              players={registrations}
              accent={tsAccent}
              title="Registered Players"
            />

            {/* 5. Groups / Brackets */}
            <TournamentGroups
              groups={bracket?.groups ?? []}
              hasGroups={Boolean(bracket?.hasGroups)}
              loading={bracketLoading}
            />
            <TournamentBracket
              fixtures={bracket?.fixtures ?? []}
              hasKnockout={Boolean(bracket?.hasKnockout)}
              loading={bracketLoading}
            />

            {/* 6. Match Schedule */}
            <MatchSchedule
              fixtures={bracket?.fixtures ?? []}
              loading={bracketLoading}
            />

            {/* 7. Live Results */}
            <LiveResults
              fixtures={bracket?.fixtures ?? []}
              loading={bracketLoading}
            />

            {/* 8. Final Standings */}
            {isCompleted ? (
              <FinalStandings
                tournament={tournament}
                totalPlayers={playerCount}
                matchesPlayed={matchesPlayed}
                slugByName={slugByName}
              />
            ) : null}

            {tournament.streamUrl && (isLive || isClosed) ? (
              <section className="hub-section">
                <h2 className="hub-section-title">Live Stream</h2>
                <p>
                  <a
                    href={tournament.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hub-player-link"
                  >
                    Watch live stream
                  </a>
                </p>
              </section>
            ) : null}

            <div className="back-link">
              <Link to="/tournaments" className="back-btn">
                ← Back to Tournaments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
