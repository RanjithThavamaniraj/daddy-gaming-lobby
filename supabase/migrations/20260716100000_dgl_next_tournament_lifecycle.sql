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
