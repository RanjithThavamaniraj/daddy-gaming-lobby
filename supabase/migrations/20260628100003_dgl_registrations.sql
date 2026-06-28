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
create or replace view public.v_tournament_registration_counts as
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
