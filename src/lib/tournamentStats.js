import { getCompletedTournaments } from "./tournamentModel";

/**
 * Parse numeric INR amount from a prize pool string (e.g. "₹1,000 Awarded").
 * @param {string | undefined} prizePool
 * @returns {number}
 */
export function parsePrizePoolAmount(prizePool) {
  const numericPrize = parseInt(String(prizePool ?? "").replace(/[^\d]/g, ""), 10);
  return Number.isNaN(numericPrize) ? 0 : numericPrize;
}

/**
 * @param {number} amount
 * @returns {string}
 */
export function formatInrPrize(amount) {
  return amount > 0 ? `₹${amount.toLocaleString("en-IN")}` : "₹0";
}

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
