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
