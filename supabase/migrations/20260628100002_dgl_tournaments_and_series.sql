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
