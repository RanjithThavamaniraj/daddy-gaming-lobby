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
