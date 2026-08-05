-- Phase 1: player slug + automatic tournament lifecycle (date-based close/live).
-- Reuses existing tournaments / players / player_points_summary tables.
-- Capacity-based registration_closed already exists (dgl_close_registration_at_capacity).

begin;

-- ---------------------------------------------------------------------------
-- 1. Stable public player slug (no UUIDs in URLs)
-- ---------------------------------------------------------------------------

alter table public.players
  add column if not exists slug text;

comment on column public.players.slug is
  'URL-safe public identifier for /players/{slug}. Never expose players.id.';

create or replace function public.dgl_slugify_display_name(p_name text)
returns text
language plpgsql
immutable
as $$
declare
  v_slug text;
begin
  v_slug := lower(btrim(coalesce(p_name, '')));
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g');
  if v_slug is null or v_slug = '' then
    v_slug := 'player';
  end if;
  return left(v_slug, 60);
end;
$$;

create or replace function public.dgl_assign_player_slug()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base text;
  v_slug text;
  v_n integer := 0;
begin
  if new.slug is not null and btrim(new.slug) <> '' then
    new.slug := public.dgl_slugify_display_name(new.slug);
    return new;
  end if;

  v_base := public.dgl_slugify_display_name(new.display_name);
  v_slug := v_base;

  while exists (
    select 1 from public.players p
    where p.slug = v_slug
      and p.id is distinct from new.id
  ) loop
    v_n := v_n + 1;
    v_slug := left(v_base, 50) || '-' || v_n::text;
  end loop;

  new.slug := v_slug;
  return new;
end;
$$;

drop trigger if exists players_assign_slug on public.players;
create trigger players_assign_slug
  before insert or update of display_name, slug
  on public.players
  for each row execute function public.dgl_assign_player_slug();

-- Backfill existing players
update public.players p
set slug = sub.slug
from (
  select
    id,
    case
      when row_number() over (
        partition by public.dgl_slugify_display_name(display_name)
        order by created_at, id
      ) = 1 then public.dgl_slugify_display_name(display_name)
      else public.dgl_slugify_display_name(display_name)
        || '-'
        || row_number() over (
          partition by public.dgl_slugify_display_name(display_name)
          order by created_at, id
        )::text
    end as slug
  from public.players
  where slug is null or btrim(slug) = ''
) sub
where p.id = sub.id;

alter table public.players
  alter column slug set not null;

create unique index if not exists players_slug_unique
  on public.players (slug);

-- ---------------------------------------------------------------------------
-- 2. Ensure zeroed points summary on first registration (do NOT bump played)
-- ---------------------------------------------------------------------------

create or replace function public.dgl_ensure_player_points_summary(p_player_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_points_summary (player_id, total_points, tournaments_played)
  values (p_player_id, 0, 0)
  on conflict (player_id) do nothing;
end;
$$;

grant execute on function public.dgl_ensure_player_points_summary(uuid)
  to anon, authenticated;

create or replace function public.dgl_ensure_player_profile_on_register()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.dgl_ensure_player_points_summary(new.player_id);
  return new;
end;
$$;

drop trigger if exists tournament_registrations_ensure_player_profile
  on public.tournament_registrations;
create trigger tournament_registrations_ensure_player_profile
  after insert on public.tournament_registrations
  for each row execute function public.dgl_ensure_player_profile_on_register();

-- ---------------------------------------------------------------------------
-- 3. Automatic lifecycle: date-based close + live (capacity close already exists)
-- ---------------------------------------------------------------------------

create or replace function public.dgl_sync_tournament_lifecycle(p_tournament_id uuid default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer := 0;
begin
  -- Registration Closed: closes_at passed while still open (and not live/completed)
  with closed as (
    update public.tournaments t
    set status = 'registration_closed',
        updated_at = timezone('utc', now())
    where (p_tournament_id is null or t.id = p_tournament_id)
      and t.status = 'registration_open'
      and t.registration_closes_at is not null
      and t.registration_closes_at <= timezone('utc', now())
    returning 1
  )
  select count(*) into v_updated from closed;

  -- Live: starts_at passed while registration open/closed
  with live as (
    update public.tournaments t
    set status = 'active',
        updated_at = timezone('utc', now())
    where (p_tournament_id is null or t.id = p_tournament_id)
      and t.status in ('registration_open', 'registration_closed')
      and t.starts_at is not null
      and t.starts_at <= timezone('utc', now())
    returning 1
  )
  select v_updated + count(*) into v_updated from live;

  return v_updated;
end;
$$;

grant execute on function public.dgl_sync_tournament_lifecycle(uuid)
  to anon, authenticated;

-- Expose slug on the public leaderboard view (preserve game columns)
create or replace view public.v_player_leaderboard
with (security_invoker = true) as
select
  row_number() over (
    order by s.total_points desc, s.championships desc, p.display_name asc
  )::integer as rank,
  p.id as player_id,
  p.slug,
  p.display_name,
  s.total_points as points,
  s.championships,
  s.runner_up_finishes,
  s.third_place_finishes,
  s.tournaments_played,
  s.last_awarded_at,
  lg.game_name,
  lg.game_slug,
  lg.game_accent
from public.player_points_summary s
join public.players p on p.id = s.player_id
left join lateral (
  select
    g.name as game_name,
    g.slug as game_slug,
    g.accent_color as game_accent
  from public.player_points_ledger l
  join public.tournaments t on t.id = l.tournament_id
  join public.games g on g.id = t.game_id
  where l.player_id = p.id
    and l.points_delta > 0
  order by l.awarded_at desc
  limit 1
) lg on true
where s.total_points > 0 or s.tournaments_played > 0;

grant select on public.v_player_leaderboard to anon, authenticated;

commit;
