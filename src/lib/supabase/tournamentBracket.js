/**
 * Tournament bracket / groups / fixtures data access (Phase 2 hub).
 * Single batched fetch — no N+1.
 */

import { getSupabaseClient, getSupabaseConfigIssues } from "../../supabase";

/**
 * @typedef {{ id: string, name: string, slug: string | null }} BracketPlayer
 * @typedef {{
 *   id: string,
 *   label: string,
 *   members: Array<{ seed: number, player: BracketPlayer | null }>
 * }} TournamentGroup
 * @typedef {{
 *   id: string,
 *   stage: string,
 *   roundLabel: string,
 *   fixtureOrder: number,
 *   status: 'scheduled' | 'live' | 'completed' | string,
 *   scheduledAt: string | null,
 *   completedAt: string | null,
 *   player1Score: number | null,
 *   player2Score: number | null,
 *   player1Placeholder: string | null,
 *   player2Placeholder: string | null,
 *   player1: BracketPlayer | null,
 *   player2: BracketPlayer | null,
 *   winner: BracketPlayer | null,
 *   groupId: string | null,
 *   groupLabel: string | null,
 *   player1TeamIds?: string[],
 *   player2TeamIds?: string[],
 * }} TournamentFixture
 * @typedef {{
 *   groups: TournamentGroup[],
 *   fixtures: TournamentFixture[],
 *   hasGroups: boolean,
 *   hasKnockout: boolean,
 * }} TournamentBracketData
 */

/**
 * @returns {import("@supabase/supabase-js").SupabaseClient}
 */
function requireClient() {
  const issues = getSupabaseConfigIssues();
  if (issues.length > 0) {
    throw new Error(issues.join(" "));
  }
  return getSupabaseClient();
}

/**
 * @param {object | null | undefined} row
 * @returns {BracketPlayer | null}
 */
function mapPlayer(row) {
  if (!row || typeof row !== "object") return null;
  const name = row.discord_username || row.display_name || row.name || null;
  if (!name) return null;
  return {
    id: row.id,
    name,
    slug: row.slug || null,
  };
}

/**
 * @param {BracketPlayer | null} player
 * @param {Map<string, { label: string, memberIds: string[] }>} teamByPlayerId
 * @returns {{ player: BracketPlayer | null, memberIds: string[] }}
 */
function applyTeamSide(player, teamByPlayerId) {
  if (!player) return { player: null, memberIds: [] };
  const team = teamByPlayerId.get(player.id);
  if (!team) return { player, memberIds: [player.id] };
  return {
    player: { id: player.id, name: team.label, slug: null },
    memberIds: team.memberIds,
  };
}

/**
 * @param {object} row
 * @param {Map<string, { label: string, memberIds: string[] }>} [teamByPlayerId]
 * @returns {TournamentFixture}
 */
function mapFixture(row, teamByPlayerId = new Map()) {
  const group = Array.isArray(row.tournament_groups)
    ? row.tournament_groups[0]
    : row.tournament_groups;

  const rawPlayer1 = mapPlayer(row.player1);
  const rawPlayer2 = mapPlayer(row.player2);
  const rawWinner = mapPlayer(row.winner);
  const side1 = applyTeamSide(rawPlayer1, teamByPlayerId);
  const side2 = applyTeamSide(rawPlayer2, teamByPlayerId);

  let winner = rawWinner;
  if (rawWinner && teamByPlayerId.has(rawWinner.id)) {
    const team = teamByPlayerId.get(rawWinner.id);
    winner = { id: rawWinner.id, name: team.label, slug: null };
  }

  return {
    id: row.id,
    stage: row.stage,
    roundLabel: row.round_label,
    fixtureOrder: row.fixture_order ?? 0,
    status: row.status ?? "scheduled",
    scheduledAt: row.scheduled_at ?? null,
    completedAt: row.completed_at ?? null,
    player1Score: row.player1_score ?? null,
    player2Score: row.player2_score ?? null,
    player1Placeholder: row.player1_placeholder ?? null,
    player2Placeholder: row.player2_placeholder ?? null,
    player1: side1.player,
    player2: side2.player,
    winner,
    groupId: row.group_id ?? group?.id ?? null,
    groupLabel: group?.label ?? null,
    player1TeamIds: side1.memberIds,
    player2TeamIds: side2.memberIds,
  };
}

/**
 * Build player_id → doubles team label map for a tournament.
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @param {string} tournamentId
 * @returns {Promise<Map<string, { label: string, memberIds: string[] }>>}
 */
async function fetchTeamLabelsByPlayerId(client, tournamentId) {
  /** @type {Map<string, { label: string, memberIds: string[] }>} */
  const map = new Map();

  const { data, error } = await client
    .from("tournament_teams")
    .select(
      `
      id,
      name,
      tournament_team_members (
        player_id,
        players (
          id,
          display_name,
          discord_username
        )
      )
    `
    )
    .eq("tournament_id", tournamentId);

  if (error || !data?.length) return map;

  for (const team of data) {
    const members = team.tournament_team_members ?? [];
    const names = members
      .map((m) => {
        const p = Array.isArray(m.players) ? m.players[0] : m.players;
        return p?.discord_username || p?.display_name || null;
      })
      .filter(Boolean);
    const memberIds = members
      .map((m) => m.player_id)
      .filter(Boolean)
      .map(String);
    const label =
      names.length >= 2
        ? `${names[0]} + ${names[1]}`
        : team.name || names[0] || "Team";
    for (const id of memberIds) {
      map.set(id, { label, memberIds });
    }
  }

  return map;
}

/**
 * Public display label for fixture status.
 * @param {string} status
 * @returns {'Upcoming' | 'Live' | 'Completed'}
 */
export function fixtureStatusLabel(status) {
  if (status === "live") return "Live";
  if (status === "completed") return "Completed";
  return "Upcoming";
}

/**
 * Knockout stage display titles (existing schema stages).
 * @param {string} stage
 * @returns {string}
 */
export function knockoutStageTitle(stage) {
  switch (stage) {
    case "round_of_16":
      return "Round of 16";
    case "quarterfinal":
      return "Quarter Finals";
    case "semifinal":
      return "Semi Finals";
    case "final":
      return "Grand Final";
    default:
      return stage;
  }
}

/**
 * Fetch groups + fixtures for a tournament in two queries (parallel).
 * @param {string} tournamentId
 * @returns {Promise<TournamentBracketData>}
 */
export async function fetchTournamentBracket(tournamentId) {
  if (!tournamentId) {
    return { groups: [], fixtures: [], hasGroups: false, hasKnockout: false };
  }

  const client = requireClient();

  const [groupsRes, fixturesRes, teamByPlayerId] = await Promise.all([
    client
      .from("tournament_groups")
      .select(
        `
        id,
        label,
        tournament_group_members (
          seed,
          players (
            id,
            display_name,
            slug
          )
        )
      `
      )
      .eq("tournament_id", tournamentId)
      .order("label", { ascending: true }),
    client
      .from("tournament_fixtures")
      .select(
        `
        id,
        stage,
        group_id,
        round_label,
        fixture_order,
        status,
        scheduled_at,
        completed_at,
        player1_score,
        player2_score,
        player1_placeholder,
        player2_placeholder,
        player1:players!tournament_fixtures_player1_id_fkey (
          id,
          display_name,
          discord_username,
          slug
        ),
        player2:players!tournament_fixtures_player2_id_fkey (
          id,
          display_name,
          discord_username,
          slug
        ),
        winner:players!tournament_fixtures_winner_id_fkey (
          id,
          display_name,
          discord_username,
          slug
        ),
        tournament_groups (
          id,
          label
        )
      `
      )
      .eq("tournament_id", tournamentId)
      .order("stage", { ascending: true })
      .order("fixture_order", { ascending: true }),
    fetchTeamLabelsByPlayerId(client, tournamentId),
  ]);

  if (groupsRes.error) throw groupsRes.error;
  if (fixturesRes.error) throw fixturesRes.error;

  /** @type {TournamentGroup[]} */
  const groups = (groupsRes.data ?? []).map((g) => {
    const members = (g.tournament_group_members ?? [])
      .map((m) => ({
        seed: m.seed,
        player: mapPlayer(m.players),
      }))
      .sort((a, b) => a.seed - b.seed);
    return { id: g.id, label: g.label, members };
  });

  const fixtures = (fixturesRes.data ?? []).map((row) =>
    mapFixture(row, teamByPlayerId)
  );
  const hasKnockout = fixtures.some((f) => f.stage !== "group");

  return {
    groups,
    fixtures,
    hasGroups: groups.length > 0,
    hasKnockout,
  };
}

/**
 * @param {TournamentFixture[]} fixtures
 * @returns {TournamentFixture[]}
 */
export function completedFixtures(fixtures) {
  return (fixtures ?? [])
    .filter((f) => f.status === "completed")
    .sort((a, b) => {
      const at = a.completedAt ? Date.parse(a.completedAt) : 0;
      const bt = b.completedAt ? Date.parse(b.completedAt) : 0;
      return bt - at;
    });
}

/**
 * @param {TournamentFixture[]} fixtures
 * @returns {Record<string, TournamentFixture[]>}
 */
export function groupKnockoutByStage(fixtures) {
  /** @type {Record<string, TournamentFixture[]>} */
  const map = {};
  for (const f of fixtures ?? []) {
    if (f.stage === "group") continue;
    if (!map[f.stage]) map[f.stage] = [];
    map[f.stage].push(f);
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.fixtureOrder - b.fixtureOrder);
  }
  return map;
}

/** Preferred knockout display order */
export const KNOCKOUT_STAGE_ORDER = [
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "final",
];
