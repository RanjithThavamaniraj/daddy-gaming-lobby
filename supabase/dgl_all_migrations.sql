-- DGL combined migrations — apply in order via Supabase SQL Editor
-- Generated: 2026-07-16

-- >>> 20260628100000_dgl_extensions_and_enums.sql
-- DGL schema extension — migration 1 of 8
-- Extends the existing Supabase project. Does NOT drop or replace legacy tables.
--
-- Known legacy table (created outside this repo, Valorant registration flow):
--   public.registrations (
--     id, discord_name, valorant_ign, rank, created_at
--   )
--   Unique constraint on discord_name was used by the original app (Postgres 23505).
-- This migration leaves public.registrations untouched.

begin;

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.dgl_game_status as enum (
    'available',
    'coming_soon',
    'planned',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_participation_mode as enum (
    'solo',
    'team'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_tournament_status as enum (
    'draft',
    'coming_soon',
    'registration_open',
    'active',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_registration_status as enum (
    'pending',
    'confirmed',
    'waitlist',
    'withdrawn',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_team_member_role as enum (
    'captain',
    'member',
    'substitute',
    'coach'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_placement_entity_type as enum (
    'player',
    'team'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_points_reason as enum (
    'champion',
    'runner_up',
    'third_place',
    'bonus',
    'adjustment',
    'revoked'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_activity_type as enum (
    'platform_update',
    'tournament_announced',
    'registration_opened',
    'registration_closed',
    'tournament_started',
    'tournament_completed',
    'champion_crowned',
    'points_awarded',
    'player_registered'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_recurrence_cadence as enum (
    'one_off',
    'weekly',
    'monthly',
    'seasonal',
    'custom'
  );
exception
  when duplicate_object then null;
end $$;

-- Shared updated_at trigger helper
create or replace function public.dgl_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

comment on function public.dgl_set_updated_at() is
  'Maintains updated_at on DGL tables.';

commit;

-- >>> 20260628100001_dgl_games_and_players.sql
-- DGL schema extension — migration 2 of 8
-- Games catalog and player identity.

begin;

-- ---------------------------------------------------------------------------
-- Games
-- ---------------------------------------------------------------------------

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  category text,
  accent_color text not null default '#ffffff',
  glow_color text,
  team_size smallint not null default 1 check (team_size >= 1),
  max_roster_size smallint check (max_roster_size is null or max_roster_size >= team_size),
  default_participation_mode public.dgl_participation_mode not null default 'team',
  sort_order integer not null default 0,
  featured boolean not null default false,
  status public.dgl_game_status not null default 'planned',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint games_slug_unique unique (slug),
  constraint games_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists games_status_sort_idx
  on public.games (status, sort_order);

create index if not exists games_featured_idx
  on public.games (featured)
  where featured = true;

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.dgl_set_updated_at();

comment on table public.games is
  'Supported DGL titles. team_size drives future roster rules (e.g. CS2 5, FC26 11).';

-- ---------------------------------------------------------------------------
-- Players
-- ---------------------------------------------------------------------------

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  display_name_key text generated always as (lower(btrim(display_name))) stored,
  discord_username citext,
  avatar_url text,
  is_verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint players_display_name_key_unique unique (display_name_key)
);

create index if not exists players_discord_username_idx
  on public.players (discord_username)
  where discord_username is not null;

drop trigger if exists players_set_updated_at on public.players;
create trigger players_set_updated_at
  before update on public.players
  for each row execute function public.dgl_set_updated_at();

comment on table public.players is
  'Canonical DGL player identity. Display names are case-insensitive unique.';

-- Per-game profiles (IGN, rank, platform ids)
create table if not exists public.player_game_profiles (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  in_game_name text,
  rank_tier text,
  platform text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint player_game_profiles_player_game_unique unique (player_id, game_id)
);

create index if not exists player_game_profiles_game_ign_idx
  on public.player_game_profiles (game_id, in_game_name);

drop trigger if exists player_game_profiles_set_updated_at on public.player_game_profiles;
create trigger player_game_profiles_set_updated_at
  before update on public.player_game_profiles
  for each row execute function public.dgl_set_updated_at();

commit;

-- >>> 20260628100002_dgl_tournaments_and_series.sql
-- DGL schema extension — migration 3 of 8
-- Tournaments, recurring series, and team shells.

begin;

-- ---------------------------------------------------------------------------
-- Recurring tournament series (Valorant Championship, FC26 League, etc.)
-- ---------------------------------------------------------------------------

create table if not exists public.tournament_series (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  game_id uuid not null references public.games (id) on delete restrict,
  cadence public.dgl_recurrence_cadence not null default 'one_off',
  participation_mode public.dgl_participation_mode not null default 'team',
  default_format text,
  default_match_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tournament_series_slug_unique unique (slug)
);

create index if not exists tournament_series_game_idx
  on public.tournament_series (game_id);

drop trigger if exists tournament_series_set_updated_at on public.tournament_series;
create trigger tournament_series_set_updated_at
  before update on public.tournament_series
  for each row execute function public.dgl_set_updated_at();

-- ---------------------------------------------------------------------------
-- Tournaments
-- ---------------------------------------------------------------------------

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  global_number integer not null,
  game_championship_number integer,
  external_id text not null,
  slug text,
  game_id uuid not null references public.games (id) on delete restrict,
  series_id uuid references public.tournament_series (id) on delete set null,
  championship_label text not null,
  participation_mode public.dgl_participation_mode not null default 'team',
  format text,
  match_type text,
  status public.dgl_tournament_status not null default 'draft',
  prize_pool_display text,
  prize_pool_amount numeric(12, 2),
  prize_pool_currency text default 'INR',
  accent_color text,
  registration_limit integer check (registration_limit is null or registration_limit > 0),
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  starts_at timestamptz,
  completed_at timestamptz,
  completed_date_label text,
  is_featured boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tournaments_global_number_unique unique (global_number),
  constraint tournaments_external_id_unique unique (external_id),
  constraint tournaments_slug_unique unique (slug),
  constraint tournaments_global_number_positive check (global_number > 0),
  constraint tournaments_game_championship_positive check (
    game_championship_number is null or game_championship_number > 0
  )
);

create index if not exists tournaments_game_status_idx
  on public.tournaments (game_id, status);

create index if not exists tournaments_status_global_number_idx
  on public.tournaments (status, global_number desc);

create index if not exists tournaments_featured_idx
  on public.tournaments (is_featured)
  where is_featured = true;

create index if not exists tournaments_series_idx
  on public.tournaments (series_id);

drop trigger if exists tournaments_set_updated_at on public.tournaments;
create trigger tournaments_set_updated_at
  before update on public.tournaments
  for each row execute function public.dgl_set_updated_at();

comment on column public.tournaments.global_number is
  'Permanent DGL-wide sequence (Tournament #N). Never reassign after publish.';
comment on column public.tournaments.game_championship_number is
  'Per-game championship index (DGL Valorant Championship #N). Set by trigger.';
comment on column public.tournaments.external_id is
  'Stable app identifier, e.g. dgl-valorant-championship-1.';

-- Auto-assign game_championship_number from prior events for the same game.
create or replace function public.dgl_assign_game_championship_number()
returns trigger
language plpgsql
as $$
begin
  if new.game_championship_number is null then
    select coalesce(max(t.game_championship_number), 0) + 1
      into new.game_championship_number
    from public.tournaments t
    where t.game_id = new.game_id
      and t.global_number < new.global_number;
  end if;

  return new;
end;
$$;

drop trigger if exists tournaments_assign_game_championship_number on public.tournaments;
create trigger tournaments_assign_game_championship_number
  before insert on public.tournaments
  for each row execute function public.dgl_assign_game_championship_number();

-- ---------------------------------------------------------------------------
-- Teams (created per tournament for team-based events)
-- ---------------------------------------------------------------------------

create table if not exists public.tournament_teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  name text not null,
  tag text,
  seed integer check (seed is null or seed > 0),
  logo_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tournament_teams_tournament_name_unique unique (tournament_id, name)
);

create index if not exists tournament_teams_tournament_idx
  on public.tournament_teams (tournament_id);

drop trigger if exists tournament_teams_set_updated_at on public.tournament_teams;
create trigger tournament_teams_set_updated_at
  before update on public.tournament_teams
  for each row execute function public.dgl_set_updated_at();

create table if not exists public.tournament_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.tournament_teams (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  role public.dgl_team_member_role not null default 'member',
  jersey_number smallint,
  metadata jsonb not null default '{}'::jsonb,
  joined_at timestamptz not null default timezone('utc', now()),
  constraint tournament_team_members_team_player_unique unique (team_id, player_id)
);

create index if not exists tournament_team_members_player_idx
  on public.tournament_team_members (player_id);

commit;

-- >>> 20260628100003_dgl_registrations.sql
-- DGL schema extension — migration 4 of 8
-- Tournament registrations (multi-game). Legacy public.registrations is NOT altered.

begin;

create table if not exists public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  player_id uuid references public.players (id) on delete set null,
  team_id uuid references public.tournament_teams (id) on delete set null,
  status public.dgl_registration_status not null default 'confirmed',
  registered_at timestamptz not null default timezone('utc', now()),
  confirmed_at timestamptz,
  withdrawn_at timestamptz,
  -- Game-specific form payload (rank, ign, platform, etc.)
  form_data jsonb not null default '{}'::jsonb,
  -- Optional link back to legacy Valorant registration row (no FK — table may predate this schema)
  legacy_registration_id bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tournament_registrations_participant_present check (
    player_id is not null or team_id is not null
  )
);

create unique index if not exists tournament_registrations_tournament_player_unique
  on public.tournament_registrations (tournament_id, player_id)
  where player_id is not null and status in ('pending', 'confirmed', 'waitlist');

create unique index if not exists tournament_registrations_tournament_team_unique
  on public.tournament_registrations (tournament_id, team_id)
  where team_id is not null and status in ('pending', 'confirmed', 'waitlist');

create index if not exists tournament_registrations_tournament_status_idx
  on public.tournament_registrations (tournament_id, status, registered_at desc);

create index if not exists tournament_registrations_player_idx
  on public.tournament_registrations (player_id);

create unique index if not exists tournament_registrations_legacy_unique
  on public.tournament_registrations (tournament_id, legacy_registration_id)
  where legacy_registration_id is not null;

drop trigger if exists tournament_registrations_set_updated_at on public.tournament_registrations;
create trigger tournament_registrations_set_updated_at
  before update on public.tournament_registrations
  for each row execute function public.dgl_set_updated_at();

comment on table public.tournament_registrations is
  'Canonical registration ledger. Replaces game-specific public.registrations for new events.';

-- Convenience view: active headcount per tournament (matches old UI counters)
create or replace view public.v_tournament_registration_counts
with (security_invoker = true) as
select
  tr.tournament_id,
  count(*) filter (
    where tr.status in ('pending', 'confirmed', 'waitlist')
  )::integer as registered_count,
  count(*) filter (where tr.status = 'confirmed')::integer as confirmed_count,
  count(*) filter (where tr.status = 'waitlist')::integer as waitlist_count
from public.tournament_registrations tr
group by tr.tournament_id;

commit;

-- >>> 20260628100004_dgl_results_and_points.sql
-- DGL schema extension — migration 5 of 8
-- Results, placements, DGL Points rules and ledger.

begin;

-- ---------------------------------------------------------------------------
-- Points rules (versioned; app currently uses champion 50 / runner-up 20 / third 10)
-- ---------------------------------------------------------------------------

create table if not exists public.dgl_points_rules (
  id uuid primary key default gen_random_uuid(),
  label text not null default 'default',
  champion_points integer not null default 50 check (champion_points >= 0),
  runner_up_points integer not null default 20 check (runner_up_points >= 0),
  third_place_points integer not null default 10 check (third_place_points >= 0),
  effective_from timestamptz not null default timezone('utc', now()),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists dgl_points_rules_one_active_idx
  on public.dgl_points_rules ((true))
  where is_active = true;

-- ---------------------------------------------------------------------------
-- Tournament results / placements
-- Supports:
--   - Team games: one row per team at a placement (entity_type = team)
--   - Roster listings: one row per player at a placement (entity_type = player)
-- ---------------------------------------------------------------------------

create table if not exists public.tournament_placements (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  placement smallint not null check (placement between 1 and 32),
  entity_type public.dgl_placement_entity_type not null,
  player_id uuid references public.players (id) on delete set null,
  team_id uuid references public.tournament_teams (id) on delete set null,
  points_awarded integer not null default 0 check (points_awarded >= 0),
  prize_share_display text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint tournament_placements_entity_present check (
    (entity_type = 'player' and player_id is not null)
    or (entity_type = 'team' and team_id is not null)
  )
);

create unique index if not exists tournament_placements_player_unique
  on public.tournament_placements (tournament_id, placement, player_id)
  where player_id is not null;

create unique index if not exists tournament_placements_team_unique
  on public.tournament_placements (tournament_id, placement, team_id)
  where team_id is not null;

create index if not exists tournament_placements_tournament_idx
  on public.tournament_placements (tournament_id, placement);

-- Immutable points ledger (source of truth for leaderboard)
create table if not exists public.player_points_ledger (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  tournament_id uuid references public.tournaments (id) on delete set null,
  placement_id uuid references public.tournament_placements (id) on delete set null,
  reason public.dgl_points_reason not null,
  points_delta integer not null,
  description text,
  awarded_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists player_points_ledger_player_idx
  on public.player_points_ledger (player_id, awarded_at desc);

create index if not exists player_points_ledger_tournament_idx
  on public.player_points_ledger (tournament_id);

-- Materialized summary for fast leaderboard queries
create table if not exists public.player_points_summary (
  player_id uuid primary key references public.players (id) on delete cascade,
  total_points integer not null default 0,
  championships integer not null default 0,
  runner_up_finishes integer not null default 0,
  third_place_finishes integer not null default 0,
  tournaments_played integer not null default 0,
  last_awarded_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists player_points_summary_leaderboard_idx
  on public.player_points_summary (total_points desc, championships desc);

-- Recompute a single player's summary from the ledger + placements
create or replace function public.dgl_refresh_player_points_summary(p_player_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_championships integer;
  v_runner_up integer;
  v_third integer;
  v_played integer;
  v_last_awarded timestamptz;
begin
  select
    coalesce(sum(l.points_delta), 0),
    max(l.awarded_at)
  into v_total, v_last_awarded
  from public.player_points_ledger l
  where l.player_id = p_player_id;

  select
    count(*) filter (where tp.placement = 1),
    count(*) filter (where tp.placement = 2),
    count(*) filter (where tp.placement = 3),
    count(distinct tp.tournament_id)
  into v_championships, v_runner_up, v_third, v_played
  from public.tournament_placements tp
  where tp.player_id = p_player_id;

  insert into public.player_points_summary as s (
    player_id,
    total_points,
    championships,
    runner_up_finishes,
    third_place_finishes,
    tournaments_played,
    last_awarded_at,
    updated_at
  )
  values (
    p_player_id,
    v_total,
    v_championships,
    v_runner_up,
    v_third,
    v_played,
    v_last_awarded,
    timezone('utc', now())
  )
  on conflict (player_id) do update
  set
    total_points = excluded.total_points,
    championships = excluded.championships,
    runner_up_finishes = excluded.runner_up_finishes,
    third_place_finishes = excluded.third_place_finishes,
    tournaments_played = excluded.tournaments_played,
    last_awarded_at = excluded.last_awarded_at,
    updated_at = excluded.updated_at;
end;
$$;

-- Award points when a player placement is inserted/updated
create or replace function public.dgl_sync_points_for_player_placement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reason public.dgl_points_reason;
  v_rules public.dgl_points_rules%rowtype;
begin
  if new.entity_type <> 'player' or new.player_id is null then
    return new;
  end if;

  select *
    into v_rules
  from public.dgl_points_rules
  where is_active = true
  order by effective_from desc
  limit 1;

  if not found then
    return new;
  end if;

  v_reason := case new.placement
    when 1 then 'champion'::public.dgl_points_reason
    when 2 then 'runner_up'::public.dgl_points_reason
    when 3 then 'third_place'::public.dgl_points_reason
    else 'bonus'::public.dgl_points_reason
  end;

  if exists (
    select 1
    from public.player_points_ledger l
    where l.placement_id = new.id
  ) then
    perform public.dgl_refresh_player_points_summary(new.player_id);
    return new;
  end if;

  if new.points_awarded > 0 then
    insert into public.player_points_ledger (
      player_id,
      tournament_id,
      placement_id,
      reason,
      points_delta,
      description
    )
    values (
      new.player_id,
      new.tournament_id,
      new.id,
      v_reason,
      new.points_awarded,
      format('Placement #%s', new.placement)
    );
  end if;

  perform public.dgl_refresh_player_points_summary(new.player_id);

  return new;
end;
$$;

drop trigger if exists tournament_placements_sync_points on public.tournament_placements;
create trigger tournament_placements_sync_points
  after insert or update of points_awarded, placement, player_id
  on public.tournament_placements
  for each row execute function public.dgl_sync_points_for_player_placement();

commit;

-- >>> 20260628100005_dgl_activity_and_platform.sql
-- DGL schema extension — migration 6 of 8
-- Community activity feed and platform announcements.

begin;

create table if not exists public.platform_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  tag text,
  icon text,
  highlights jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  is_pinned boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists platform_updates_published_idx
  on public.platform_updates (is_published, published_at desc nulls last);

drop trigger if exists platform_updates_set_updated_at on public.platform_updates;
create trigger platform_updates_set_updated_at
  before update on public.platform_updates
  for each row execute function public.dgl_set_updated_at();

create table if not exists public.community_activity (
  id uuid primary key default gen_random_uuid(),
  activity_type public.dgl_activity_type not null,
  title text not null,
  summary text,
  tournament_id uuid references public.tournaments (id) on delete set null,
  player_id uuid references public.players (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists community_activity_public_timeline_idx
  on public.community_activity (is_public, occurred_at desc);

create index if not exists community_activity_tournament_idx
  on public.community_activity (tournament_id);

-- Emit activity when a tournament completes
create or replace function public.dgl_log_tournament_completed_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed'::public.dgl_tournament_status
     and (old.status is distinct from new.status) then
    insert into public.community_activity (
      activity_type,
      title,
      summary,
      tournament_id,
      payload,
      occurred_at
    )
    values (
      'tournament_completed',
      format('🏆 %s completed', new.championship_label),
      coalesce(new.completed_date_label, 'Recent'),
      new.id,
      jsonb_build_object(
        'global_number', new.global_number,
        'slug', new.slug,
        'prize_pool_display', new.prize_pool_display
      ),
      coalesce(new.completed_at, timezone('utc', now()))
    );
  end if;

  return new;
end;
$$;

drop trigger if exists tournaments_log_completed_activity on public.tournaments;
create trigger tournaments_log_completed_activity
  after update of status on public.tournaments
  for each row execute function public.dgl_log_tournament_completed_activity();

commit;

-- >>> 20260628100006_dgl_views_and_functions.sql
-- DGL schema extension — migration 7 of 8
-- Read models, helper functions, and legacy compatibility view.

begin;

-- Enriched tournaments (matches app tournamentModel fields)
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
  format(
    'DGL %s Championship #%s',
    t.championship_label,
    t.game_championship_number
  ) as championship_name,
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
  coalesce(rc.registered_count, 0) as registered_count
from public.tournaments t
join public.games g on g.id = t.game_id
left join public.v_tournament_registration_counts rc
  on rc.tournament_id = t.id;

-- Hall of Champions (placement 1 player rows per completed tournament)
create or replace view public.v_hall_of_champions
with (security_invoker = true) as
select
  te.id as tournament_id,
  te.slug,
  te.global_number,
  te.tournament_number,
  te.championship_name,
  te.game_slug,
  te.game_name,
  te.prize_pool_display,
  te.completed_date_label,
  te.accent_color,
  te.status,
  p.id as player_id,
  p.display_name as player_name,
  tp.points_awarded as dgl_points
from public.v_tournaments_enriched te
join public.tournament_placements tp
  on tp.tournament_id = te.id
 and tp.placement = 1
 and tp.entity_type = 'player'
join public.players p on p.id = tp.player_id
where te.status = 'completed'::public.dgl_tournament_status
order by te.global_number desc, p.display_name;

-- Leaderboard read model
create or replace view public.v_player_leaderboard
with (security_invoker = true) as
select
  row_number() over (
    order by s.total_points desc, s.championships desc, p.display_name asc
  )::integer as rank,
  p.id as player_id,
  p.display_name,
  s.total_points as points,
  s.championships,
  s.runner_up_finishes,
  s.third_place_finishes,
  s.tournaments_played,
  s.last_awarded_at
from public.player_points_summary s
join public.players p on p.id = s.player_id
where s.total_points > 0 or s.tournaments_played > 0;

-- Tournament results bundle (champion + runner-up player names)
create or replace view public.v_tournament_results
with (security_invoker = true) as
select
  te.id as tournament_id,
  te.slug,
  te.championship_name,
  te.tournament_number,
  te.game_slug,
  te.game_name,
  te.format,
  te.match_type,
  te.status,
  te.completed_date_label,
  te.prize_pool_display,
  te.accent_color,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 1
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as champion_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 2
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as runner_up_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 3
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as third_place_players
from public.v_tournaments_enriched te;

-- Legacy registrations compatibility (read-only; does not modify source table)
do $$
begin
  if to_regclass('public.registrations') is not null then
    execute $view$
      create or replace view public.v_legacy_registrations
      with (security_invoker = true) as
      select
        r.id,
        r.discord_name,
        r.valorant_ign,
        r.rank,
        r.created_at
      from public.registrations r
    $view$;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- RPCs referenced by the frontend config layer
-- ---------------------------------------------------------------------------

create or replace function public.get_platform_stats()
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
    select count(distinct coalesce(tr.player_id::text, tr.id::text))::integer as registered_players
    from public.tournament_registrations tr
    where tr.status in ('pending', 'confirmed', 'waitlist')
  ),
  points as (
    select coalesce(sum(points_delta), 0)::integer as dgl_points_awarded
    from public.player_points_ledger
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
    'dgl_points_awarded', (select dgl_points_awarded from points),
    'prize_pool_awarded', (select prize_pool_awarded from prizes)
  );
$$;

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
  participants as (
    select count(distinct tp.player_id)::integer as registered_players
    from public.tournament_placements tp
    join public.tournaments t on t.id = tp.tournament_id
    where t.status = 'completed'::public.dgl_tournament_status
      and tp.player_id is not null
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
    'registered_players', (select registered_players from participants),
    'champions_crowned', (select champions_crowned from champions),
    'prize_pool_awarded', (select prize_pool_awarded from prizes)
  );
$$;

create or replace function public.get_home_community_proof()
returns jsonb
language sql
stable
set search_path = public
as $$
  with stats as (
    select public.get_home_community_proof_stats() as data
  ),
  latest as (
    select
      te.tournament_number,
      te.championship_name,
      te.slug,
      te.accent_color
    from public.v_tournaments_enriched te
    where te.status = 'completed'::public.dgl_tournament_status
    order by te.global_number desc
    limit 1
  )
  select jsonb_build_object(
    'stats', (select data from stats),
    'latest_champion', (
      select jsonb_build_object(
        'tournament_number', l.tournament_number,
        'championship_name', l.championship_name,
        'results_path', case when l.slug is not null then '/tournaments/' || l.slug else null end,
        'accent', l.accent_color
      )
      from latest l
    )
  );
$$;

grant execute on function public.get_platform_stats() to anon, authenticated;
grant execute on function public.get_home_community_proof_stats() to anon, authenticated;
grant execute on function public.get_home_community_proof() to anon, authenticated;

commit;

-- >>> 20260628100007_dgl_rls_policies.sql
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

-- Views use security_invoker so anon/authenticated queries respect RLS on base tables.
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

-- >>> 20260628100008_dgl_seed_reference_data.sql
-- DGL schema extension — migration 9 of 9 (reference data)
-- Seeds games, points rules, tournaments, and Valorant Championship #1 results.
-- Idempotent: safe to re-run (uses ON CONFLICT / conditional inserts).

begin;

-- ---------------------------------------------------------------------------
-- DGL Points rules (matches src/config/dglPointsConfig.js)
-- ---------------------------------------------------------------------------

insert into public.dgl_points_rules (
  label,
  champion_points,
  runner_up_points,
  third_place_points,
  is_active
)
select 'default', 50, 20, 10, true
where not exists (
  select 1 from public.dgl_points_rules where is_active = true
);

-- ---------------------------------------------------------------------------
-- Games catalog
-- ---------------------------------------------------------------------------

insert into public.games (
  slug, name, category, accent_color, glow_color,
  team_size, max_roster_size, default_participation_mode,
  sort_order, featured, status
)
values
  ('valorant', 'Valorant', 'Tactical FPS', '#ff4655', 'rgba(255, 70, 85, 0.45)', 5, 7, 'team', 10, true, 'available'),
  ('cs2', 'Counter-Strike 2', 'Tactical FPS', '#de9b35', 'rgba(222, 155, 53, 0.45)', 5, 7, 'team', 20, true, 'coming_soon'),
  ('fc-26', 'EA SPORTS FC 26', 'Sports', '#00c853', 'rgba(0, 200, 83, 0.4)', 11, 18, 'team', 30, true, 'coming_soon'),
  ('marvel-rivals', 'Marvel Rivals', 'Hero Shooter', '#f5c518', 'rgba(245, 197, 24, 0.4)', 6, 8, 'team', 40, true, 'planned'),
  ('apex-legends', 'Apex Legends', 'Battle Royale', '#da2f3d', 'rgba(218, 47, 61, 0.45)', 3, 5, 'team', 50, true, 'planned'),
  ('arc-raiders', 'Arc Raiders', 'Extraction', '#ff6b4a', 'rgba(255, 107, 74, 0.45)', 3, 4, 'team', 60, false, 'planned'),
  ('delta-force', 'Delta Force', 'Tactical FPS', '#4ade80', 'rgba(74, 222, 128, 0.4)', 5, 7, 'team', 70, false, 'planned'),
  ('rainbow-six-siege', 'Rainbow Six Siege', 'Tactical FPS', '#f97316', 'rgba(249, 115, 22, 0.45)', 5, 7, 'team', 80, false, 'planned'),
  ('rocket-league', 'Rocket League', 'Sports', '#38bdf8', 'rgba(56, 189, 248, 0.4)', 3, 5, 'team', 90, false, 'planned'),
  ('pubg', 'PUBG: Battlegrounds', 'Battle Royale', '#facc15', 'rgba(250, 204, 21, 0.4)', 4, 6, 'team', 100, false, 'planned')
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  accent_color = excluded.accent_color,
  glow_color = excluded.glow_color,
  team_size = excluded.team_size,
  max_roster_size = excluded.max_roster_size,
  default_participation_mode = excluded.default_participation_mode,
  sort_order = excluded.sort_order,
  featured = excluded.featured,
  status = excluded.status;

-- ---------------------------------------------------------------------------
-- Tournament series
-- ---------------------------------------------------------------------------

insert into public.tournament_series (slug, name, game_id, cadence, participation_mode, default_format, default_match_type)
select
  'valorant-championship',
  'DGL Valorant Championship',
  g.id,
  'seasonal',
  'team',
  '5v5',
  'Best of 3'
from public.games g
where g.slug = 'valorant'
on conflict (slug) do nothing;

insert into public.tournament_series (slug, name, game_id, cadence, participation_mode, default_format, default_match_type)
select
  'fc26-championship',
  'DGL FC 26 Championship',
  g.id,
  'seasonal',
  'team',
  '11v11',
  'Single Elimination'
from public.games g
where g.slug = 'fc-26'
on conflict (slug) do nothing;

insert into public.tournament_series (slug, name, game_id, cadence, participation_mode, default_format, default_match_type)
select
  'cs2-championship',
  'DGL CS2 Championship',
  g.id,
  'seasonal',
  'team',
  '5v5',
  'Best of 3'
from public.games g
where g.slug = 'cs2'
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Tournaments #1–#3 (matches tournamentRegistry.js)
-- ---------------------------------------------------------------------------

insert into public.tournaments (
  global_number,
  external_id,
  slug,
  game_id,
  series_id,
  championship_label,
  participation_mode,
  format,
  match_type,
  status,
  prize_pool_display,
  prize_pool_amount,
  accent_color,
  completed_date_label,
  completed_at,
  is_featured
)
select
  1,
  'dgl-valorant-championship-1',
  'valorant-1',
  g.id,
  ts.id,
  'Valorant',
  'team',
  '5v5',
  'Best of 3',
  'completed',
  '₹1,000 Awarded',
  1000,
  '#ff4655',
  'June 27, 2026',
  timezone('utc', timestamptz '2026-06-27'),
  true
from public.games g
join public.tournament_series ts on ts.slug = 'valorant-championship'
where g.slug = 'valorant'
on conflict (external_id) do update
set
  status = excluded.status,
  prize_pool_display = excluded.prize_pool_display,
  prize_pool_amount = excluded.prize_pool_amount,
  completed_date_label = excluded.completed_date_label,
  completed_at = excluded.completed_at,
  is_featured = excluded.is_featured;

insert into public.tournaments (
  global_number,
  external_id,
  slug,
  game_id,
  series_id,
  championship_label,
  participation_mode,
  format,
  status,
  accent_color,
  is_featured
)
select
  2,
  'dgl-fc26-championship-1',
  null,
  g.id,
  ts.id,
  'FC 26',
  'team',
  '11v11',
  'coming_soon',
  '#00c853',
  false
from public.games g
join public.tournament_series ts on ts.slug = 'fc26-championship'
where g.slug = 'fc-26'
on conflict (external_id) do update
set status = excluded.status, format = excluded.format;

insert into public.tournaments (
  global_number,
  external_id,
  slug,
  game_id,
  series_id,
  championship_label,
  participation_mode,
  format,
  status,
  accent_color,
  is_featured
)
select
  3,
  'dgl-cs2-championship-1',
  null,
  g.id,
  ts.id,
  'CS2',
  'team',
  '5v5',
  'coming_soon',
  '#de9b35',
  false
from public.games g
join public.tournament_series ts on ts.slug = 'cs2-championship'
where g.slug = 'cs2'
on conflict (external_id) do update
set status = excluded.status;

-- ---------------------------------------------------------------------------
-- Valorant Championship #1 — players and placements
-- ---------------------------------------------------------------------------

with tournament as (
  select id from public.tournaments where external_id = 'dgl-valorant-championship-1'
),
rules as (
  select champion_points, runner_up_points
  from public.dgl_points_rules
  where is_active = true
  order by effective_from desc
  limit 1
),
player_names as (
  select * from (values
    ('Girish', 1),
    ('Bumble_Bee', 1),
    ('cl_me_Brian', 1),
    ('Mrbean', 1),
    ('Victor', 1),
    ('5am0anth0r', 2),
    ('Diddstein', 2),
    ('mike_', 2),
    ('St0rm', 2),
    ('Thelonewolf', 2)
  ) as v(display_name, placement)
),
upserted_players as (
  insert into public.players (display_name)
  select pn.display_name from player_names pn
  on conflict (display_name_key) do update
  set display_name = excluded.display_name
  returning id, display_name_key
),
all_players as (
  -- Must read from upserted_players so PostgreSQL executes the player upsert
  -- before resolving placements (unreferenced modifying CTEs may run last).
  select up.id, pn.display_name, pn.placement
  from player_names pn
  join upserted_players up on up.display_name_key = lower(btrim(pn.display_name))
)
insert into public.tournament_placements (
  tournament_id,
  placement,
  entity_type,
  player_id,
  points_awarded
)
select
  t.id,
  ap.placement,
  'player'::public.dgl_placement_entity_type,
  ap.id,
  case ap.placement
    when 1 then r.champion_points
    when 2 then r.runner_up_points
    else 0
  end
from tournament t
cross join rules r
join all_players ap on true
where not exists (
  select 1
  from public.tournament_placements tp
  where tp.tournament_id = t.id
    and tp.player_id = ap.id
);

-- Community activity for Valorant #1 (if not already logged by trigger)
insert into public.community_activity (
  activity_type,
  title,
  summary,
  tournament_id,
  payload,
  occurred_at
)
select
  'tournament_completed',
  '🏆 DGL Valorant Championship #1 completed',
  'June 27, 2026',
  t.id,
  jsonb_build_object('global_number', 1, 'slug', 'valorant-1'),
  timezone('utc', timestamptz '2026-06-27')
from public.tournaments t
where t.external_id = 'dgl-valorant-championship-1'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_completed'
  );

commit;

-- >>> 20260628100009_dgl_backfill_legacy_registrations.sql
-- DGL schema extension — optional migration 10
-- Backfill tournament_registrations from legacy public.registrations (Valorant #1).
-- Does NOT modify public.registrations.
-- Skips silently if the legacy table or target tournament is missing.

begin;

-- Ensure conflict target exists (created in 003; partial index requires matching ON CONFLICT predicate).
create unique index if not exists tournament_registrations_legacy_unique
  on public.tournament_registrations (tournament_id, legacy_registration_id)
  where legacy_registration_id is not null;

do $$
declare
  v_tournament_id uuid;
  v_legacy record;
  v_player_id uuid;
  v_inserted integer := 0;
begin
  if to_regclass('public.registrations') is null then
    raise notice 'Legacy public.registrations not found — skipping backfill.';
    return;
  end if;

  select id
    into v_tournament_id
  from public.tournaments
  where external_id = 'dgl-valorant-championship-1'
  limit 1;

  if v_tournament_id is null then
    raise notice 'Valorant Championship #1 tournament row not found — skipping backfill.';
    return;
  end if;

  for v_legacy in
    select r.id, r.discord_name, r.valorant_ign, r.rank, r.created_at
    from public.registrations r
  loop
    insert into public.players (display_name, discord_username)
    values (v_legacy.discord_name, v_legacy.discord_name)
    on conflict (display_name_key) do update
    set discord_username = coalesce(public.players.discord_username, excluded.discord_username)
    returning id into v_player_id;

    insert into public.player_game_profiles (player_id, game_id, in_game_name, rank_tier)
    select
      v_player_id,
      g.id,
      v_legacy.valorant_ign,
      v_legacy.rank
    from public.games g
    where g.slug = 'valorant'
    on conflict (player_id, game_id) do update
    set
      in_game_name = coalesce(excluded.in_game_name, public.player_game_profiles.in_game_name),
      rank_tier = coalesce(excluded.rank_tier, public.player_game_profiles.rank_tier);

    insert into public.tournament_registrations (
      tournament_id,
      player_id,
      status,
      registered_at,
      confirmed_at,
      form_data,
      legacy_registration_id
    )
    values (
      v_tournament_id,
      v_player_id,
      'confirmed',
      coalesce(v_legacy.created_at, timezone('utc', now())),
      coalesce(v_legacy.created_at, timezone('utc', now())),
      jsonb_build_object(
        'discord_name', v_legacy.discord_name,
        'valorant_ign', v_legacy.valorant_ign,
        'rank', v_legacy.rank,
        'source', 'legacy_registrations'
      ),
      v_legacy.id
    )
    on conflict (tournament_id, legacy_registration_id)
      where legacy_registration_id is not null
    do nothing;

    v_inserted := v_inserted + 1;
  end loop;

  raise notice 'Legacy registration backfill processed % rows.', v_inserted;
end $$;

commit;

-- >>> 20260628100010_dgl_repair_valorant_placements.sql
-- Repair Valorant Championship #1 placements when seed migration 008
-- inserted players but skipped placements (PostgreSQL CTE execution order).
-- Idempotent: safe to re-run.

begin;

with tournament as (
  select id from public.tournaments where external_id = 'dgl-valorant-championship-1'
),
rules as (
  select champion_points, runner_up_points
  from public.dgl_points_rules
  where is_active = true
  order by effective_from desc
  limit 1
),
player_names as (
  select * from (values
    ('Girish', 1),
    ('Bumble_Bee', 1),
    ('cl_me_Brian', 1),
    ('Mrbean', 1),
    ('Victor', 1),
    ('5am0anth0r', 2),
    ('Diddstein', 2),
    ('mike_', 2),
    ('St0rm', 2),
    ('Thelonewolf', 2)
  ) as v(display_name, placement)
),
upserted_players as (
  insert into public.players (display_name)
  select pn.display_name from player_names pn
  on conflict (display_name_key) do update
  set display_name = excluded.display_name
  returning id, display_name_key
),
all_players as (
  select up.id, pn.display_name, pn.placement
  from player_names pn
  join upserted_players up on up.display_name_key = lower(btrim(pn.display_name))
)
insert into public.tournament_placements (
  tournament_id,
  placement,
  entity_type,
  player_id,
  points_awarded
)
select
  t.id,
  ap.placement,
  'player'::public.dgl_placement_entity_type,
  ap.id,
  case ap.placement
    when 1 then r.champion_points
    when 2 then r.runner_up_points
    else 0
  end
from tournament t
cross join rules r
join all_players ap on true
where not exists (
  select 1
  from public.tournament_placements tp
  where tp.tournament_id = t.id
    and tp.player_id = ap.id
);

commit;

-- >>> 20260628100011_dgl_security_invoker_views_and_rpcs.sql
-- DGL security hardening — views and RPCs
-- Converts public API views/RPCs to SECURITY INVOKER so RLS applies to anon/authenticated.
-- Keeps SECURITY DEFINER only on internal trigger helpers that must write system tables.

begin;

-- ---------------------------------------------------------------------------
-- Views: enforce security_invoker (Splinter 0010 — security definer view)
-- ---------------------------------------------------------------------------

alter view public.v_tournament_registration_counts set (security_invoker = true);
alter view public.v_tournaments_enriched set (security_invoker = true);
alter view public.v_hall_of_champions set (security_invoker = true);
alter view public.v_player_leaderboard set (security_invoker = true);
alter view public.v_tournament_results set (security_invoker = true);

do $$
begin
  if to_regclass('public.v_legacy_registrations') is not null then
    execute 'alter view public.v_legacy_registrations set (security_invoker = true)';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Public RPCs: SECURITY INVOKER (aggregate only public RLS-visible rows)
-- ---------------------------------------------------------------------------

alter function public.get_platform_stats() security invoker;
alter function public.get_home_community_proof_stats() security invoker;
alter function public.get_home_community_proof() security invoker;

-- ---------------------------------------------------------------------------
-- Internal trigger functions: keep SECURITY DEFINER, revoke API execution
-- (must write ledger/summary/activity without granting anon INSERT policies)
-- ---------------------------------------------------------------------------

revoke all on function public.dgl_refresh_player_points_summary(uuid)
  from public, anon, authenticated;

revoke all on function public.dgl_sync_points_for_player_placement()
  from public, anon, authenticated;

revoke all on function public.dgl_log_tournament_completed_activity()
  from public, anon, authenticated;

commit;

-- >>> 20260712100000_dgl_participants_and_registration_closed.sql
-- Adds the registration_closed lifecycle status and a dedicated
-- tournament_participants dataset.
--
-- Participants are the players who actually play a tournament — distinct from
-- registrations (who signed up). This supports substitutions, no-shows, and
-- roster changes after registration closes. Registrations are never
-- overwritten by results; results never replace registration history.
--
-- Lifecycle: coming_soon → registration_open → registration_closed → active
-- (live) → completed.

-- ---------------------------------------------------------------------------
-- Tournament lifecycle: registration_closed
-- ---------------------------------------------------------------------------

alter type public.dgl_tournament_status add value if not exists 'registration_closed' before 'active';

-- ---------------------------------------------------------------------------
-- Participant status
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'dgl_participant_status') then
    create type public.dgl_participant_status as enum (
      'active',
      'substitute',
      'no_show',
      'removed'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Participants — who actually played (separate from registrations)
-- ---------------------------------------------------------------------------

create table if not exists public.tournament_participants (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  -- Optional link back to the registration that seeded this participant.
  -- Null for substitutions / players added after registration closed.
  registration_id uuid references public.tournament_registrations (id) on delete set null,
  status public.dgl_participant_status not null default 'active',
  notes text,
  added_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tournament_participants_unique unique (tournament_id, player_id)
);

create index if not exists tournament_participants_tournament_idx
  on public.tournament_participants (tournament_id, status);

drop trigger if exists tournament_participants_set_updated_at on public.tournament_participants;
create trigger tournament_participants_set_updated_at
  before update on public.tournament_participants
  for each row execute function public.dgl_set_updated_at();

alter table public.tournament_participants enable row level security;

drop policy if exists "tournament_participants_public_read" on public.tournament_participants;
create policy "tournament_participants_public_read"
  on public.tournament_participants for select
  to anon, authenticated
  using (true);

-- No anon/authenticated write policies: rosters are managed by the service
-- role (admin tooling / migrations) only.

-- >>> 20260712100001_dgl_fc26_championship_1_results.sql
-- DGL FC 26 Championship #1 — official completion and results.
--
-- Completed: 11 July 2026. Champions earn 150 DGL Points each, runner-up 100
-- each (the new standard going forward; historical Valorant awards remain
-- untouched in the immutable ledger).
--
-- Data model boundaries respected:
--   tournaments             → metadata + status (updated here)
--   tournament_registrations → registration history (NOT modified)
--   tournament_participants → who actually played (inserted here)
--   tournament_placements   → results (inserted here; trigger
--                             dgl_sync_points_for_player_placement writes the
--                             player_points_ledger and refreshes the summary)
--   player_points_ledger / summary → leaderboard (derived from results only)

begin;

-- ---------------------------------------------------------------------------
-- 1. New standard award values: champions 150, runner-up 100
-- ---------------------------------------------------------------------------

update public.dgl_points_rules
set champion_points = 150,
    runner_up_points = 100
where is_active = true;

-- ---------------------------------------------------------------------------
-- 2. Ensure a players row exists for every participant
-- ---------------------------------------------------------------------------

insert into public.players (display_name)
values
  ('viddy1485'),
  ('noisyboy96'),
  ('sabaresh9801'),
  ('ironfist3525'),
  ('iambalas'),
  ('ak4642'),
  ('danish01769'),
  ('ash4u'),
  ('K2K'),
  ('vinsonxavier12'),
  ('atlas.key'),
  ('limbo'),
  ('Naveen Kumar'),
  ('Frez'),
  ('Richie'),
  ('Palnikumar'),
  ('Herooo'),
  ('Jai')
on conflict (display_name_key) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Complete the tournament (metadata per the official record)
-- ---------------------------------------------------------------------------

update public.tournaments
set status = 'completed',
    completed_at = timestamptz '2026-07-11 17:30:00+00', -- 11:00 PM IST
    completed_date_label = 'July 11, 2026',
    format = '11v11',
    match_type = 'Best of 3',
    prize_pool_display = '₹2,000',
    metadata = metadata || jsonb_build_object('entry_fee', 'Free')
where external_id = 'dgl-fc26-championship-1';

-- ---------------------------------------------------------------------------
-- 4. Participants — the players who actually played.
--    Linked back to a registration when the same player registered;
--    substitutes/walk-ins keep registration_id null. Registrations themselves
--    are preserved untouched.
-- ---------------------------------------------------------------------------

insert into public.tournament_participants (tournament_id, player_id, registration_id, status)
select t.id, p.id, tr.id, 'active'
from public.tournaments t
cross join (values
  ('viddy1485'), ('noisyboy96'), ('sabaresh9801'), ('ironfist3525'),
  ('iambalas'), ('ak4642'), ('danish01769'), ('ash4u'), ('K2K'),
  ('vinsonxavier12'),
  ('atlas.key'), ('limbo'), ('Naveen Kumar'), ('Frez'), ('Richie'),
  ('Palnikumar'), ('Herooo'), ('Jai')
) as roster(display_name)
join public.players p on p.display_name_key = lower(btrim(roster.display_name))
left join public.tournament_registrations tr
  on tr.tournament_id = t.id and tr.player_id = p.id
where t.external_id = 'dgl-fc26-championship-1'
on conflict (tournament_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Results — champions (placement 1, 150 pts) and runner-up (placement 2,
--    100 pts). The placements trigger writes the points ledger and refreshes
--    player_points_summary, so the leaderboard derives from results only.
-- ---------------------------------------------------------------------------

insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 1, 'player', p.id, 150
from public.tournaments t
cross join (values
  ('viddy1485'), ('noisyboy96'), ('sabaresh9801'), ('ironfist3525'),
  ('iambalas'), ('ak4642'), ('danish01769'), ('ash4u'), ('K2K'),
  ('vinsonxavier12')
) as champs(display_name)
join public.players p on p.display_name_key = lower(btrim(champs.display_name))
where t.external_id = 'dgl-fc26-championship-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id
      and tp.placement = 1
      and tp.player_id = p.id
  );

insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 2, 'player', p.id, 100
from public.tournaments t
cross join (values
  ('atlas.key'), ('limbo'), ('Naveen Kumar'), ('Frez'), ('Richie'),
  ('Palnikumar'), ('Herooo'), ('Jai')
) as runners(display_name)
join public.players p on p.display_name_key = lower(btrim(runners.display_name))
where t.external_id = 'dgl-fc26-championship-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id
      and tp.placement = 2
      and tp.player_id = p.id
  );

-- ---------------------------------------------------------------------------
-- 6. Expose actual awarded points per tournament on the results view so the
--    UI renders real per-tournament values (Valorant keeps its historical
--    50/20; FC 26 shows 150/100) instead of a client-side constant.
--    Columns are appended, which "create or replace view" allows.
-- ---------------------------------------------------------------------------

create or replace view public.v_tournament_results
with (security_invoker = true) as
select
  te.id as tournament_id,
  te.slug,
  te.championship_name,
  te.tournament_number,
  te.game_slug,
  te.game_name,
  te.format,
  te.match_type,
  te.status,
  te.completed_date_label,
  te.prize_pool_display,
  te.accent_color,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 1
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as champion_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 2
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as runner_up_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 3
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as third_place_players,
  (
    select max(tp.points_awarded)
    from public.tournament_placements tp
    where tp.tournament_id = te.id
      and tp.placement = 1
      and tp.entity_type = 'player'
  ) as champion_points,
  (
    select max(tp.points_awarded)
    from public.tournament_placements tp
    where tp.tournament_id = te.id
      and tp.placement = 2
      and tp.entity_type = 'player'
  ) as runner_up_points
from public.v_tournaments_enriched te;

-- ---------------------------------------------------------------------------
-- 7. Community activity entry (mirrors the Valorant completion pattern)
-- ---------------------------------------------------------------------------

insert into public.community_activity (
  activity_type,
  title,
  summary,
  tournament_id,
  payload,
  occurred_at
)
select
  'tournament_completed',
  '🏆 DGL FC 26 Championship #1 completed',
  'July 11, 2026',
  t.id,
  jsonb_build_object('global_number', 2, 'slug', 'fc26-1'),
  timezone('utc', timestamptz '2026-07-11 17:30:00+00')
from public.tournaments t
where t.external_id = 'dgl-fc26-championship-1'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_completed'
  );

commit;

-- >>> 20260712110000_dgl_unfeature_completed_tournaments.sql
-- Completed tournaments should never hold the Main Event slot.
--
-- FC 26 Championship #1 kept is_featured = true after completion, pinning it
-- as the Main Event. Clearing the flag lets selectFeaturedTournament's
-- status-driven priority (Live → Registrations Open → Registrations Closed →
-- Coming Soon → Latest Completed) promote the next event automatically —
-- currently CS2 Championship #1 (coming_soon). No manual UI changes needed.

begin;

update public.tournaments
set is_featured = false
where is_featured = true
  and status = 'completed';

commit;


-- >>> 20260712120000_dgl_leaderboard_game_column.sql
-- Leaderboard "Game" column.
--
-- v_player_leaderboard carried no game information, so the UI rendered "—"
-- for every player. Derive each player's game from the tournament that
-- awarded their points (Tournament → Game → Placements → Ledger → Player):
-- the most recently awarding tournament's game wins if a player has earned
-- points in more than one game. Columns are appended, which
-- "create or replace view" allows.

begin;

create or replace view public.v_player_leaderboard
with (security_invoker = true) as
select
  row_number() over (
    order by s.total_points desc, s.championships desc, p.display_name asc
  )::integer as rank,
  p.id as player_id,
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

commit;

-- >>> 20260714100000_dgl_open_cs2_registration.sql

-- Opens CS2 Championship #1 registration.
--
-- The client (commit 7fde6fd) already generalized the registration flow and
-- updated the offline fallback registry to show CS2 as Registrations Open —
-- but this app always prefers live Supabase data when reachable
-- (useSupabaseData(fallback, liveFetcher)), so the tournament stayed on
-- "Coming Soon" in production until the source-of-truth row itself is
-- updated. This migration brings Supabase in line with the registry.

begin;

update public.tournaments
set status = 'registration_open',
    slug = 'cs2-1',
    match_type = 'Best of 3',
    prize_pool_display = '₹2,000 Team Prize',
    registration_limit = 10,
    starts_at = timestamptz '2026-07-25 19:30:00+00',
    metadata = metadata || jsonb_build_object('entry_fee', 'Free')
where external_id = 'dgl-cs2-championship-1';

commit;

-- >>> 20260715120000_dgl_add_among_us_fall_guys_games.sql

-- Adds two missing game catalog entries: Among Us and Fall Guys.
--
-- Catalog-only change to public.games (the roadmap/"Supported Titles" list
-- consumed by the homepage Featured Games section and the Dashboard Active
-- Realms grid). No tournaments, registrations, participants, placements, or
-- leaderboard data are touched — those are entirely separate tables.
--
-- Values mirror the existing non-tournament "planned" titles already in the
-- catalog (Arc Raiders, Delta Force, Rainbow Six Siege, Rocket League, PUBG):
-- status = planned, featured = false (the homepage Featured Games section
-- selects by an explicit slug allow-list in the client, not by this column —
-- see src/lib/homeModel.js HOME_FEATURED_GAME_IDS, which already includes
-- both slugs). participation_mode = solo, since both are individual-entrant
-- party games rather than fixed-roster team games — the only existing
-- catalog rows are all team titles, so this is the first use of the 'solo'
-- enum value the schema already supports.
--
-- accent_color / glow_color match src/config/dglGamesConfig.js exactly so
-- the client fallback and live Supabase data render identically.

begin;

insert into public.games (
  slug, name, category, accent_color, glow_color,
  team_size, max_roster_size, default_participation_mode,
  sort_order, featured, status
)
values
  (
    'among-us', 'Among Us', 'Social Deduction', '#14b8a6', 'rgba(20, 184, 166, 0.4)',
    1, null, 'solo',
    110, false, 'planned'
  ),
  (
    'fall-guys', 'Fall Guys', 'Party Platformer', '#ec4899', 'rgba(236, 72, 153, 0.4)',
    1, null, 'solo',
    120, false, 'planned'
  )
on conflict (slug) do nothing;

commit;

-- >>> 20260716100000_dgl_next_tournament_lifecycle.sql

-- Next Tournament lifecycle: DGL FC 26 Championship #2, plus the reusable
-- group-draw / fixtures schema and admin actions every future DGL
-- championship can use without new code.
--
-- Lifecycle mapping (see AGENTS/task brief for the full 7-stage diagram):
--   NEXT TOURNAMENT       -> tournaments.status = 'coming_soon',
--                             selected client-side as "next" by the same
--                             status-priority rule selectFeaturedTournament
--                             already uses, minus the current Main Event and
--                             completed tournaments (src/lib/tournamentModel.js).
--                             No new flag needed — purely derived, so it is
--                             reusable for every future tournament with zero
--                             code changes.
--   REGISTRATIONS OPEN    -> status = 'registration_open' (existing)
--   REGISTRATIONS CLOSED  -> status = 'registration_closed', now set
--                             AUTOMATICALLY by a trigger the moment the
--                             registration_limit'th confirmed registration
--                             lands (see dgl_close_registration_at_capacity
--                             below) — not client-computed, so it holds even
--                             if you look directly at the database.
--   GROUP DRAW            -> an admin-triggered action (run_group_draw),
--                             never automatic.
--   GROUP STAGE / KNOCKOUT -> status = 'active'; the specific stage is
--                             derivable from tournament_fixtures rows
--                             (stage = 'group' | 'quarterfinal' | 'semifinal'
--                             | 'final') rather than a separate top-level
--                             tournament status, so no enum churn is needed
--                             as formats evolve.
--   COMPLETED              -> status = 'completed' (existing pattern already
--                             used for Valorant #1 and FC 26 #1).
--
-- Promotion (Main Event handoff) is likewise an explicit admin action
-- (promote_next_tournament), never automatic — the brief is explicit that
-- finishing the current Main Event must not auto-promote the next one.

begin;

-- ---------------------------------------------------------------------------
-- 1. Fixture schema — generic enough for any group-stage-into-knockout
--    tournament, not just this one.
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'dgl_fixture_stage') then
    create type public.dgl_fixture_stage as enum (
      'group', 'quarterfinal', 'semifinal', 'final'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'dgl_fixture_status') then
    create type public.dgl_fixture_status as enum (
      'scheduled', 'completed'
    );
  end if;
end $$;

create table if not exists public.tournament_groups (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  label text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint tournament_groups_unique unique (tournament_id, label)
);

create table if not exists public.tournament_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.tournament_groups (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  seed smallint not null check (seed between 1 and 4),
  constraint tournament_group_members_unique_player unique (group_id, player_id),
  constraint tournament_group_members_unique_seed unique (group_id, seed)
);

create table if not exists public.tournament_fixtures (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  stage public.dgl_fixture_stage not null,
  group_id uuid references public.tournament_groups (id) on delete cascade,
  round_label text not null,
  fixture_order smallint not null default 0,
  player1_id uuid references public.players (id) on delete set null,
  player2_id uuid references public.players (id) on delete set null,
  -- Human-readable reference (e.g. "A1", "Winner QF1") for a slot whose real
  -- player isn't resolved yet — group standings / earlier knockout results
  -- aren't known at draw time. Filled in by a later admin action, out of
  -- scope here.
  player1_placeholder text,
  player2_placeholder text,
  winner_id uuid references public.players (id) on delete set null,
  status public.dgl_fixture_status not null default 'scheduled',
  created_at timestamptz not null default timezone('utc', now()),
  constraint tournament_fixtures_group_stage_has_group
    check (stage <> 'group' or group_id is not null)
);

create index if not exists tournament_groups_tournament_idx
  on public.tournament_groups (tournament_id);
create index if not exists tournament_group_members_group_idx
  on public.tournament_group_members (group_id);
create index if not exists tournament_fixtures_tournament_idx
  on public.tournament_fixtures (tournament_id, stage, fixture_order);

alter table public.tournament_groups enable row level security;
alter table public.tournament_group_members enable row level security;
alter table public.tournament_fixtures enable row level security;

drop policy if exists "tournament_groups_public_read" on public.tournament_groups;
create policy "tournament_groups_public_read"
  on public.tournament_groups for select
  to anon, authenticated
  using (true);

drop policy if exists "tournament_group_members_public_read" on public.tournament_group_members;
create policy "tournament_group_members_public_read"
  on public.tournament_group_members for select
  to anon, authenticated
  using (true);

drop policy if exists "tournament_fixtures_public_read" on public.tournament_fixtures;
create policy "tournament_fixtures_public_read"
  on public.tournament_fixtures for select
  to anon, authenticated
  using (true);

-- No anon/authenticated write policies on any of the three: groups and
-- fixtures are only ever written by the SECURITY DEFINER run_group_draw()
-- action below (an admin action, or a future Admin Panel calling the same
-- RPC) — never directly by players or the public registration flow.

-- ---------------------------------------------------------------------------
-- 2. Automatic registration close at capacity — a real trigger, not just
--    client-side math, so tournaments.status is correct even outside the UI.
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

  select count(*) into v_count
  from public.tournament_registrations
  where tournament_id = new.tournament_id
    and status in ('pending', 'confirmed', 'waitlist');

  if v_count >= v_limit then
    update public.tournaments
    set status = 'registration_closed', updated_at = timezone('utc', now())
    where id = new.tournament_id;
  end if;

  return new;
end;
$$;

drop trigger if exists tournament_registrations_close_at_capacity on public.tournament_registrations;
create trigger tournament_registrations_close_at_capacity
  after insert on public.tournament_registrations
  for each row execute function public.dgl_close_registration_at_capacity();

-- ---------------------------------------------------------------------------
-- 3. Admin action: promote the Next Tournament to Main Event.
--    Manual only — never called automatically. A future Admin Panel would
--    call this exact RPC.
-- ---------------------------------------------------------------------------

create or replace function public.promote_next_tournament(p_tournament_id uuid)
returns public.tournaments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.tournaments;
begin
  select * into v_row from public.tournaments where id = p_tournament_id;
  if not found then
    raise exception 'Tournament % not found', p_tournament_id;
  end if;
  if v_row.status <> 'coming_soon' then
    raise exception 'Tournament % is not in coming_soon status (found %)', p_tournament_id, v_row.status;
  end if;

  -- enforce_single_featured_tournament (existing trigger) automatically
  -- unfeatures whichever tournament currently holds is_featured, so the
  -- outgoing Main Event doesn't need to be touched here. Its own promotion
  -- to Completed Tournaments happens via the same results-recording
  -- migration pattern already used for Valorant #1 / FC 26 #1, a separate
  -- concern from this handoff.
  update public.tournaments
  set status = 'registration_open',
      is_featured = true,
      updated_at = timezone('utc', now())
  where id = p_tournament_id
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.promote_next_tournament(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Admin action: random group draw + fixture generation.
--    Manual only. Idempotency guard: refuses to run twice for the same
--    tournament (existing groups block a re-draw).
-- ---------------------------------------------------------------------------

create or replace function public.run_group_draw(p_tournament_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_status public.dgl_tournament_status;
  v_player_ids uuid[];
  v_group_labels text[] := array['A', 'B', 'C', 'D'];
  v_group_id uuid;
  v_group_ids uuid[] := '{}';
  v_label text;
  v_i integer;
  v_j integer;
  v_k integer;
  v_fixture_count integer := 0;
  v_members uuid[];
begin
  if exists (select 1 from public.tournament_groups where tournament_id = p_tournament_id) then
    raise exception 'Tournament % already has groups — draw already run', p_tournament_id;
  end if;

  select registration_limit, status into v_limit, v_status
  from public.tournaments where id = p_tournament_id;

  if not found then
    raise exception 'Tournament % not found', p_tournament_id;
  end if;
  if v_limit is null or v_limit <> 16 then
    raise exception 'run_group_draw expects a 16-player tournament (registration_limit = %)', v_limit;
  end if;

  select array_agg(player_id order by random())
    into v_player_ids
  from public.tournament_registrations
  where tournament_id = p_tournament_id
    and status = 'confirmed';

  if v_player_ids is null or array_length(v_player_ids, 1) <> 16 then
    raise exception 'Expected exactly 16 confirmed registrations, found %',
      coalesce(array_length(v_player_ids, 1), 0);
  end if;

  -- 4 groups of 4, seeded 1-4 in shuffled order.
  for v_i in 1..4 loop
    v_label := v_group_labels[v_i];
    insert into public.tournament_groups (tournament_id, label)
    values (p_tournament_id, v_label)
    returning id into v_group_id;
    v_group_ids := v_group_ids || v_group_id;

    for v_j in 1..4 loop
      insert into public.tournament_group_members (group_id, player_id, seed)
      values (v_group_id, v_player_ids[(v_i - 1) * 4 + v_j], v_j);
    end loop;
  end loop;

  -- Round-robin group fixtures: every player plays every other player in
  -- their group once (6 matches per group of 4).
  for v_i in 1..4 loop
    select array_agg(player_id order by seed) into v_members
    from public.tournament_group_members
    where group_id = v_group_ids[v_i];

    for v_j in 1..3 loop
      for v_k in (v_j + 1)..4 loop
        insert into public.tournament_fixtures (
          tournament_id, stage, group_id, round_label, fixture_order,
          player1_id, player2_id
        ) values (
          p_tournament_id, 'group', v_group_ids[v_i],
          'Group ' || v_group_labels[v_i], v_fixture_count,
          v_members[v_j], v_members[v_k]
        );
        v_fixture_count := v_fixture_count + 1;
      end loop;
    end loop;
  end loop;

  -- Knockout skeleton: participants aren't known until the group stage
  -- concludes, so these are placeholder-only fixtures per the brief's exact
  -- bracket (A1 vs B2, B1 vs A2, C1 vs D2, D1 vs C2 -> semis -> final).
  insert into public.tournament_fixtures
    (tournament_id, stage, round_label, fixture_order, player1_placeholder, player2_placeholder)
  values
    (p_tournament_id, 'quarterfinal', 'Quarter Final 1', 0, 'A1', 'B2'),
    (p_tournament_id, 'quarterfinal', 'Quarter Final 2', 1, 'B1', 'A2'),
    (p_tournament_id, 'quarterfinal', 'Quarter Final 3', 2, 'C1', 'D2'),
    (p_tournament_id, 'quarterfinal', 'Quarter Final 4', 3, 'D1', 'C2'),
    (p_tournament_id, 'semifinal', 'Semi Final 1', 0, 'Winner QF1', 'Winner QF2'),
    (p_tournament_id, 'semifinal', 'Semi Final 2', 1, 'Winner QF3', 'Winner QF4'),
    (p_tournament_id, 'final', 'Grand Final', 0, 'Winner SF1', 'Winner SF2');

  update public.tournaments
  set status = 'active', updated_at = timezone('utc', now())
  where id = p_tournament_id;

  return v_fixture_count + 7;
end;
$$;

revoke all on function public.run_group_draw(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. DGL FC 26 Championship #2 — the Next Tournament.
--    status = coming_soon (not yet promoted); registration_limit = 16;
--    the World-Cup-style format is stored as a template (no real
--    groups/fixtures exist until run_group_draw() is called post-close).
-- ---------------------------------------------------------------------------

insert into public.tournaments (
  global_number, game_championship_number, external_id, slug,
  game_id, series_id, championship_label,
  format, match_type, status,
  prize_pool_display, accent_color, registration_limit,
  metadata
)
select
  4, 2, 'dgl-fc26-championship-2', 'fc26-2',
  g.id, s.id, 'FC 26',
  '1v1', 'Group Stage → Knockout', 'coming_soon',
  '₹2,000', g.accent_color, 16,
  jsonb_build_object(
    'entry_fee', 'Free',
    'format_template', jsonb_build_object(
      'type', 'group_knockout',
      'players', 16,
      'groups', 4,
      'players_per_group', 4,
      'group_stage', jsonb_build_object(
        'type', 'round_robin',
        'description', 'Each player plays every other player in their group once.'
      ),
      'advance_per_group', 2,
      'knockout', jsonb_build_object(
        'quarterfinals', jsonb_build_array(
          jsonb_build_object('label', 'QF1', 'players', jsonb_build_array('A1', 'B2')),
          jsonb_build_object('label', 'QF2', 'players', jsonb_build_array('B1', 'A2')),
          jsonb_build_object('label', 'QF3', 'players', jsonb_build_array('C1', 'D2')),
          jsonb_build_object('label', 'QF4', 'players', jsonb_build_array('D1', 'C2'))
        ),
        'semifinals', jsonb_build_array(
          jsonb_build_object('label', 'SF1', 'players', jsonb_build_array('Winner QF1', 'Winner QF2')),
          jsonb_build_object('label', 'SF2', 'players', jsonb_build_array('Winner QF3', 'Winner QF4'))
        ),
        'final', jsonb_build_object('label', 'Grand Final', 'players', jsonb_build_array('Winner SF1', 'Winner SF2'))
      )
    )
  )
from public.games g, public.tournament_series s
where g.slug = 'fc-26' and s.slug = 'fc26-championship'
on conflict (external_id) do nothing;

commit;

-- >>> 20260803120000_dgl_admin_foundation.sql
-- DGL admin foundation (Phase 1)
-- Additive only: admin membership, archive flag, audit log, activity types,
-- admin write RLS, Realtime prep for community_activity.
--
-- Does NOT change public tournament SELECT policy (drafts stay hidden;
-- archived filtering is application-layer in a later phase).
-- Does NOT modify the tournament_completed activity trigger.

-- ---------------------------------------------------------------------------
-- Activity types for admin + Jarvis event stream
-- ---------------------------------------------------------------------------

alter type public.dgl_activity_type add value if not exists 'tournament_created';
alter type public.dgl_activity_type add value if not exists 'tournament_updated';
alter type public.dgl_activity_type add value if not exists 'tournament_cancelled';
alter type public.dgl_activity_type add value if not exists 'tournament_featured';
alter type public.dgl_activity_type add value if not exists 'tournament_archived';
alter type public.dgl_activity_type add value if not exists 'leaderboard_updated';
alter type public.dgl_activity_type add value if not exists 'hall_of_fame_updated';
alter type public.dgl_activity_type add value if not exists 'giveaway_created';
alter type public.dgl_activity_type add value if not exists 'giveaway_completed';

begin;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.admin_users is
  'Authenticated users allowed to manage DGL tournaments via the admin dashboard.';

alter table public.admin_users enable row level security;

create or replace function public.is_dgl_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

comment on function public.is_dgl_admin() is
  'True when the current auth.uid() is listed in admin_users. Used by RLS.';

revoke all on function public.is_dgl_admin() from public;
grant execute on function public.is_dgl_admin() to anon, authenticated;

drop policy if exists "admin_users_select_self_or_admin" on public.admin_users;
create policy "admin_users_select_self_or_admin"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid() or public.is_dgl_admin());

drop policy if exists "admin_users_admin_insert" on public.admin_users;
create policy "admin_users_admin_insert"
  on public.admin_users for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "admin_users_admin_update" on public.admin_users;
create policy "admin_users_admin_update"
  on public.admin_users for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "admin_users_admin_delete" on public.admin_users;
create policy "admin_users_admin_delete"
  on public.admin_users for delete
  to authenticated
  using (public.is_dgl_admin());

alter table public.tournaments
  add column if not exists is_archived boolean not null default false;

alter table public.tournaments
  add column if not exists created_by uuid references auth.users (id) on delete set null;

alter table public.tournaments
  add column if not exists updated_by uuid references auth.users (id) on delete set null;

comment on column public.tournaments.is_archived is
  'When true, application-layer lists may hide this tournament. Not enforced by public RLS.';

comment on column public.tournaments.created_by is
  'Auth user who created the tournament (admin session).';

comment on column public.tournaments.updated_by is
  'Auth user who last updated the tournament (admin session).';

create index if not exists tournaments_is_archived_idx
  on public.tournaments (is_archived)
  where is_archived = true;

create index if not exists tournaments_created_by_idx
  on public.tournaments (created_by)
  where created_by is not null;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null default 'tournament',
  entity_id uuid,
  tournament_id uuid references public.tournaments (id) on delete set null,
  old_value jsonb not null default '{}'::jsonb,
  new_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.admin_audit_log is
  'Append-only record of important admin actions for troubleshooting.';

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_admin_user_idx
  on public.admin_audit_log (admin_user_id, created_at desc);

create index if not exists admin_audit_log_tournament_idx
  on public.admin_audit_log (tournament_id, created_at desc)
  where tournament_id is not null;

alter table public.admin_audit_log enable row level security;

drop policy if exists "admin_audit_log_admin_select" on public.admin_audit_log;
create policy "admin_audit_log_admin_select"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_dgl_admin());

drop policy if exists "admin_audit_log_admin_insert" on public.admin_audit_log;
create policy "admin_audit_log_admin_insert"
  on public.admin_audit_log for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "tournaments_admin_select" on public.tournaments;
create policy "tournaments_admin_select"
  on public.tournaments for select
  to authenticated
  using (public.is_dgl_admin());

drop policy if exists "tournaments_admin_insert" on public.tournaments;
create policy "tournaments_admin_insert"
  on public.tournaments for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "tournaments_admin_update" on public.tournaments;
create policy "tournaments_admin_update"
  on public.tournaments for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "tournaments_admin_delete" on public.tournaments;
create policy "tournaments_admin_delete"
  on public.tournaments for delete
  to authenticated
  using (public.is_dgl_admin());

drop policy if exists "community_activity_admin_insert" on public.community_activity;
create policy "community_activity_admin_insert"
  on public.community_activity for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "community_activity_admin_select" on public.community_activity;
create policy "community_activity_admin_select"
  on public.community_activity for select
  to authenticated
  using (public.is_dgl_admin());

drop policy if exists "tournament_placements_admin_insert" on public.tournament_placements;
create policy "tournament_placements_admin_insert"
  on public.tournament_placements for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "tournament_placements_admin_update" on public.tournament_placements;
create policy "tournament_placements_admin_update"
  on public.tournament_placements for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "tournament_placements_admin_delete" on public.tournament_placements;
create policy "tournament_placements_admin_delete"
  on public.tournament_placements for delete
  to authenticated
  using (public.is_dgl_admin());

drop policy if exists "players_admin_update" on public.players;
create policy "players_admin_update"
  on public.players for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "tournament_series_admin_insert" on public.tournament_series;
create policy "tournament_series_admin_insert"
  on public.tournament_series for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "tournament_series_admin_update" on public.tournament_series;
create policy "tournament_series_admin_update"
  on public.tournament_series for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

do $$
begin
  alter publication supabase_realtime add table public.community_activity;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'supabase_realtime publication not found — skip Realtime registration';
  when others then
    if sqlerrm ilike '%already member%' then
      null;
    else
      raise;
    end if;
end $$;

commit;

-- >>> 20260803130000_dgl_giveaways.sql
-- DGL community giveaways (Phase G1)
-- Admin-managed giveaways with eligibility from tournament registrations.
-- No public policies — website admin is the source of truth.

do $$ begin
  create type public.dgl_giveaway_status as enum (
    'draft',
    'published',
    'entries_closed',
    'winner_selected',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

begin;

create table if not exists public.giveaways (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  reason text,
  description text,
  prize text not null,
  rules text,
  status public.dgl_giveaway_status not null default 'draft',
  eligible_tournament_ids uuid[] not null default '{}'::uuid[],
  entries_close_at timestamptz,
  draw_at timestamptz,
  winner_player_id uuid references public.players (id) on delete set null,
  winner_name text,
  winner_discord_name text,
  winner_notes text,
  published_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  is_archived boolean not null default false,
  constraint giveaways_title_not_blank check (length(btrim(title)) > 0),
  constraint giveaways_prize_not_blank check (length(btrim(prize)) > 0)
);

create index if not exists giveaways_status_idx
  on public.giveaways (status)
  where is_archived = false;

create index if not exists giveaways_archived_idx
  on public.giveaways (is_archived)
  where is_archived = true;

create index if not exists giveaways_created_at_idx
  on public.giveaways (created_at desc);

drop trigger if exists giveaways_set_updated_at on public.giveaways;
create trigger giveaways_set_updated_at
  before update on public.giveaways
  for each row execute function public.dgl_set_updated_at();

comment on table public.giveaways is
  'DGL community reward giveaways. Eligibility is computed from tournament_registrations for eligible_tournament_ids.';

comment on column public.giveaways.eligible_tournament_ids is
  'Official tournament UUIDs whose registered players form the distinct eligible pool.';

comment on column public.giveaways.winner_player_id is
  'Official winner recorded after an external Wheel of Names draw. Must be in the eligible set.';

alter table public.giveaways enable row level security;

drop policy if exists "giveaways_admin_select" on public.giveaways;
create policy "giveaways_admin_select"
  on public.giveaways for select
  to authenticated
  using (public.is_dgl_admin());

drop policy if exists "giveaways_admin_insert" on public.giveaways;
create policy "giveaways_admin_insert"
  on public.giveaways for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "giveaways_admin_update" on public.giveaways;
create policy "giveaways_admin_update"
  on public.giveaways for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "giveaways_admin_delete" on public.giveaways;
create policy "giveaways_admin_delete"
  on public.giveaways for delete
  to authenticated
  using (public.is_dgl_admin());

commit;

-- >>> 20260813100000_dgl_rocket_league_1_free_entry.sql
-- Rocket League Championship #1: free entry (pre-tournament refinement).
-- Prize pool, registration, reserve, limit, and lifecycle unchanged.

begin;

update public.tournaments
set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('entry_fee', 'Free'),
    updated_at = timezone('utc', now())
where external_id = 'dgl-rocket-league-championship-1'
  and coalesce(metadata->>'entry_fee', '') is distinct from 'Free';

commit;

-- >>> 20260814100000_dgl_rocket_league_1_results.sql
-- See supabase/migrations/20260814100000_dgl_rocket_league_1_results.sql
-- (Rocket League Championship #1 actual results — applied via db push)

-- >>> 20260815100000_dgl_valorant_showdown_featured.sql
-- See supabase/migrations/20260815100000_dgl_valorant_showdown_featured.sql

-- >>> 20260815200000_dgl_valorant_showdown_capacity_22.sql
-- See supabase/migrations/20260815200000_dgl_valorant_showdown_capacity_22.sql

-- >>> 20260816100000_dgl_fc26_saturday_showdown_3.sql
-- See supabase/migrations/20260816100000_dgl_fc26_saturday_showdown_3.sql

-- >>> 20260817100000_dgl_rocket_league_1_champion_points_350.sql
-- See supabase/migrations/20260817100000_dgl_rocket_league_1_champion_points_350.sql

-- >>> 20260818100000_dgl_valorant_showdown_capacity_28.sql
-- See supabase/migrations/20260818100000_dgl_valorant_showdown_capacity_28.sql

-- >>> 20260818200000_dgl_reopen_valorant_showdown_registration.sql
-- See supabase/migrations/20260818200000_dgl_reopen_valorant_showdown_registration.sql
