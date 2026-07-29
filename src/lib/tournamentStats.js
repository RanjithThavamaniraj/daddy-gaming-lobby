import { getCompletedTournaments } from "./tournamentModel";
import { parsePrizePoolAmount, formatInrPrize } from "./prizePool";

export { parsePrizePoolAmount, formatInrPrize };

/**
 * Unique players from completed tournament rosters.
 * @param {ReturnType<typeof getCompletedTournaments>} completed
 * @returns {Set<string>}
 */
export function collectCompletedTournamentPlayers(completed) {
  const playerSet = new Set();
  for (const tournament of completed) {
    for (const name of tournament.championPlayers) playerSet.add(name);
    for (const name of tournament.runnerUpPlayers) playerSet.add(name);
  }
  return playerSet;
}

/**
 * Unique champion players across completed tournaments.
 * @param {ReturnType<typeof getCompletedTournaments>} completed
 * @returns {Set<string>}
 */
export function collectChampionPlayers(completed) {
  const championSet = new Set();
  for (const tournament of completed) {
    for (const name of tournament.championPlayers) championSet.add(name);
  }
  return championSet;
}

/**
 * Sum awarded prize pools from completed tournaments.
 * @param {ReturnType<typeof getCompletedTournaments>} completed
 * @returns {number}
 */
export function sumAwardedPrizePools(completed) {
  let total = 0;
  for (const tournament of completed) {
    total += parsePrizePoolAmount(tournament.prizePool);
  }
  return total;
}

/**
 * Base aggregates from completed tournaments — shared by dashboard and homepage.
 * @param {ReturnType<typeof getCompletedTournaments>} [completed]
 */
export function aggregateCompletedTournamentStats(completed = getCompletedTournaments()) {
  const players = collectCompletedTournamentPlayers(completed);
  const champions = collectChampionPlayers(completed);
  const prizePoolAwarded = sumAwardedPrizePools(completed);

  return {
    tournamentsHosted: completed.length,
    registeredPlayers: players.size,
    championsCrowned: champions.size,
    prizePoolAwarded,
    prizePoolDisplay: formatInrPrize(prizePoolAwarded),
  };
}
