-- Phase 3A: Reserve Player System
-- Reuses tournament_registrations.waitlist as product "Reserve".
-- Adds reserve_limit, checked_in status, capacity/trigger/RLS fixes, admin RPCs.

begin;

-- ---------------------------------------------------------------------------
-- 1. Tournament reserve capacity (default 4)
-- ---------------------------------------------------------------------------

alter table public.tournaments
  add column if not exists reserve_limit integer;

update public.tournaments
set reserve_limit = 4
where reserve_limit is null;

alter table public.tournaments
  alter column reserve_limit set default 4;

alter table public.tournaments
  drop constraint if exists tournaments_reserve_limit_positive;

alter table public.tournaments
  add constraint tournaments_reserve_limit_positive
  check (reserve_limit is null or reserve_limit >= 0);

comment on column public.tournaments.reserve_limit is
  'Max reserve (waitlist) seats. Default 4. Null = no reserve seats.';

-- ---------------------------------------------------------------------------
-- 2. Extend registration status with checked_in (future); Reserve = waitlist
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'dgl_registration_status' and e.enumlabel = 'checked_in'
  ) then
    alter type public.dgl_registration_status add value 'checked_in';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Capacity close: main roster only (confirmed + pending), never reserves
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

  -- Main roster only — reserve/waitlist must not close registrations.
  select count(*) into v_count
  from public.tournament_registrations
  where tournament_id = new.tournament_id
    and status in ('pending', 'confirmed');

  if v_count >= v_limit then
    update public.tournaments
    set status = 'registration_closed', updated_at = timezone('utc', now())
    where id = new.tournament_id;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. BEFORE INSERT: assign confirmed vs waitlist (reserve) automatically
-- ---------------------------------------------------------------------------

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
  v_confirmed integer;
  v_reserve integer;
begin
  -- Admins may insert withdrawn / checked_in / explicit statuses except
  -- when the client asks for confirmed (default) — then we decide.
  if new.status is distinct from 'confirmed' and new.status is distinct from 'pending' then
    return new;
  end if;

  select registration_limit, coalesce(reserve_limit, 0), status
    into v_limit, v_reserve_limit, v_status
  from public.tournaments
  where id = new.tournament_id
  for update;

  if not found then
    raise exception 'Tournament not found';
  end if;

  if v_status in ('completed', 'cancelled', 'active', 'draft') then
    raise exception 'Registration is closed for this tournament (status %)', v_status;
  end if;

  -- coming_soon / registration_open / registration_closed may accept players
  -- (reserves allowed while registration_closed until live).
  if v_status = 'coming_soon' then
    raise exception 'Registration has not opened yet';
  end if;

  select count(*) into v_confirmed
  from public.tournament_registrations
  where tournament_id = new.tournament_id
    and status in ('pending', 'confirmed');

  if v_limit is null or v_confirmed < v_limit then
    new.status := 'confirmed';
    new.confirmed_at := coalesce(new.confirmed_at, timezone('utc', now()));
    return new;
  end if;

  -- Main full → try reserve (waitlist)
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

drop trigger if exists tournament_registrations_assign_status on public.tournament_registrations;
create trigger tournament_registrations_assign_status
  before insert on public.tournament_registrations
  for each row execute function public.dgl_assign_registration_status();

-- ---------------------------------------------------------------------------
-- 5. RLS — allow anon to insert waitlist (status still assigned by trigger)
-- ---------------------------------------------------------------------------

drop policy if exists "tournament_registrations_anon_insert" on public.tournament_registrations;
create policy "tournament_registrations_anon_insert"
  on public.tournament_registrations for insert
  to anon, authenticated
  with check (
    status in ('pending', 'confirmed', 'waitlist')
    and player_id is not null
    and team_id is null
  );

-- ---------------------------------------------------------------------------
-- 6. Admin RPCs — promote / withdraw / reorder reserves
-- ---------------------------------------------------------------------------

create or replace function public.dgl_promote_reserve_registration(p_registration_id uuid)
returns public.tournament_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.tournament_registrations;
  v_limit integer;
  v_confirmed integer;
  v_tstatus public.dgl_tournament_status;
begin
  if not public.is_dgl_admin() then
    raise exception 'Only DGL admins can promote reserve players';
  end if;

  select * into v_row
  from public.tournament_registrations
  where id = p_registration_id
  for update;

  if not found then
    raise exception 'Registration not found';
  end if;

  if v_row.status <> 'waitlist' then
    raise exception 'Only reserve (waitlist) registrations can be promoted';
  end if;

  select registration_limit, status
    into v_limit, v_tstatus
  from public.tournaments
  where id = v_row.tournament_id
  for update;

  if v_tstatus in ('completed', 'cancelled') then
    raise exception 'Cannot promote into a finished tournament';
  end if;

  select count(*) into v_confirmed
  from public.tournament_registrations
  where tournament_id = v_row.tournament_id
    and status in ('pending', 'confirmed');

  if v_limit is not null and v_confirmed >= v_limit then
    raise exception 'Main roster is full — withdraw a confirmed player first';
  end if;

  update public.tournament_registrations
  set
    status = 'confirmed',
    confirmed_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  where id = p_registration_id
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.dgl_promote_reserve_registration(uuid) from public;
grant execute on function public.dgl_promote_reserve_registration(uuid) to authenticated;

create or replace function public.dgl_withdraw_registration(p_registration_id uuid)
returns public.tournament_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.tournament_registrations;
begin
  if not public.is_dgl_admin() then
    raise exception 'Only DGL admins can withdraw registrations';
  end if;

  update public.tournament_registrations
  set
    status = 'withdrawn',
    withdrawn_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  where id = p_registration_id
  returning * into v_row;

  if not found then
    raise exception 'Registration not found';
  end if;

  return v_row;
end;
$$;

revoke all on function public.dgl_withdraw_registration(uuid) from public;
grant execute on function public.dgl_withdraw_registration(uuid) to authenticated;

-- Swap registered_at between two adjacent reserve rows (manual reorder).
create or replace function public.dgl_swap_reserve_order(
  p_registration_id uuid,
  p_direction text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.tournament_registrations;
  v_other public.tournament_registrations;
  v_tmp timestamptz;
begin
  if not public.is_dgl_admin() then
    raise exception 'Only DGL admins can reorder reserves';
  end if;

  if p_direction not in ('up', 'down') then
    raise exception 'direction must be up or down';
  end if;

  select * into v_row
  from public.tournament_registrations
  where id = p_registration_id
  for update;

  if not found or v_row.status <> 'waitlist' then
    raise exception 'Reserve registration not found';
  end if;

  if p_direction = 'up' then
    select * into v_other
    from public.tournament_registrations
    where tournament_id = v_row.tournament_id
      and status = 'waitlist'
      and registered_at < v_row.registered_at
    order by registered_at desc
    limit 1
    for update;
  else
    select * into v_other
    from public.tournament_registrations
    where tournament_id = v_row.tournament_id
      and status = 'waitlist'
      and registered_at > v_row.registered_at
    order by registered_at asc
    limit 1
    for update;
  end if;

  if not found then
    return;
  end if;

  v_tmp := v_row.registered_at;
  update public.tournament_registrations
  set registered_at = v_other.registered_at, updated_at = timezone('utc', now())
  where id = v_row.id;
  update public.tournament_registrations
  set registered_at = v_tmp, updated_at = timezone('utc', now())
  where id = v_other.id;
end;
$$;

revoke all on function public.dgl_swap_reserve_order(uuid, text) from public;
grant execute on function public.dgl_swap_reserve_order(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Enriched view — append confirmed/reserve counts + reserve_limit
--    (append-only to avoid SQLSTATE 42P16 column rename errors)
-- ---------------------------------------------------------------------------

create or replace view public.v_tournaments_enriched
with (security_invoker = true) as
select
  t.id,
  t.global_number,
  t.game_championship_number,
  t.external_id,
  t.slug,
  t.championship_label,
  format('Tournament #%s', t.global_number) as tournament_number,
  case ts.event_type
    when 'saturday_showdown' then
      format('DGL %s Saturday Showdown #%s', t.championship_label, t.game_championship_number)
    else
      format('DGL %s Championship #%s', t.championship_label, t.game_championship_number)
  end as championship_name,
  g.slug as game_slug,
  g.name as game_name,
  g.accent_color as game_accent,
  t.participation_mode,
  t.format,
  t.match_type,
  t.status,
  t.prize_pool_display,
  t.prize_pool_amount,
  t.prize_pool_currency,
  t.accent_color,
  t.registration_limit,
  t.registration_opens_at,
  t.registration_closes_at,
  t.starts_at,
  t.completed_at,
  t.completed_date_label,
  t.is_featured,
  t.series_id,
  t.metadata,
  t.created_at,
  t.updated_at,
  -- Main roster headcount (confirmed only) for UI "Players X / Y"
  coalesce(rc.confirmed_count, 0) as registered_count,
  coalesce(ts.event_type, 'championship'::public.dgl_event_type) as event_type,
  coalesce(rc.confirmed_count, 0) as confirmed_count,
  coalesce(rc.waitlist_count, 0) as waitlist_count,
  coalesce(t.reserve_limit, 4) as reserve_limit
from public.tournaments t
join public.games g on g.id = t.game_id
left join public.tournament_series ts on ts.id = t.series_id
left join public.v_tournament_registration_counts rc
  on rc.tournament_id = t.id;

grant select on public.v_tournaments_enriched to anon, authenticated;

commit;
