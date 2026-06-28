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
