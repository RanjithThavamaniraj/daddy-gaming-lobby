-- DGL Phase 2 Wave A + Wave B
-- #21 Restrict anon INSERT on players; close public writes on player_game_profiles
-- #3 Canonical "Registered Players" = get_platform_stats()
-- #7 Exclude substitutes from confirmed_count
--
-- Does not modify Phase 1 registration trigger / GUC logic.
-- Does not depend on the Discord membership gate migration.

begin;

-- ---------------------------------------------------------------------------
-- #21 players: keep the public registration identity INSERT.
--     player_game_profiles: no anon/authenticated INSERT or UPDATE.
--
-- There is no auth.uid() → player mapping (Discord Gate frozen). Column
-- grants cannot create row ownership, so profile writes stay closed until a
-- real identity path exists. Team registration RPCs are SECURITY DEFINER
-- and bypass RLS; they are not modified here. Solo Valorant rank remains in
-- tournament_registrations.form_data; the client profile upsert is best-effort.
-- ---------------------------------------------------------------------------

drop policy if exists "players_anon_insert" on public.players;
create policy "players_anon_insert"
  on public.players for insert
  to anon, authenticated
  with check (
    display_name is not null
    and btrim(display_name) <> ''
    and is_verified is not true
    and avatar_url is null
    and coalesce(metadata, '{}'::jsonb) = '{}'::jsonb
  );

revoke insert on public.players from public;
revoke insert on public.players from anon, authenticated;
grant insert (display_name, discord_username)
  on public.players to anon, authenticated;
grant all on public.players to service_role;

drop policy if exists "player_game_profiles_anon_insert" on public.player_game_profiles;
drop policy if exists "player_game_profiles_anon_update_rank" on public.player_game_profiles;

revoke insert on public.player_game_profiles from public;
revoke insert on public.player_game_profiles from anon, authenticated;
revoke update on public.player_game_profiles from public;
revoke update on public.player_game_profiles from anon, authenticated;

grant all on public.player_game_profiles to service_role;

-- ---------------------------------------------------------------------------
-- #3 One canonical "Registered Players" definition
--
-- Dashboard already uses get_platform_stats(): distinct player_id (or
-- registration id) among pending / confirmed / waitlist.
-- Home community proof previously counted distinct completed placements.
-- Reuse get_platform_stats rather than a second counting expression.
-- ---------------------------------------------------------------------------

create or replace function public.get_home_community_proof_stats()
returns jsonb
language sql
stable
set search_path = public
as $$
  with completed as (
    select count(*)::integer as tournaments_hosted
    from public.tournaments
    where status = 'completed'::public.dgl_tournament_status
  ),
  registrations as (
    select (public.get_platform_stats()->>'registered_players')::integer as registered_players
  ),
  champions as (
    select count(*)::integer as champions_crowned
    from public.tournament_placements tp
    where tp.placement = 1
      and tp.entity_type = 'player'
  ),
  prizes as (
    select coalesce(sum(prize_pool_amount), 0)::numeric as prize_pool_awarded
    from public.tournaments
    where status = 'completed'::public.dgl_tournament_status
      and prize_pool_amount is not null
  )
  select jsonb_build_object(
    'tournaments_hosted', (select tournaments_hosted from completed),
    'registered_players', (select registered_players from registrations),
    'champions_crowned', (select champions_crowned from champions),
    'prize_pool_awarded', (select prize_pool_awarded from prizes)
  );
$$;

comment on function public.get_home_community_proof_stats() is
  'Home community-proof aggregates. registered_players reuses get_platform_stats().';

-- ---------------------------------------------------------------------------
-- #7 confirmed_count is main/confirmed occupancy, not substitutes
--
-- Same roster_role rule as the Phase 1 capacity trigger. waitlist_count and
-- registered_count (all active statuses) are unchanged. v_tournaments_enriched
-- already joins this view, so listings pick up the new confirmed_count.
-- ---------------------------------------------------------------------------

create or replace view public.v_tournament_registration_counts
with (security_invoker = true) as
select
  tr.tournament_id,
  count(*) filter (
    where tr.status in ('pending', 'confirmed', 'waitlist')
  )::integer as registered_count,
  count(*) filter (
    where tr.status = 'confirmed'
      and coalesce(form_data->>'roster_role', '') is distinct from 'substitute'
  )::integer as confirmed_count,
  count(*) filter (where tr.status = 'waitlist')::integer as waitlist_count
from public.tournament_registrations tr
group by tr.tournament_id;

comment on view public.v_tournament_registration_counts is
  'Active headcount per tournament. confirmed_count excludes substitute roster_role.';

grant select on public.v_tournament_registration_counts to anon, authenticated;

commit;
