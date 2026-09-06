import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  registerForTournament,
  registerValorantSolo,
  registerValorantTeam,
  registerTeamSlot,
  markRegisteredForTournament,
  fetchTournamentRoster,
  fetchTournamentParticipants,
  fetchTournamentTeamSlots,
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
import ValorantRegistrationForm from "./ValorantRegistrationForm";
import TeamSlotRegistrationForm from "./TeamSlotRegistrationForm";
import TeamSlotRoster from "./TeamSlotRoster";
import useTournamentBracket from "../../../hooks/useTournamentBracket";
import { tournamentRegistrationStyles } from "../../../styles/tournamentRegistrationStyles";
import { registeredPlayersStyles } from "../../../styles/playerProfilePageStyles";
import { tournamentHubStyles } from "../../../styles/tournamentHubStyles";
import { resolvePrizePoolDisplay } from "../../../lib/prizePool";
import { isTeamSlotRegistration } from "../../../lib/tournamentModel";
import {
  isLifecycleClosed,
  isLifecycleCompleted,
  isLifecycleLive,
  isLifecycleOpen,
  isRegistrationDeadlinePassed,
} from "../../../lib/tournamentLifecycle";

function syntheticTeamSlots(teamLimit) {
  const limit = Number(teamLimit) || 0;
  return Array.from({ length: limit }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `Team ${index + 1}`,
    seed: index + 1,
    mains: [],
    substitutes: [],
    taken: false,
  }));
}

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
  const isTeamSlots = isTeamSlotRegistration(tournament);
  const teamLimit = Number(tournament.teamLimit) || 0;
  const teamMainSize = Number(tournament.teamMainSize) || 0;
  const teamSubstituteSize = Number(tournament.teamSubstituteSize) || 0;

  const [roster, setRoster] = useState(
    /** @type {{ confirmed: object[], reserves: object[] } | null} */ (null)
  );
  const [teamSlots, setTeamSlots] = useState(
    /** @type {object[] | null} */ (
      isTeamSlots ? syntheticTeamSlots(teamLimit) : null
    )
  );
  const [participants, setParticipants] = useState(
    /** @type {object[] | null} */ (null)
  );
  const [regStatus, setRegStatus] = useState("idle");
  const [lastRegistrantNumber, setLastRegistrantNumber] = useState(null);
  const [joinedAsReserve, setJoinedAsReserve] = useState(false);
  const [registrationSummary, setRegistrationSummary] = useState(null);

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
    if (isTeamSlots) {
      try {
        const slots = await fetchTournamentTeamSlots(tid);
        setTeamSlots(slots);
      } catch (err) {
        console.error("Failed to fetch team slots:", err);
      }
    }
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
    if (isTeamSlots) {
      fetchTournamentTeamSlots(tid)
        .then((next) => {
          if (!cancelled) setTeamSlots(next);
        })
        .catch((err) => {
          console.error("Failed to fetch team slots:", err);
          if (!cancelled) setTeamSlots(syntheticTeamSlots(teamLimit));
        });
    }
    return () => {
      cancelled = true;
    };
  }, [tournament.tournamentId, isTeamSlots, teamLimit]);

  useEffect(() => {
    let cancelled = false;
    const tid = tournament.tournamentId;
    if (!tid || !isCompleted) {
      return undefined;
    }
    fetchTournamentParticipants(tid)
      .then((next) => {
        if (!cancelled) setParticipants(next);
      })
      .catch((err) => {
        console.error("Failed to fetch participants:", err);
        if (!cancelled) setParticipants([]);
      });
    return () => {
      cancelled = true;
    };
  }, [tournament.tournamentId, isCompleted]);

  const confirmed = roster?.confirmed ?? null;
  const reserves = roster?.reserves ?? null;
  const displayParticipants = isCompleted ? participants : null;
  const confirmedCount =
    confirmed?.length ??
    tournament.confirmedCount ??
    tournament.registeredCount ??
    0;
  const liveTournament = {
    ...tournament,
    confirmedCount,
    prizePool: resolvePrizePoolDisplay({
      prizePool: tournament.prizePool,
      prizePerConfirmed: tournament.prizePerConfirmed,
      confirmedCount,
      registrationLimit: capacity,
    }),
  };
  const reserveCount =
    reserves?.length ?? tournament.reserveCount ?? 0;

  const filledTeams = (teamSlots ?? []).filter((slot) => slot.taken).length;
  const displaySlots = teamSlots ?? (isTeamSlots ? syntheticTeamSlots(teamLimit) : []);
  const mainFull = isTeamSlots
    ? teamLimit > 0 && filledTeams >= teamLimit
    : confirmedCount >= capacity;
  const reserveFull = isTeamSlots ? true : reserveCount >= reserveLimit;
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
    for (const p of [
      ...(confirmed ?? []),
      ...(reserves ?? []),
      ...(displayParticipants ?? []),
    ]) {
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
  }, [confirmed, reserves, displayParticipants, bracket]);

  const matchesPlayed = (bracket?.fixtures ?? []).filter(
    (f) => f.status === "completed"
  ).length;
  const participantCount = displayParticipants?.length ?? 0;
  const standingsPlayerCount = isCompleted
    ? participantCount || confirmedCount
    : confirmedCount;

  const isValorantChampionship2 = tournament.slug === "valorant-2";

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
    setRegistrationSummary(null);
    setRegStatus("success");
  };

  const handleValorantRegister = async (payload) => {
    const tournamentKey =
      tournament.tournamentId || tournament.slug || tournament.id;
    let result;

    if (payload.registrationType === "team") {
      result = await registerValorantTeam({
        tournamentId: payload.tournamentId,
        teamName: payload.teamName,
        players: payload.players,
      });
    } else {
      result = await registerValorantSolo({
        tournamentId: payload.tournamentId,
        discordUsername: payload.discordUsername,
        valorantRank: payload.valorantRank,
        gameId: tournament.gameId ?? null,
      });
    }

    if (result.duplicate) {
      throw new Error("This player is already registered for this tournament.");
    }

    markRegisteredForTournament(tournamentKey);
    const next = await refreshRoster(tournament.tournamentId);

    if (payload.registrationType === "team") {
      setRegistrationSummary({
        registrationType: "team",
        teamName: result.teamName,
        playerCount: result.playerCount,
        isReserve: Boolean(result.isReserve),
      });
      setLastRegistrantNumber(null);
    } else {
      const trimmed = String(payload.discordUsername || "")
        .trim()
        .toLowerCase();
      const list = result.isReserve ? next?.reserves : next?.confirmed;
      const registrantNumber = list
        ? list.map((r) => r.name.trim().toLowerCase()).lastIndexOf(trimmed) +
            1 || list.length
        : null;
      setRegistrationSummary({
        registrationType: "solo",
        playerName: payload.discordUsername,
        isReserve: Boolean(result.isReserve),
      });
      setLastRegistrantNumber(registrantNumber);
    }

    setJoinedAsReserve(Boolean(result.isReserve));
    setRegStatus("success");
  };

  const handleTeamSlotRegister = async (payload) => {
    const tournamentKey =
      tournament.tournamentId || tournament.slug || tournament.id;
    const result = await registerTeamSlot({
      tournamentId: payload.tournamentId,
      teamName: payload.teamName,
      mains: payload.mains,
      substitutes: payload.substitutes,
    });

    markRegisteredForTournament(tournamentKey);
    await refreshRoster(tournament.tournamentId);
    setRegistrationSummary({
      registrationType: "team",
      teamName: result.teamName,
      playerCount: result.playerCount,
      substituteCount: result.substituteCount,
      isReserve: false,
    });
    setLastRegistrantNumber(null);
    setJoinedAsReserve(false);
    setRegStatus("success");
  };

  if (regStatus === "success") {
    return (
      <>
        <style>{tournamentRegistrationStyles}</style>
        <TournamentRegistrationSuccess
          tournament={tournament}
          capacity={isTeamSlots ? teamLimit : capacity}
          registrationCount={isTeamSlots ? filledTeams : confirmedCount}
          registrantNumber={lastRegistrantNumber}
          isReserve={joinedAsReserve}
          reserveCount={isTeamSlots ? 0 : reserveCount}
          reserveLimit={isTeamSlots ? 0 : reserveLimit}
          registrationSummary={registrationSummary}
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
              tournament={liveTournament}
              playerCount={confirmedCount}
              capacity={capacity}
              reserveCount={reserveCount}
              reserveLimit={isTeamSlots ? 0 : reserveLimit}
              teamFilled={filledTeams}
            />

            <TournamentCountdown tournament={liveTournament} />

            {showRegistrationForm ? (
              <div className="register-card">
                <div className="register-body">
                  {isTeamSlots ? (
                    <TeamSlotRegistrationForm
                      tournament={liveTournament}
                      slots={displaySlots}
                      onSubmit={handleTeamSlotRegister}
                    />
                  ) : isValorantChampionship2 ? (
                    <ValorantRegistrationForm
                      tournament={liveTournament}
                      capacity={capacity}
                      registrationCount={confirmedCount}
                      reserveCount={reserveCount}
                      reserveLimit={reserveLimit}
                      isReserveMode={isReserveMode}
                      tournamentFull={mainFull && reserveFull}
                      onSubmit={handleValorantRegister}
                    />
                  ) : (
                    <TournamentRegistrationForm
                      tournament={liveTournament}
                      capacity={capacity}
                      registrationCount={confirmedCount}
                      reserveCount={reserveCount}
                      reserveLimit={reserveLimit}
                      isReserveMode={isReserveMode}
                      tournamentFull={mainFull && reserveFull}
                      onSubmit={handleRegister}
                    />
                  )}
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

            {isCompleted ? (
              isTeamSlots ? (
                <div className="register-card">
                  <div className="register-body">
                    <TeamSlotRoster
                      slots={displaySlots}
                      mainSize={teamMainSize}
                      substituteSize={teamSubstituteSize}
                    />
                  </div>
                </div>
              ) : (
                <RegisteredPlayersGrid
                  players={tournament.tournamentId ? displayParticipants : []}
                  accent={tsAccent}
                  title="Participants"
                  emptyMessage="No participants recorded."
                />
              )
            ) : isTeamSlots ? (
              showRegistrationForm ? null : (
                <div className="register-card">
                  <div className="register-body">
                    <TeamSlotRoster
                      slots={displaySlots}
                      mainSize={teamMainSize}
                      substituteSize={teamSubstituteSize}
                    />
                  </div>
                </div>
              )
            ) : (
              <>
                <RegisteredPlayersGrid
                  players={tournament.tournamentId ? confirmed : []}
                  accent={tsAccent}
                  title="Registered Players"
                />

                {Number(reserveLimit) > 0 ? (
                  <RegisteredPlayersGrid
                    players={tournament.tournamentId ? reserves : []}
                    accent={tsAccent}
                    title="Reserve Players"
                    showReserveTooltip
                    emptyMessage="No reserve players yet."
                  />
                ) : null}
              </>
            )}

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
                totalPlayers={standingsPlayerCount}
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
