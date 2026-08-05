import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  registerForTournament,
  markRegisteredForTournament,
  fetchTournamentRoster,
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
  isLifecycleClosed,
  isLifecycleCompleted,
  isLifecycleLive,
  isLifecycleOpen,
  isRegistrationDeadlinePassed,
} from "../../../lib/tournamentLifecycle";

const DEFAULT_REGISTRATION_CAPACITY = 22;
const DEFAULT_RESERVE_CAPACITY = 4;

/**
 * Live tournament hub — Phase 3A includes reserve roster support.
 * @param {object} props
 * @param {object} props.tournament
 */
export default function TournamentHubView({ tournament }) {
  const capacity =
    tournament.registrationLimit ?? DEFAULT_REGISTRATION_CAPACITY;
  const reserveLimit = tournament.reserveLimit ?? DEFAULT_RESERVE_CAPACITY;
  const tsAccent = tournament.accent || "#a855f7";
  const isOpen = isLifecycleOpen(tournament);
  const isClosed = isLifecycleClosed(tournament);
  const isLive = isLifecycleLive(tournament);
  const isCompleted = isLifecycleCompleted(tournament);
  const deadlinePassed = isRegistrationDeadlinePassed(tournament);

  const [roster, setRoster] = useState(
    /** @type {{ confirmed: object[], reserves: object[] } | null} */ (null)
  );
  const [regStatus, setRegStatus] = useState("idle");
  const [lastRegistrantNumber, setLastRegistrantNumber] = useState(null);
  const [joinedAsReserve, setJoinedAsReserve] = useState(false);

  const loadBracket =
    Boolean(tournament.tournamentId) &&
    (isClosed || isLive || isCompleted || !isOpen);

  const {
    data: bracket,
    loading: bracketLoading,
  } = useTournamentBracket(tournament.tournamentId, loadBracket);

  const refreshRoster = async (tid) => {
    if (!tid) return null;
    const next = await fetchTournamentRoster(tid);
    setRoster(next);
    return next;
  };

  useEffect(() => {
    let cancelled = false;
    const tid = tournament.tournamentId;
    if (!tid) return undefined;
    fetchTournamentRoster(tid)
      .then((next) => {
        if (!cancelled) setRoster(next);
      })
      .catch((err) => {
        console.error("Failed to fetch registrations:", err);
        if (!cancelled) setRoster({ confirmed: [], reserves: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [tournament.tournamentId]);

  const confirmed = roster?.confirmed ?? null;
  const reserves = roster?.reserves ?? null;
  const confirmedCount =
    confirmed?.length ??
    tournament.confirmedCount ??
    tournament.registeredCount ??
    0;
  const reserveCount =
    reserves?.length ?? tournament.reserveCount ?? 0;

  const mainFull = confirmedCount >= capacity;
  const reserveFull = reserveCount >= reserveLimit;
  // Main + reserve both stop once the registration deadline passes.
  const canRegisterMain = isOpen && !mainFull && !deadlinePassed;
  const canRegisterReserve =
    (isOpen || isClosed) &&
    mainFull &&
    !reserveFull &&
    !deadlinePassed &&
    !isLive &&
    !isCompleted;
  const showRegistrationForm = canRegisterMain || canRegisterReserve;
  const isReserveMode = canRegisterReserve;

  const slugByName = useMemo(() => {
    /** @type {Record<string, string>} */
    const map = {};
    for (const p of [...(confirmed ?? []), ...(reserves ?? [])]) {
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
  }, [confirmed, reserves, bracket]);

  const matchesPlayed = (bracket?.fixtures ?? []).filter(
    (f) => f.status === "completed"
  ).length;

  const handleRegister = async (payload) => {
    const result = await registerForTournament(payload);
    markRegisteredForTournament(
      tournament.tournamentId || tournament.slug || tournament.id
    );
    const next = await refreshRoster(tournament.tournamentId);
    const trimmed = String(payload.discordUsername || "")
      .trim()
      .toLowerCase();
    const list = result.isReserve ? next?.reserves : next?.confirmed;
    const registrantNumber = list
      ? list.map((r) => r.name.trim().toLowerCase()).lastIndexOf(trimmed) + 1 ||
        list.length
      : null;
    setLastRegistrantNumber(registrantNumber);
    setJoinedAsReserve(Boolean(result.isReserve));
    setRegStatus("success");
  };

  if (regStatus === "success") {
    return (
      <>
        <style>{tournamentRegistrationStyles}</style>
        <TournamentRegistrationSuccess
          tournament={tournament}
          capacity={capacity}
          registrationCount={confirmedCount}
          registrantNumber={lastRegistrantNumber}
          isReserve={joinedAsReserve}
          reserveCount={reserveCount}
          reserveLimit={reserveLimit}
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
            <TournamentHero
              tournament={tournament}
              playerCount={confirmedCount}
              capacity={capacity}
              reserveCount={reserveCount}
              reserveLimit={reserveLimit}
            />

            <TournamentCountdown tournament={tournament} />

            {showRegistrationForm ? (
              <div className="register-card">
                <div className="register-body">
                  <TournamentRegistrationForm
                    tournament={tournament}
                    capacity={capacity}
                    registrationCount={confirmedCount}
                    reserveCount={reserveCount}
                    reserveLimit={reserveLimit}
                    isReserveMode={isReserveMode}
                    tournamentFull={mainFull && reserveFull}
                    onSubmit={handleRegister}
                  />
                </div>
              </div>
            ) : null}

            {!showRegistrationForm &&
            deadlinePassed &&
            !isLive &&
            !isCompleted ? (
              <div className="register-card">
                <div className="register-body">
                  <div className="registration-full-notice">
                    Registrations Closed
                  </div>
                </div>
              </div>
            ) : null}

            {!showRegistrationForm &&
            !deadlinePassed &&
            mainFull &&
            reserveFull &&
            (isOpen || isClosed) ? (
              <div className="register-card">
                <div className="register-body">
                  <div className="registration-full-notice">Tournament Full</div>
                </div>
              </div>
            ) : null}

            <RegisteredPlayersGrid
              players={tournament.tournamentId ? confirmed : []}
              accent={tsAccent}
              title="Registered Players"
            />

            <RegisteredPlayersGrid
              players={tournament.tournamentId ? reserves : []}
              accent={tsAccent}
              title="Reserve Players"
              showReserveTooltip
              emptyMessage="No reserve players yet."
            />

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

            <MatchSchedule
              fixtures={bracket?.fixtures ?? []}
              loading={bracketLoading}
            />

            <LiveResults
              fixtures={bracket?.fixtures ?? []}
              loading={bracketLoading}
            />

            {isCompleted ? (
              <FinalStandings
                tournament={tournament}
                totalPlayers={confirmedCount}
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
