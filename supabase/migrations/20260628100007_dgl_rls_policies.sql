-- DGL schema extension — migration 8 of 8
-- Row Level Security (public read, controlled writes).

begin;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

alter table public.games enable row level security;
alter table public.players enable row level security;
alter table public.player_game_profiles enable row level security;
alter table public.tournament_series enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_teams enable row level security;
alter table public.tournament_team_members enable row level security;
alter table public.tournament_registrations enable row level security;
alter table public.tournament_placements enable row level security;
alter table public.dgl_points_rules enable row level security;
alter table public.player_points_ledger enable row level security;
alter table public.player_points_summary enable row level security;
alter table public.platform_updates enable row level security;
alter table public.community_activity enable row level security;

-- ---------------------------------------------------------------------------
-- Public read policies
-- ---------------------------------------------------------------------------

drop policy if exists "games_public_read" on public.games;
create policy "games_public_read"
  on public.games for select
  to anon, authenticated
  using (true);

drop policy if exists "players_public_read" on public.players;
create policy "players_public_read"
  on public.players for select
  to anon, authenticated
  using (true);

drop policy if exists "player_game_profiles_public_read" on public.player_game_profiles;
create policy "player_game_profiles_public_read"
  on public.player_game_profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "tournament_series_public_read" on public.tournament_series;
create policy "tournament_series_public_read"
  on public.tournament_series for select
  to anon, authenticated
  using (true);

drop policy if exists "tournaments_public_read" on public.tournaments;
create policy "tournaments_public_read"
  on public.tournaments for select
  to anon, authenticated
  using (
    status <> 'draft'::public.dgl_tournament_status
  );

drop policy if exists "tournament_teams_public_read" on public.tournament_teams;
create policy "tournament_teams_public_read"
  on public.tournament_teams for select
  to anon, authenticated
  using (true);

drop policy if exists "tournament_team_members_public_read" on public.tournament_team_members;
create policy "tournament_team_members_public_read"
  on public.tournament_team_members for select
  to anon, authenticated
  using (true);

drop policy if exists "tournament_registrations_public_read" on public.tournament_registrations;
create policy "tournament_registrations_public_read"
  on public.tournament_registrations for select
  to anon, authenticated
  using (true);

drop policy if exists "tournament_placements_public_read" on public.tournament_placements;
create policy "tournament_placements_public_read"
  on public.tournament_placements for select
  to anon, authenticated
  using (true);

drop policy if exists "dgl_points_rules_public_read" on public.dgl_points_rules;
create policy "dgl_points_rules_public_read"
  on public.dgl_points_rules for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "player_points_ledger_public_read" on public.player_points_ledger;
create policy "player_points_ledger_public_read"
  on public.player_points_ledger for select
  to anon, authenticated
  using (true);

drop policy if exists "player_points_summary_public_read" on public.player_points_summary;
create policy "player_points_summary_public_read"
  on public.player_points_summary for select
  to anon, authenticated
  using (true);

drop policy if exists "platform_updates_public_read" on public.platform_updates;
create policy "platform_updates_public_read"
  on public.platform_updates for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "community_activity_public_read" on public.community_activity;
create policy "community_activity_public_read"
  on public.community_activity for select
  to anon, authenticated
  using (is_public = true);

-- ---------------------------------------------------------------------------
-- Registration writes (anon/authenticated — mirrors legacy registrations flow)
-- Service role bypasses RLS for admin operations.
-- ---------------------------------------------------------------------------

drop policy if exists "tournament_registrations_anon_insert" on public.tournament_registrations;
create policy "tournament_registrations_anon_insert"
  on public.tournament_registrations for insert
  to anon, authenticated
  with check (
    status in ('pending', 'confirmed')
    and player_id is not null
    and team_id is null
  );

drop policy if exists "players_anon_insert" on public.players;
create policy "players_anon_insert"
  on public.players for insert
  to anon, authenticated
  with check (true);

drop policy if exists "player_game_profiles_anon_insert" on public.player_game_profiles;
create policy "player_game_profiles_anon_insert"
  on public.player_game_profiles for insert
  to anon, authenticated
  with check (true);

-- Views inherit underlying table policies when security_invoker is default.
-- Grant SELECT on views explicitly for PostgREST.
grant select on public.v_tournaments_enriched to anon, authenticated;
grant select on public.v_hall_of_champions to anon, authenticated;
grant select on public.v_player_leaderboard to anon, authenticated;
grant select on public.v_tournament_results to anon, authenticated;
grant select on public.v_tournament_registration_counts to anon, authenticated;

do $$
begin
  if to_regclass('public.v_legacy_registrations') is not null then
    execute 'grant select on public.v_legacy_registrations to anon, authenticated';
  end if;
end $$;

commit;
