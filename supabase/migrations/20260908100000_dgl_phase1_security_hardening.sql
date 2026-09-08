-- DGL Phase 1 security hardening.
--
-- Fixes:
--   1) Anonymous INSERT cannot skip registration status/capacity/close checks.
--   2) Public SELECT cannot read registration form_data, epic_id, or metadata.
--   3) Knockout SECURITY DEFINER helpers are not executable by PUBLIC/anon/authenticated.
--
-- Does not change tournament rows, lifecycle timestamps, or UI presentation.
-- Internal team RPCs keep skip_status_assignment after a trusted session flag is set.
--
-- Reverse (manual): restore dgl_assign_registration_status skip-without-GUC,
-- restore tournament_registrations_anon_insert, GRANT SELECT/INSERT on the full
-- table to anon, GRANT EXECUTE on the three knockout helpers to PUBLIC, and
-- drop dgl_begin_internal_registration / v_tournament_registrations_public.

begin;

-- ---------------------------------------------------------------------------
-- Fix #1 — trusted internal registration flag (transaction-local GUC)
-- ---------------------------------------------------------------------------

create or replace function public.dgl_begin_internal_registration()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('dgl.internal_registration', 'on', true);
end;
$$;

comment on function public.dgl_begin_internal_registration() is
  'Marks the current transaction as a trusted DGL team-registration RPC. Not callable by anon/authenticated.';

revoke all on function public.dgl_begin_internal_registration() from public;
revoke all on function public.dgl_begin_internal_registration() from anon, authenticated;

create or replace function public.dgl_assign_registration_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_reserve_limit integer;
  v_status public.dgl_tournament_status;
  v_closes_at timestamptz;
  v_metadata jsonb;
  v_confirmed integer;
  v_reserve integer;
  v_internal boolean;
begin
  -- Trust skip_status_assignment only when a SECURITY DEFINER team RPC
  -- set dgl.internal_registration for this transaction. Direct PostgREST
  -- INSERT cannot set that GUC (helper EXECUTE is revoked from anon).
  v_internal := coalesce(
    current_setting('dgl.internal_registration', true),
    ''
  ) = 'on';

  if not v_internal then
    new.metadata := coalesce(new.metadata, '{}'::jsonb) - 'skip_status_assignment';
    if jsonb_typeof(coalesce(new.form_data, '{}'::jsonb)) = 'object' then
      new.form_data := coalesce(new.form_data, '{}'::jsonb) - 'roster_role';
    end if;
    -- Client-chosen waitlist previously returned before close/capacity checks.
    if new.status is distinct from 'pending' then
      new.status := 'confirmed';
    end if;
  elsif coalesce(new.metadata->>'skip_status_assignment', '') = 'true' then
    return new;
  end if;

  if new.status is distinct from 'confirmed' and new.status is distinct from 'pending' then
    return new;
  end if;

  select
    registration_limit,
    coalesce(reserve_limit, 0),
    status,
    registration_closes_at,
    metadata
  into v_limit, v_reserve_limit, v_status, v_closes_at, v_metadata
  from public.tournaments
  where id = new.tournament_id
  for update;

  if not found then
    raise exception 'Tournament not found';
  end if;

  if v_status in ('completed', 'cancelled', 'active', 'draft') then
    raise exception 'Registration is closed for this tournament (status %)', v_status;
  end if;

  if v_status = 'coming_soon' then
    raise exception 'Registration has not opened yet';
  end if;

  if v_closes_at is not null and v_closes_at <= timezone('utc', now()) then
    raise exception 'Registrations Closed';
  end if;

  if coalesce(v_metadata->>'registration_mode', '') = 'team_slots' then
    raise exception 'This tournament requires team registration';
  end if;

  select count(*) into v_confirmed
  from public.tournament_registrations
  where tournament_id = new.tournament_id
    and status in ('pending', 'confirmed')
    and coalesce(form_data->>'roster_role', '') is distinct from 'substitute';

  if v_limit is null or v_confirmed < v_limit then
    new.status := 'confirmed';
    new.confirmed_at := coalesce(new.confirmed_at, timezone('utc', now()));
    return new;
  end if;

  select count(*) into v_reserve
  from public.tournament_registrations
  where tournament_id = new.tournament_id
    and status = 'waitlist';

  if v_status in ('registration_open', 'registration_closed')
     and v_reserve_limit > 0
     and v_reserve < v_reserve_limit then
    new.status := 'waitlist';
    new.confirmed_at := null;
    return new;
  end if;

  raise exception 'Tournament Full';
end;
$$;

drop policy if exists "tournament_registrations_anon_insert" on public.tournament_registrations;
create policy "tournament_registrations_anon_insert"
  on public.tournament_registrations for insert
  to anon, authenticated
  with check (
    status in ('pending', 'confirmed', 'waitlist')
    and player_id is not null
    and team_id is null
    and not coalesce(metadata ? 'skip_status_assignment', false)
    and coalesce(form_data->>'roster_role', '') is distinct from 'substitute'
  );

-- ---------------------------------------------------------------------------
-- Fix #2 — public registration columns (no form_data / epic_id / metadata)
-- ---------------------------------------------------------------------------

create or replace view public.v_tournament_registrations_public
with (security_invoker = true) as
select
  tr.id,
  tr.tournament_id,
  tr.player_id,
  tr.team_id,
  tr.status,
  tr.registered_at,
  tr.rocket_league_rank
from public.tournament_registrations tr;

comment on view public.v_tournament_registrations_public is
  'Public roster surface. Omits form_data, epic_id, metadata, and other registration PII.';

revoke all on public.v_tournament_registrations_public from public;
grant select on public.v_tournament_registrations_public to anon, authenticated;

revoke select on public.tournament_registrations from public;
revoke select on public.tournament_registrations from anon;
revoke insert on public.tournament_registrations from public;
revoke insert on public.tournament_registrations from anon, authenticated;

grant select (
  id,
  tournament_id,
  player_id,
  team_id,
  status,
  registered_at,
  rocket_league_rank
) on public.tournament_registrations to anon;

grant insert (
  tournament_id,
  player_id,
  status,
  form_data,
  epic_id,
  rocket_league_rank,
  team_name,
  needs_teammate,
  teammate_display_name
) on public.tournament_registrations to anon, authenticated;

grant select on public.tournament_registrations to authenticated;
grant all on public.tournament_registrations to service_role;

-- ---------------------------------------------------------------------------
-- Fix #1 continued — team RPCs mark the transaction as internal
-- ---------------------------------------------------------------------------
create or replace function public.dgl_register_team_slot(
  p_tournament_id uuid,
  p_team_name text,
  p_mains jsonb,
  p_substitutes jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tournament record;
  v_team record;
  v_group_id uuid := gen_random_uuid();
  v_main_size integer;
  v_sub_size integer;
  v_team_limit integer;
  v_main_count integer;
  v_sub_count integer;
  v_existing_mains integer;
  v_player jsonb;
  v_discord text;
  v_player_id uuid;
  v_key text;
  v_reg_id uuid;
  v_registration_ids uuid[] := '{}';
  v_discord_keys text[] := '{}';
  v_i integer;
  v_subs jsonb;
  v_role public.dgl_team_member_role;
begin
  perform public.dgl_begin_internal_registration();

  select t.*, g.id as game_id
    into v_tournament
  from public.tournaments t
  join public.games g on g.id = t.game_id
  where t.id = p_tournament_id
  for update;

  if not found then
    raise exception 'Tournament not found';
  end if;

  if coalesce(v_tournament.metadata->>'registration_mode', '') is distinct from 'team_slots' then
    raise exception 'Team-slot registration is not enabled for this tournament';
  end if;

  if v_tournament.status in ('completed', 'cancelled', 'active', 'draft') then
    raise exception 'Registration is closed for this tournament (status %)', v_tournament.status;
  end if;

  if v_tournament.status = 'coming_soon' then
    raise exception 'Registration has not opened yet';
  end if;

  if v_tournament.registration_closes_at is not null
     and v_tournament.registration_closes_at <= timezone('utc', now()) then
    raise exception 'Registrations Closed';
  end if;

  v_main_size := coalesce((v_tournament.metadata->>'team_main_size')::integer, 0);
  v_sub_size := coalesce((v_tournament.metadata->>'team_substitute_size')::integer, 0);
  v_team_limit := coalesce((v_tournament.metadata->>'team_limit')::integer, 0);

  if v_main_size <= 0 or v_team_limit <= 0 then
    raise exception 'Team-slot tournament is missing roster configuration';
  end if;

  if p_team_name is null or trim(p_team_name) !~ '^Team [1-9][0-9]*$' then
    raise exception 'Select an available team slot (Team 1, Team 2, …)';
  end if;

  if jsonb_typeof(p_mains) is distinct from 'array'
     or jsonb_array_length(p_mains) is distinct from v_main_size then
    raise exception 'A full team requires exactly % starting players', v_main_size;
  end if;

  v_subs := case
    when p_substitutes is null or jsonb_typeof(p_substitutes) is distinct from 'array'
      then '[]'::jsonb
    else p_substitutes
  end;

  if jsonb_array_length(v_subs) > v_sub_size then
    raise exception 'A team may register at most % substitutes', v_sub_size;
  end if;

  for v_i in 0..(v_main_size - 1) loop
    v_discord := trim(p_mains->v_i->>'discord_username');
    if v_discord is null or v_discord = '' then
      raise exception 'Discord username is required for all starting players';
    end if;
    v_key := lower(v_discord);
    if v_key = any(v_discord_keys) then
      raise exception 'Duplicate Discord username in team: %', v_discord;
    end if;
    v_discord_keys := array_append(v_discord_keys, v_key);
  end loop;

  if jsonb_array_length(v_subs) > 0 then
    for v_i in 0..(jsonb_array_length(v_subs) - 1) loop
      v_discord := trim(v_subs->v_i->>'discord_username');
      if v_discord is null or v_discord = '' then
        raise exception 'Discord username is required for each listed substitute';
      end if;
      v_key := lower(v_discord);
      if v_key = any(v_discord_keys) then
        raise exception 'Duplicate Discord username in team: %', v_discord;
      end if;
      v_discord_keys := array_append(v_discord_keys, v_key);
    end loop;
  end if;

  select count(*) into v_main_count
  from public.tournament_registrations
  where tournament_id = p_tournament_id
    and status in ('pending', 'confirmed')
    and coalesce(form_data->>'roster_role', '') is distinct from 'substitute';

  if coalesce(v_tournament.registration_limit, 0) - v_main_count < v_main_size then
    raise exception 'Not enough main capacity for a full team (% starting player slots required)', v_main_size;
  end if;

  foreach v_key in array v_discord_keys loop
    if exists (
      select 1
      from public.tournament_registrations tr
      join public.players p on p.id = tr.player_id
      where tr.tournament_id = p_tournament_id
        and p.display_name_key = v_key
        and tr.status in ('pending', 'confirmed', 'waitlist')
    ) then
      raise exception 'Player already registered: %', v_key;
    end if;
  end loop;

  select tt.id, tt.name
    into v_team
  from public.tournament_teams tt
  where tt.tournament_id = p_tournament_id
    and tt.name = trim(p_team_name)
  for update;

  if not found then
    raise exception 'Team slot % does not exist', trim(p_team_name);
  end if;

  select count(*) into v_existing_mains
  from public.tournament_team_members tm
  where tm.team_id = v_team.id
    and tm.role in ('captain', 'member');

  if v_existing_mains > 0 then
    raise exception 'Team slot % is already taken', trim(p_team_name);
  end if;

  -- Starting roster
  for v_i in 0..(v_main_size - 1) loop
    v_player := p_mains->v_i;
    v_discord := trim(v_player->>'discord_username');
    v_key := lower(v_discord);

    select id into v_player_id
    from public.players
    where display_name_key = v_key;

    if not found then
      insert into public.players (display_name, discord_username)
      values (v_discord, v_discord)
      returning id into v_player_id;
    end if;

    perform public.dgl_ensure_player_points_summary(v_player_id);

    insert into public.tournament_registrations (
      tournament_id,
      player_id,
      status,
      confirmed_at,
      team_name,
      form_data,
      metadata
    ) values (
      p_tournament_id,
      v_player_id,
      'confirmed',
      timezone('utc', now()),
      trim(p_team_name),
      jsonb_build_object(
        'discord_username', v_discord,
        'registration_type', 'team_slot',
        'registration_group_id', v_group_id::text,
        'roster_role', 'main',
        'is_captain', coalesce((v_player->>'is_captain')::boolean, v_i = 0)
      ),
      jsonb_build_object('skip_status_assignment', true)
    )
    returning id into v_reg_id;

    v_registration_ids := array_append(v_registration_ids, v_reg_id);

    v_role := case
      when coalesce((v_player->>'is_captain')::boolean, v_i = 0)
        then 'captain'::public.dgl_team_member_role
      else 'member'::public.dgl_team_member_role
    end;

    insert into public.tournament_team_members (team_id, player_id, role)
    values (v_team.id, v_player_id, v_role);
  end loop;

  -- Substitutes (optional, 0..sub_size)
  if jsonb_array_length(v_subs) > 0 then
    for v_i in 0..(jsonb_array_length(v_subs) - 1) loop
      v_player := v_subs->v_i;
      v_discord := trim(v_player->>'discord_username');
      v_key := lower(v_discord);

      select id into v_player_id
      from public.players
      where display_name_key = v_key;

      if not found then
        insert into public.players (display_name, discord_username)
        values (v_discord, v_discord)
        returning id into v_player_id;
      end if;

      perform public.dgl_ensure_player_points_summary(v_player_id);

      insert into public.tournament_registrations (
        tournament_id,
        player_id,
        status,
        confirmed_at,
        team_name,
        form_data,
        metadata
      ) values (
        p_tournament_id,
        v_player_id,
        'confirmed',
        timezone('utc', now()),
        trim(p_team_name),
        jsonb_build_object(
          'discord_username', v_discord,
          'registration_type', 'team_slot',
          'registration_group_id', v_group_id::text,
          'roster_role', 'substitute',
          'is_captain', false
        ),
        jsonb_build_object('skip_status_assignment', true)
      )
      returning id into v_reg_id;

      v_registration_ids := array_append(v_registration_ids, v_reg_id);

      insert into public.tournament_team_members (team_id, player_id, role)
      values (v_team.id, v_player_id, 'substitute'::public.dgl_team_member_role);
    end loop;
  end if;

  select count(*) into v_main_count
  from public.tournament_registrations
  where tournament_id = p_tournament_id
    and status in ('pending', 'confirmed')
    and coalesce(form_data->>'roster_role', '') is distinct from 'substitute';

  if v_tournament.registration_limit is not null
     and v_main_count >= v_tournament.registration_limit
     and v_tournament.status = 'registration_open' then
    update public.tournaments
    set status = 'registration_closed',
        updated_at = timezone('utc', now())
    where id = p_tournament_id;
  end if;

  v_sub_count := jsonb_array_length(v_subs);

  return jsonb_build_object(
    'team_id', v_team.id,
    'team_name', trim(p_team_name),
    'registration_group_id', v_group_id,
    'registration_ids', to_jsonb(v_registration_ids),
    'status', 'confirmed',
    'is_reserve', false,
    'player_count', v_main_size,
    'substitute_count', v_sub_count,
    'main_size', v_main_size,
    'substitute_size', v_sub_size
  );
end;
$$;

create or replace function public.dgl_register_valorant_team(
  p_tournament_id uuid,
  p_team_name text,
  p_players jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tournament record;
  v_team_id uuid;
  v_group_id uuid := gen_random_uuid();
  v_confirmed integer;
  v_main_available integer;
  v_player jsonb;
  v_discord text;
  v_rank text;
  v_player_id uuid;
  v_key text;
  v_reg_id uuid;
  v_registration_ids uuid[] := '{}';
  v_discord_keys text[] := '{}';
  v_i integer;
  v_target_status public.dgl_registration_status := 'confirmed';
begin
  perform public.dgl_begin_internal_registration();

  select t.*, g.id as game_id
    into v_tournament
  from public.tournaments t
  join public.games g on g.id = t.game_id
  where t.id = p_tournament_id
  for update;

  if not found then
    raise exception 'Tournament not found';
  end if;

  if v_tournament.external_id is distinct from 'dgl-valorant-championship-2' then
    raise exception 'Team registration is only available for Valorant Championship #2';
  end if;

  if v_tournament.status in ('completed', 'cancelled', 'active', 'draft') then
    raise exception 'Registration is closed for this tournament (status %)', v_tournament.status;
  end if;

  if v_tournament.status = 'coming_soon' then
    raise exception 'Registration has not opened yet';
  end if;

  if v_tournament.registration_closes_at is not null
     and v_tournament.registration_closes_at <= timezone('utc', now()) then
    raise exception 'Registrations Closed';
  end if;

  if p_team_name is null or trim(p_team_name) = '' then
    raise exception 'Team name is required';
  end if;

  if jsonb_typeof(p_players) is distinct from 'array'
     or jsonb_array_length(p_players) is distinct from 5 then
    raise exception 'A full team requires exactly 5 players';
  end if;

  for v_i in 0..4 loop
    v_player := p_players->v_i;
    v_discord := trim(v_player->>'discord_username');
    v_rank := trim(v_player->>'rank');

    if v_discord is null or v_discord = '' then
      raise exception 'Discord username is required for all players';
    end if;

    if v_rank is null or v_rank = '' then
      raise exception 'Valorant rank is required for all players';
    end if;

    v_key := lower(v_discord);
    if v_key = any(v_discord_keys) then
      raise exception 'Duplicate Discord username in team: %', v_discord;
    end if;
    v_discord_keys := array_append(v_discord_keys, v_key);
  end loop;

  select count(*) into v_confirmed
  from public.tournament_registrations
  where tournament_id = p_tournament_id
    and status in ('pending', 'confirmed');

  v_main_available := coalesce(v_tournament.registration_limit, 0) - v_confirmed;

  -- Full teams register into MAIN only — never reserve.
  if v_main_available < 5 then
    raise exception 'Not enough main capacity for a full team (5 main player slots required)';
  end if;

  v_target_status := 'confirmed';

  for v_i in 0..4 loop
    v_discord := trim((p_players->v_i)->>'discord_username');
    v_key := lower(v_discord);

    if exists (
      select 1
      from public.tournament_registrations tr
      join public.players p on p.id = tr.player_id
      where tr.tournament_id = p_tournament_id
        and p.display_name_key = v_key
        and tr.status in ('pending', 'confirmed', 'waitlist')
    ) then
      raise exception 'Player already registered: %', v_discord;
    end if;
  end loop;

  insert into public.tournament_teams (tournament_id, name)
  values (p_tournament_id, trim(p_team_name))
  returning id into v_team_id;

  for v_i in 0..4 loop
    v_player := p_players->v_i;
    v_discord := trim(v_player->>'discord_username');
    v_rank := trim(v_player->>'rank');
    v_key := lower(v_discord);

    select id into v_player_id
    from public.players
    where display_name_key = v_key;

    if not found then
      insert into public.players (display_name, discord_username)
      values (v_discord, v_discord)
      returning id into v_player_id;
    end if;

    perform public.dgl_ensure_player_points_summary(v_player_id);

    insert into public.player_game_profiles (player_id, game_id, rank_tier)
    values (v_player_id, v_tournament.game_id, v_rank)
    on conflict (player_id, game_id) do update
      set rank_tier = excluded.rank_tier,
          updated_at = timezone('utc', now());

    insert into public.tournament_registrations (
      tournament_id,
      player_id,
      status,
      confirmed_at,
      team_name,
      form_data,
      metadata
    ) values (
      p_tournament_id,
      v_player_id,
      v_target_status,
      case
        when v_target_status = 'confirmed' then timezone('utc', now())
        else null
      end,
      trim(p_team_name),
      jsonb_build_object(
        'discord_username', v_discord,
        'rank', v_rank,
        'registration_type', 'team',
        'registration_group_id', v_group_id::text,
        'is_captain', coalesce((v_player->>'is_captain')::boolean, false)
      ),
      jsonb_build_object('skip_status_assignment', true)
    )
    returning id into v_reg_id;

    v_registration_ids := array_append(v_registration_ids, v_reg_id);

    insert into public.tournament_team_members (team_id, player_id, role)
    values (
      v_team_id,
      v_player_id,
      case
        when coalesce((v_player->>'is_captain')::boolean, false)
          then 'captain'::public.dgl_team_member_role
        else 'member'::public.dgl_team_member_role
      end
    );
  end loop;

  if v_target_status = 'confirmed' then
    select count(*) into v_confirmed
    from public.tournament_registrations
    where tournament_id = p_tournament_id
      and status in ('pending', 'confirmed');

    if v_tournament.registration_limit is not null
       and v_confirmed >= v_tournament.registration_limit
       and v_tournament.status = 'registration_open' then
      update public.tournaments
      set status = 'registration_closed',
          updated_at = timezone('utc', now())
      where id = p_tournament_id;
    end if;
  end if;

  return jsonb_build_object(
    'team_id', v_team_id,
    'team_name', trim(p_team_name),
    'registration_group_id', v_group_id,
    'registration_ids', to_jsonb(v_registration_ids),
    'status', v_target_status,
    'is_reserve', false,
    'player_count', 5
  );
end;
$$;
grant execute on function public.dgl_register_team_slot(uuid, text, jsonb, jsonb)
  to anon, authenticated;

grant execute on function public.dgl_register_valorant_team(uuid, text, jsonb)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Fix #3 — knockout SECURITY DEFINER helpers
-- Called only from dgl_record_fixture_result (already is_dgl_admin()).
-- Nested DEFINER calls keep working as the function owner. PUBLIC/anon/
-- authenticated must not execute these directly.
-- ---------------------------------------------------------------------------

create or replace function public.dgl_fill_knockout_from_groups(p_tournament_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer;
  v_map jsonb := '{}'::jsonb;
  v_g record;
  v_s record;
  v_key text;
  v_fix record;
  v_p1 uuid;
  v_p2 uuid;
begin
  if not public.is_dgl_admin() then
    raise exception 'Only DGL admins can fill knockout brackets';
  end if;

  select count(*) into v_remaining
  from public.tournament_fixtures
  where tournament_id = p_tournament_id
    and stage = 'group'
    and status <> 'completed';

  if v_remaining > 0 then
    return;
  end if;

  for v_g in
    select id, label from public.tournament_groups where tournament_id = p_tournament_id
  loop
    for v_s in
      select * from public.dgl_group_standings(v_g.id) where rank <= 2
    loop
      v_key := v_g.label || v_s.rank::text;
      v_map := v_map || jsonb_build_object(v_key, v_s.player_id);
    end loop;
  end loop;

  for v_fix in
    select *
    from public.tournament_fixtures
    where tournament_id = p_tournament_id
      and stage = 'quarterfinal'
  loop
    v_p1 := nullif(v_map ->> v_fix.player1_placeholder, '')::uuid;
    v_p2 := nullif(v_map ->> v_fix.player2_placeholder, '')::uuid;
    update public.tournament_fixtures
    set
      player1_id = coalesce(v_p1, player1_id),
      player2_id = coalesce(v_p2, player2_id)
    where id = v_fix.id;
  end loop;
end;
$$;

create or replace function public.dgl_advance_knockout_winner(p_fixture_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fix public.tournament_fixtures%rowtype;
  v_token text;
  v_n integer;
begin
  if not public.is_dgl_admin() then
    raise exception 'Only DGL admins can advance knockout winners';
  end if;

  select * into v_fix from public.tournament_fixtures where id = p_fixture_id;
  if not found or v_fix.winner_id is null then
    return;
  end if;

  if v_fix.stage = 'quarterfinal' then
    v_n := v_fix.fixture_order + 1;
    v_token := 'Winner QF' || v_n::text;
  elsif v_fix.stage = 'semifinal' then
    v_n := v_fix.fixture_order + 1;
    v_token := 'Winner SF' || v_n::text;
  else
    return;
  end if;

  update public.tournament_fixtures f
  set player1_id = v_fix.winner_id
  where f.tournament_id = v_fix.tournament_id
    and f.player1_placeholder = v_token
    and f.player1_id is null;

  update public.tournament_fixtures f
  set player2_id = v_fix.winner_id
  where f.tournament_id = v_fix.tournament_id
    and f.player2_placeholder = v_token
    and f.player2_id is null;
end;
$$;

create or replace function public.dgl_publish_standings_from_final(p_tournament_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_final public.tournament_fixtures%rowtype;
  v_champion uuid;
  v_runner uuid;
  v_sf record;
  v_qf record;
  v_member record;
  v_refresh uuid;
  v_has_group boolean;
  v_has_qf boolean;
  v_has_sf boolean;
  v_refresh_ids uuid[] := '{}';
begin
  if not public.is_dgl_admin() then
    raise exception 'Only DGL admins can publish standings from the final';
  end if;

  select * into v_final
  from public.tournament_fixtures
  where tournament_id = p_tournament_id
    and stage = 'final'
  order by fixture_order
  limit 1;

  if not found or v_final.status <> 'completed' or v_final.winner_id is null then
    return;
  end if;

  v_has_group := exists (
    select 1 from public.tournament_groups g where g.tournament_id = p_tournament_id
  );
  v_has_qf := exists (
    select 1 from public.tournament_fixtures f
    where f.tournament_id = p_tournament_id and f.stage = 'quarterfinal'
  );
  v_has_sf := exists (
    select 1 from public.tournament_fixtures f
    where f.tournament_id = p_tournament_id and f.stage = 'semifinal'
  );

  v_champion := v_final.winner_id;
  v_runner := case
    when v_final.player1_id = v_champion then v_final.player2_id
    else v_final.player1_id
  end;

  select coalesce(array_agg(distinct player_id), '{}')
    into v_refresh_ids
  from (
    select player_id from public.player_points_ledger where tournament_id = p_tournament_id
    union
    select player_id from public.tournament_placements where tournament_id = p_tournament_id
  ) prior_players
  where player_id is not null;

  delete from public.player_points_ledger
  where tournament_id = p_tournament_id;

  delete from public.tournament_placements
  where tournament_id = p_tournament_id;

  if v_champion is not null then
    insert into public.tournament_placements (
      tournament_id, entity_type, player_id, placement, points_awarded
    ) values (
      p_tournament_id, 'player', v_champion, 1,
      public.dgl_calculate_points(v_has_group, v_has_qf, v_has_sf, true, true)
    );
    v_refresh_ids := array_append(v_refresh_ids, v_champion);
  end if;

  if v_runner is not null then
    insert into public.tournament_placements (
      tournament_id, entity_type, player_id, placement, points_awarded
    ) values (
      p_tournament_id, 'player', v_runner, 2,
      public.dgl_calculate_points(v_has_group, v_has_qf, v_has_sf, true, false)
    );
    v_refresh_ids := array_append(v_refresh_ids, v_runner);
  end if;

  for v_sf in
    select *
    from public.tournament_fixtures
    where tournament_id = p_tournament_id
      and stage = 'semifinal'
      and status = 'completed'
      and winner_id is not null
  loop
    if v_sf.player1_id is not null and v_sf.player1_id <> v_sf.winner_id then
      insert into public.tournament_placements (
        tournament_id, entity_type, player_id, placement, points_awarded
      ) values (
        p_tournament_id, 'player', v_sf.player1_id, 4,
        public.dgl_calculate_points(v_has_group, v_has_qf, true, false, false)
      );
      v_refresh_ids := array_append(v_refresh_ids, v_sf.player1_id);
    end if;
    if v_sf.player2_id is not null and v_sf.player2_id <> v_sf.winner_id then
      insert into public.tournament_placements (
        tournament_id, entity_type, player_id, placement, points_awarded
      ) values (
        p_tournament_id, 'player', v_sf.player2_id, 4,
        public.dgl_calculate_points(v_has_group, v_has_qf, true, false, false)
      );
      v_refresh_ids := array_append(v_refresh_ids, v_sf.player2_id);
    end if;
  end loop;

  for v_qf in
    select *
    from public.tournament_fixtures
    where tournament_id = p_tournament_id
      and stage = 'quarterfinal'
      and status = 'completed'
      and winner_id is not null
  loop
    if v_qf.player1_id is not null and v_qf.player1_id <> v_qf.winner_id then
      insert into public.tournament_placements (
        tournament_id, entity_type, player_id, placement, points_awarded
      ) values (
        p_tournament_id, 'player', v_qf.player1_id, 5,
        public.dgl_calculate_points(v_has_group, true, false, false, false)
      );
      v_refresh_ids := array_append(v_refresh_ids, v_qf.player1_id);
    end if;
    if v_qf.player2_id is not null and v_qf.player2_id <> v_qf.winner_id then
      insert into public.tournament_placements (
        tournament_id, entity_type, player_id, placement, points_awarded
      ) values (
        p_tournament_id, 'player', v_qf.player2_id, 5,
        public.dgl_calculate_points(v_has_group, true, false, false, false)
      );
      v_refresh_ids := array_append(v_refresh_ids, v_qf.player2_id);
    end if;
  end loop;

  for v_member in
    select distinct m.player_id
    from public.tournament_group_members m
    join public.tournament_groups g on g.id = m.group_id
    where g.tournament_id = p_tournament_id
      and not exists (
        select 1 from public.tournament_placements tp
        where tp.tournament_id = p_tournament_id
          and tp.player_id = m.player_id
      )
  loop
    insert into public.tournament_placements (
      tournament_id, entity_type, player_id, placement, points_awarded
    ) values (
      p_tournament_id, 'player', v_member.player_id, 6,
      public.dgl_calculate_points(true, false, false, false, false)
    );
    v_refresh_ids := array_append(v_refresh_ids, v_member.player_id);
  end loop;

  update public.tournaments
  set
    status = 'completed',
    completed_at = coalesce(completed_at, timezone('utc', now())),
    updated_at = timezone('utc', now())
  where id = p_tournament_id
    and status <> 'completed';

  for v_refresh in
    select distinct x from unnest(v_refresh_ids) as x where x is not null
  loop
    perform public.dgl_refresh_player_points_summary(v_refresh);
  end loop;
end;
$$;
revoke all on function public.dgl_fill_knockout_from_groups(uuid)
  from public, anon, authenticated;
revoke all on function public.dgl_advance_knockout_winner(uuid)
  from public, anon, authenticated;
revoke all on function public.dgl_publish_standings_from_final(uuid)
  from public, anon, authenticated;

grant execute on function public.dgl_fill_knockout_from_groups(uuid) to service_role;
grant execute on function public.dgl_advance_knockout_winner(uuid) to service_role;
grant execute on function public.dgl_publish_standings_from_final(uuid) to service_role;

commit;
