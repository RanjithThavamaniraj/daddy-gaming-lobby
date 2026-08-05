-- Phase 3A fix: registration_closes_at locks ALL new registrations
-- (confirmed + reserve). Reserves are only available before the deadline.

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
  v_confirmed integer;
  v_reserve integer;
begin
  -- Admins may insert withdrawn / checked_in / explicit statuses except
  -- when the client asks for confirmed (default) — then we decide.
  if new.status is distinct from 'confirmed' and new.status is distinct from 'pending' then
    return new;
  end if;

  select
    registration_limit,
    coalesce(reserve_limit, 0),
    status,
    registration_closes_at
  into v_limit, v_reserve_limit, v_status, v_closes_at
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

  -- Deadline locks confirmed AND reserve registrations.
  if v_closes_at is not null and v_closes_at <= timezone('utc', now()) then
    raise exception 'Registrations Closed';
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

  -- Main full → reserve only while still before deadline (checked above)
  -- and tournament is in an open/closed registration phase.
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
