-- DGL CS2 Saturday Showdown (Main Event) + Marvel Rivals Signature Tournament.
--
-- Reuses tournaments, tournament_series, tournament_teams, tournament_team_members,
-- and tournament_registrations. No new tables.
--
-- CS2: free Saturday Showdown — no cash prize. DGL Points awarded at completion
-- via existing public.dgl_calculate_points() / dgl_points_rules (same as
-- Valorant Saturday Showdown #1 and Marvel Rivals Saturday Showdown #2).
-- Marvel: Signature prized event — ₹2,000 TOTAL team prize (not per player).
-- Valorant Championship #2: completed, not featured. Results/registrations untouched.
--
-- Team-slot registration: captains claim pre-created "Team N" shells.
-- Substitutes are confirmed roster members (role = substitute) and are NOT
-- counted toward registration_limit / capacity-close. Do not set
-- tournament_registrations.team_id (unique on tournament_id + team_id).

begin;

-- ---------------------------------------------------------------------------
-- 1. Capacity helpers: substitutes must not fill main slots or close signup
-- ---------------------------------------------------------------------------

create or replace function public.dgl_close_registration_at_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_status public.dgl_tournament_status;
  v_count integer;
begin
  select registration_limit, status
    into v_limit, v_status
  from public.tournaments
  where id = new.tournament_id
  for update;

  if v_limit is null or v_status <> 'registration_open' then
    return new;
  end if;

  -- Main roster only. Reserves (waitlist) and substitutes must not close signup.
  select count(*) into v_count
  from public.tournament_registrations
  where tournament_id = new.tournament_id
    and status in ('pending', 'confirmed')
    and coalesce(form_data->>'roster_role', '') is distinct from 'substitute';

  if v_count >= v_limit then
    update public.tournaments
    set status = 'registration_closed', updated_at = timezone('utc', now())
    where id = new.tournament_id;
  end if;

  return new;
end;
$$;

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
begin
  if coalesce(new.metadata->>'skip_status_assignment', '') = 'true' then
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

-- ---------------------------------------------------------------------------
-- 2. Generic team-slot RPC (CS2 / Marvel Signature — not Valorant #2)
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

grant execute on function public.dgl_register_team_slot(uuid, text, jsonb, jsonb)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Series
-- ---------------------------------------------------------------------------

update public.games
set status = 'available',
    featured = true,
    updated_at = timezone('utc', now())
where slug in ('cs2', 'marvel-rivals')
  and (status is distinct from 'available' or featured is distinct from true);

insert into public.tournament_series (
  slug, name, game_id, cadence, participation_mode,
  default_format, default_match_type, event_type
)
select
  'cs2-saturday-showdown',
  'DGL CS2 Saturday Showdown',
  g.id,
  'weekly',
  'team',
  '5v5',
  'Knockout',
  'saturday_showdown'
from public.games g
where g.slug = 'cs2'
on conflict (slug) do update
set
  name = excluded.name,
  cadence = excluded.cadence,
  participation_mode = excluded.participation_mode,
  default_format = excluded.default_format,
  default_match_type = excluded.default_match_type,
  event_type = excluded.event_type,
  updated_at = timezone('utc', now());

insert into public.tournament_series (
  slug, name, game_id, cadence, participation_mode,
  default_format, default_match_type, event_type
)
select
  'marvel-rivals-championship',
  'DGL Signature — Marvel Rivals Championship',
  g.id,
  'one_off',
  'team',
  '6v6',
  'Knockout',
  'championship'
from public.games g
where g.slug = 'marvel-rivals'
on conflict (slug) do update
set
  name = excluded.name,
  cadence = excluded.cadence,
  participation_mode = excluded.participation_mode,
  default_format = excluded.default_format,
  default_match_type = excluded.default_match_type,
  event_type = excluded.event_type,
  updated_at = timezone('utc', now());

-- ---------------------------------------------------------------------------
-- 4. CS2 Saturday Showdown — Main Event, FREE, no cash prize
--    Saturday 12 Sep 2026, 4:00 PM IST. 4 teams × 5 main + 2 subs.
-- ---------------------------------------------------------------------------

insert into public.tournaments (
  global_number,
  game_championship_number,
  external_id,
  slug,
  game_id,
  series_id,
  championship_label,
  participation_mode,
  format,
  match_type,
  status,
  accent_color,
  is_featured,
  registration_limit,
  reserve_limit,
  registration_opens_at,
  registration_closes_at,
  starts_at,
  prize_pool_display,
  prize_pool_amount,
  metadata
)
select
  coalesce(
    (select t.global_number from public.tournaments t where t.external_id = 'dgl-cs2-saturday-showdown-1'),
    (select coalesce(max(t.global_number), 0) + 1 from public.tournaments t)
  ),
  1,
  'dgl-cs2-saturday-showdown-1',
  'cs2-saturday-showdown-1',
  g.id,
  ts.id,
  'CS2',
  'team',
  '5v5',
  'Knockout',
  'registration_open',
  g.accent_color,
  false,
  20,
  0,
  timezone('utc', now()),
  timestamptz '2026-09-12 09:30:00+00', -- 3:00 PM IST
  timestamptz '2026-09-12 10:30:00+00', -- 4:00 PM IST
  null,
  0,
  jsonb_build_object(
    'title', 'DGL CS2 Saturday Showdown',
    'entry_fee', 'Free',
    'subtitle', '5v5 · 4 Teams',
    'registration_mode', 'team_slots',
    'team_limit', 4,
    'team_size', 5,
    'team_main_size', 5,
    'team_substitute_size', 2,
    'rewards', 'DGL Points • Hall of Titans Recognition'
  )
from public.games g
join public.tournament_series ts on ts.slug = 'cs2-saturday-showdown'
where g.slug = 'cs2'
on conflict (external_id) do update
set
  series_id = excluded.series_id,
  championship_label = excluded.championship_label,
  participation_mode = excluded.participation_mode,
  format = excluded.format,
  match_type = excluded.match_type,
  status = case
    when public.tournaments.status in ('completed', 'cancelled', 'active')
      then public.tournaments.status
    else excluded.status
  end,
  accent_color = excluded.accent_color,
  is_featured = case
    when public.tournaments.status in ('completed', 'cancelled', 'active')
      then public.tournaments.is_featured
    else excluded.is_featured
  end,
  registration_limit = excluded.registration_limit,
  reserve_limit = excluded.reserve_limit,
  registration_opens_at = coalesce(
    public.tournaments.registration_opens_at,
    excluded.registration_opens_at
  ),
  registration_closes_at = excluded.registration_closes_at,
  starts_at = excluded.starts_at,
  prize_pool_display = excluded.prize_pool_display,
  prize_pool_amount = excluded.prize_pool_amount,
  metadata = coalesce(public.tournaments.metadata, '{}'::jsonb) || excluded.metadata,
  game_championship_number = excluded.game_championship_number,
  updated_at = timezone('utc', now());

insert into public.tournament_teams (tournament_id, name, seed)
select t.id, 'Team ' || s.n, s.n
from public.tournaments t
cross join generate_series(1, 4) as s(n)
where t.external_id = 'dgl-cs2-saturday-showdown-1'
on conflict (tournament_id, name) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Marvel Rivals Signature — upcoming, not featured, ₹2,000 TEAM prize
--    Sunday 4 Oct 2026, 4:00 PM IST. 8 teams × 6 main + 2 subs.
-- ---------------------------------------------------------------------------

insert into public.tournaments (
  global_number,
  game_championship_number,
  external_id,
  slug,
  game_id,
  series_id,
  championship_label,
  participation_mode,
  format,
  match_type,
  status,
  accent_color,
  is_featured,
  registration_limit,
  reserve_limit,
  registration_opens_at,
  registration_closes_at,
  starts_at,
  prize_pool_display,
  prize_pool_amount,
  metadata
)
select
  coalesce(
    (select t.global_number from public.tournaments t where t.external_id = 'dgl-marvel-rivals-signature-1'),
    (select coalesce(max(t.global_number), 0) + 1 from public.tournaments t)
  ),
  1,
  'dgl-marvel-rivals-signature-1',
  'marvel-rivals-signature-1',
  g.id,
  ts.id,
  'Marvel Rivals',
  'team',
  '6v6',
  'Knockout',
  'registration_open',
  g.accent_color,
  false,
  48,
  0,
  timezone('utc', now()),
  timestamptz '2026-10-04 09:30:00+00', -- 3:00 PM IST
  timestamptz '2026-10-04 10:30:00+00', -- 4:00 PM IST
  '₹2,000 Team Prize',
  2000,
  jsonb_build_object(
    'title', 'DGL Marvel Rivals Signature Tournament',
    'entry_fee', 'Free',
    'subtitle', '₹2,000 Team Prize',
    'registration_mode', 'team_slots',
    'team_limit', 8,
    'team_size', 6,
    'team_main_size', 6,
    'team_substitute_size', 2
  )
from public.games g
join public.tournament_series ts on ts.slug = 'marvel-rivals-championship'
where g.slug = 'marvel-rivals'
on conflict (external_id) do update
set
  series_id = excluded.series_id,
  championship_label = excluded.championship_label,
  participation_mode = excluded.participation_mode,
  format = excluded.format,
  match_type = excluded.match_type,
  status = case
    when public.tournaments.status in ('completed', 'cancelled', 'active')
      then public.tournaments.status
    else excluded.status
  end,
  accent_color = excluded.accent_color,
  is_featured = case
    when public.tournaments.status in ('completed', 'cancelled', 'active')
      then public.tournaments.is_featured
    else excluded.is_featured
  end,
  registration_limit = excluded.registration_limit,
  reserve_limit = excluded.reserve_limit,
  registration_opens_at = coalesce(
    public.tournaments.registration_opens_at,
    excluded.registration_opens_at
  ),
  registration_closes_at = excluded.registration_closes_at,
  starts_at = excluded.starts_at,
  prize_pool_display = excluded.prize_pool_display,
  prize_pool_amount = excluded.prize_pool_amount,
  metadata = coalesce(public.tournaments.metadata, '{}'::jsonb) || excluded.metadata,
  game_championship_number = excluded.game_championship_number,
  updated_at = timezone('utc', now());

insert into public.tournament_teams (tournament_id, name, seed)
select t.id, 'Team ' || s.n, s.n
from public.tournaments t
cross join generate_series(1, 8) as s(n)
where t.external_id = 'dgl-marvel-rivals-signature-1'
on conflict (tournament_id, name) do nothing;

-- ---------------------------------------------------------------------------
-- 6. Featured / Main Event: CS2 only. Valorant #2 stays completed, unfeatured.
--    Do not touch Valorant results, fixtures, placements, points, or registrations.
-- ---------------------------------------------------------------------------

update public.tournaments
set is_featured = false,
    updated_at = timezone('utc', now())
where is_featured = true;

update public.tournaments
set is_featured = true,
    updated_at = timezone('utc', now())
where external_id = 'dgl-cs2-saturday-showdown-1'
  and status is distinct from 'completed'
  and status is distinct from 'cancelled'
  and is_featured is distinct from true;

insert into public.community_activity (
  activity_type,
  title,
  summary,
  tournament_id,
  payload,
  occurred_at,
  is_public
)
select
  'registration_opened',
  'Registration open · CS2 Saturday Showdown',
  'Tournament #' || t.global_number || ' is accepting team registrations',
  t.id,
  jsonb_build_object(
    'tournament_id', t.id,
    'global_number', t.global_number,
    'slug', t.slug,
    'external_id', t.external_id,
    'game', 'Counter Strike 2',
    'championship_label', t.championship_label,
    'status', t.status,
    'registration_limit', t.registration_limit,
    'team_limit', 4,
    'prize_pool_display', t.prize_pool_display,
    'start_at', t.starts_at,
    'featured', t.is_featured,
    'series', 'Saturday Showdown',
    'format', t.format
  ),
  timezone('utc', now()),
  true
from public.tournaments t
where t.external_id = 'dgl-cs2-saturday-showdown-1'
  and t.status = 'registration_open'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'registration_opened'
  );

insert into public.community_activity (
  activity_type,
  title,
  summary,
  tournament_id,
  payload,
  occurred_at,
  is_public
)
select
  'registration_opened',
  'Registration open · Marvel Rivals Signature',
  'Tournament #' || t.global_number || ' is accepting team registrations',
  t.id,
  jsonb_build_object(
    'tournament_id', t.id,
    'global_number', t.global_number,
    'slug', t.slug,
    'external_id', t.external_id,
    'game', 'Marvel Rivals',
    'championship_label', t.championship_label,
    'status', t.status,
    'registration_limit', t.registration_limit,
    'team_limit', 8,
    'prize_pool_display', t.prize_pool_display,
    'prize_pool_amount', t.prize_pool_amount,
    'start_at', t.starts_at,
    'featured', t.is_featured,
    'series', 'DGL Signature',
    'format', t.format
  ),
  timezone('utc', now()),
  true
from public.tournaments t
where t.external_id = 'dgl-marvel-rivals-signature-1'
  and t.status = 'registration_open'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'registration_opened'
  );

-- ---------------------------------------------------------------------------
-- 7. Sanity checks (fail the migration if lineup is wrong)
-- ---------------------------------------------------------------------------

do $$
declare
  v_cs2 record;
  v_marvel record;
  v_valorant record;
  v_featured_count integer;
  v_cs2_teams integer;
  v_marvel_teams integer;
  v_cs2_event public.dgl_event_type;
  v_marvel_event public.dgl_event_type;
begin
  select t.*, ts.event_type as series_event_type
    into v_cs2
  from public.tournaments t
  join public.tournament_series ts on ts.id = t.series_id
  where t.external_id = 'dgl-cs2-saturday-showdown-1';

  select t.*, ts.event_type as series_event_type
    into v_marvel
  from public.tournaments t
  join public.tournament_series ts on ts.id = t.series_id
  where t.external_id = 'dgl-marvel-rivals-signature-1';

  select * into v_valorant
  from public.tournaments
  where external_id = 'dgl-valorant-championship-2';

  if v_cs2.id is null or v_marvel.id is null then
    raise exception 'CS2 or Marvel tournament row missing';
  end if;

  v_cs2_event := v_cs2.series_event_type;
  v_marvel_event := v_marvel.series_event_type;

  if v_cs2.status is distinct from 'registration_open' then
    raise exception 'CS2 must be registration_open, found %', v_cs2.status;
  end if;

  if v_cs2.is_featured is not true then
    raise exception 'CS2 must be the featured Main Event';
  end if;

  if v_cs2.format is distinct from '5v5'
     or v_cs2.registration_limit is distinct from 20
     or v_cs2.reserve_limit is distinct from 0
     or coalesce(v_cs2.prize_pool_amount, 0) <> 0
     or v_cs2.prize_pool_display is not null
     or v_cs2_event is distinct from 'saturday_showdown'
  then
    raise exception 'CS2 configuration mismatch';
  end if;

  if coalesce(v_cs2.metadata->>'registration_mode', '') <> 'team_slots'
     or coalesce((v_cs2.metadata->>'team_limit')::int, 0) <> 4
     or coalesce((v_cs2.metadata->>'team_main_size')::int, 0) <> 5
     or coalesce((v_cs2.metadata->>'team_substitute_size')::int, 0) <> 2 then
    raise exception 'CS2 team-slot metadata mismatch';
  end if;

  if v_marvel.is_featured is not false then
    raise exception 'Marvel Signature must not be featured';
  end if;

  if v_marvel.status is distinct from 'registration_open'
     or v_marvel.format is distinct from '6v6'
     or v_marvel.registration_limit is distinct from 48
     or v_marvel.reserve_limit is distinct from 0
     or coalesce(v_marvel.prize_pool_amount, 0) <> 2000
     or v_marvel.prize_pool_display is distinct from '₹2,000 Team Prize'
     or v_marvel_event is distinct from 'championship' then
    raise exception 'Marvel configuration mismatch';
  end if;

  if coalesce(v_marvel.metadata->>'registration_mode', '') <> 'team_slots'
     or coalesce((v_marvel.metadata->>'team_limit')::int, 0) <> 8
     or coalesce((v_marvel.metadata->>'team_main_size')::int, 0) <> 6
     or coalesce((v_marvel.metadata->>'team_substitute_size')::int, 0) <> 2 then
    raise exception 'Marvel team-slot metadata mismatch';
  end if;

  if v_valorant.id is not null then
    if v_valorant.status is distinct from 'completed' then
      raise exception 'Valorant Championship #2 must remain completed';
    end if;
    if v_valorant.is_featured is not false then
      raise exception 'Valorant Championship #2 must not be featured';
    end if;
  end if;

  select count(*) into v_featured_count
  from public.tournaments
  where is_featured = true;

  if v_featured_count <> 1 then
    raise exception 'Expected exactly 1 featured tournament, found %', v_featured_count;
  end if;

  select count(*) into v_cs2_teams
  from public.tournament_teams
  where tournament_id = v_cs2.id;

  select count(*) into v_marvel_teams
  from public.tournament_teams
  where tournament_id = v_marvel.id;

  if v_cs2_teams <> 4 then
    raise exception 'CS2 must have 4 team slots, found %', v_cs2_teams;
  end if;

  if v_marvel_teams <> 8 then
    raise exception 'Marvel must have 8 team slots, found %', v_marvel_teams;
  end if;
end $$;

commit;
