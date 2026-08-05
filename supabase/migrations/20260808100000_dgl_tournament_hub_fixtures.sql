-- Phase 2: tournament hub — fixture scores, live status, admin match RPCs,
-- automatic knockout progression + final placements/points.
-- Reuses tournament_groups / tournament_group_members / tournament_fixtures.

begin;

-- ---------------------------------------------------------------------------
-- 1. Fixture score + schedule columns
-- ---------------------------------------------------------------------------

alter table public.tournament_fixtures
  add column if not exists player1_score integer,
  add column if not exists player2_score integer,
  add column if not exists scheduled_at timestamptz,
  add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'dgl_fixture_status'
      and e.enumlabel = 'live'
  ) then
    alter type public.dgl_fixture_status add value 'live';
  end if;
end $$;

comment on column public.tournament_fixtures.player1_score is
  'Score for player1 when match is completed (or in progress).';
comment on column public.tournament_fixtures.player2_score is
  'Score for player2 when match is completed (or in progress).';

-- ---------------------------------------------------------------------------
-- 2. Admin RLS for groups / members / fixtures
-- ---------------------------------------------------------------------------

drop policy if exists "tournament_groups_admin_all" on public.tournament_groups;
create policy "tournament_groups_admin_all"
  on public.tournament_groups for all
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "tournament_group_members_admin_all" on public.tournament_group_members;
create policy "tournament_group_members_admin_all"
  on public.tournament_group_members for all
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "tournament_fixtures_admin_all" on public.tournament_fixtures;
create policy "tournament_fixtures_admin_all"
  on public.tournament_fixtures for all
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

-- ---------------------------------------------------------------------------
-- 3. Allow authenticated admins to run the existing group draw
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
  if not public.is_dgl_admin() then
    raise exception 'Only DGL admins can run the group draw';
  end if;

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
  if v_status not in ('registration_closed', 'active') then
    raise exception 'Group draw requires registration_closed or active (found %)', v_status;
  end if;

  select array_agg(player_id order by random())
    into v_player_ids
  from public.tournament_registrations
  where tournament_id = p_tournament_id
    and status = 'confirmed'
    and player_id is not null;

  if v_player_ids is null or array_length(v_player_ids, 1) <> 16 then
    raise exception 'Expected exactly 16 confirmed registrations, found %',
      coalesce(array_length(v_player_ids, 1), 0);
  end if;

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

  for v_i in 1..4 loop
    select array_agg(player_id order by seed) into v_members
    from public.tournament_group_members
    where group_id = v_group_ids[v_i];

    for v_j in 1..3 loop
      for v_k in (v_j + 1)..4 loop
        insert into public.tournament_fixtures (
          tournament_id, stage, group_id, round_label, fixture_order,
          player1_id, player2_id, status
        ) values (
          p_tournament_id, 'group', v_group_ids[v_i],
          'Group ' || v_group_labels[v_i], v_fixture_count,
          v_members[v_j], v_members[v_k], 'scheduled'
        );
        v_fixture_count := v_fixture_count + 1;
      end loop;
    end loop;
  end loop;

  insert into public.tournament_fixtures
    (tournament_id, stage, round_label, fixture_order, player1_placeholder, player2_placeholder, status)
  values
    (p_tournament_id, 'quarterfinal', 'Quarter Final 1', 0, 'A1', 'B2', 'scheduled'),
    (p_tournament_id, 'quarterfinal', 'Quarter Final 2', 1, 'B1', 'A2', 'scheduled'),
    (p_tournament_id, 'quarterfinal', 'Quarter Final 3', 2, 'C1', 'D2', 'scheduled'),
    (p_tournament_id, 'quarterfinal', 'Quarter Final 4', 3, 'D1', 'C2', 'scheduled'),
    (p_tournament_id, 'semifinal', 'Semi Final 1', 0, 'Winner QF1', 'Winner QF2', 'scheduled'),
    (p_tournament_id, 'semifinal', 'Semi Final 2', 1, 'Winner QF3', 'Winner QF4', 'scheduled'),
    (p_tournament_id, 'final', 'Grand Final', 0, 'Winner SF1', 'Winner SF2', 'scheduled');

  update public.tournaments
  set status = 'active', updated_at = timezone('utc', now())
  where id = p_tournament_id;

  return v_fixture_count + 7;
end;
$$;

revoke all on function public.run_group_draw(uuid) from public, anon;
grant execute on function public.run_group_draw(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Group standings helper (wins → GD → GF → seed)
-- ---------------------------------------------------------------------------

create or replace function public.dgl_group_standings(p_group_id uuid)
returns table (
  player_id uuid,
  wins integer,
  losses integer,
  goals_for integer,
  goals_against integer,
  goal_diff integer,
  seed smallint,
  rank integer
)
language sql
stable
security definer
set search_path = public
as $$
  with members as (
    select m.player_id, m.seed
    from public.tournament_group_members m
    where m.group_id = p_group_id
  ),
  results as (
    select
      m.player_id,
      m.seed,
      coalesce(sum(
        case
          when f.status = 'completed' and f.winner_id = m.player_id then 1
          else 0
        end
      ), 0)::integer as wins,
      coalesce(sum(
        case
          when f.status = 'completed'
            and f.winner_id is not null
            and f.winner_id <> m.player_id
            and (f.player1_id = m.player_id or f.player2_id = m.player_id)
          then 1
          else 0
        end
      ), 0)::integer as losses,
      coalesce(sum(
        case
          when f.player1_id = m.player_id then coalesce(f.player1_score, 0)
          when f.player2_id = m.player_id then coalesce(f.player2_score, 0)
          else 0
        end
      ), 0)::integer as goals_for,
      coalesce(sum(
        case
          when f.player1_id = m.player_id then coalesce(f.player2_score, 0)
          when f.player2_id = m.player_id then coalesce(f.player1_score, 0)
          else 0
        end
      ), 0)::integer as goals_against
    from members m
    left join public.tournament_fixtures f
      on f.group_id = p_group_id
     and f.stage = 'group'
     and (f.player1_id = m.player_id or f.player2_id = m.player_id)
    group by m.player_id, m.seed
  )
  select
    r.player_id,
    r.wins,
    r.losses,
    r.goals_for,
    r.goals_against,
    (r.goals_for - r.goals_against) as goal_diff,
    r.seed,
    row_number() over (
      order by r.wins desc, (r.goals_for - r.goals_against) desc, r.goals_for desc, r.seed asc
    )::integer as rank
  from results r;
$$;

revoke all on function public.dgl_group_standings(uuid) from public;
grant execute on function public.dgl_group_standings(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Fill knockout slots from group standings (top 2 advance)
-- ---------------------------------------------------------------------------

create or replace function public.dgl_fill_knockout_from_groups(p_tournament_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer;
  v_map jsonb := '{}'::jsonb;
  v_g record;
  v_s record;
  v_key text;
  v_fix record;
  v_p1 uuid;
  v_p2 uuid;
begin
  select count(*) into v_remaining
  from public.tournament_fixtures
  where tournament_id = p_tournament_id
    and stage = 'group'
    and status <> 'completed';

  if v_remaining > 0 then
    return;
  end if;

  for v_g in
    select id, label from public.tournament_groups where tournament_id = p_tournament_id
  loop
    for v_s in
      select * from public.dgl_group_standings(v_g.id) where rank <= 2
    loop
      v_key := v_g.label || v_s.rank::text;
      v_map := v_map || jsonb_build_object(v_key, v_s.player_id);
    end loop;
  end loop;

  for v_fix in
    select *
    from public.tournament_fixtures
    where tournament_id = p_tournament_id
      and stage = 'quarterfinal'
  loop
    v_p1 := nullif(v_map ->> v_fix.player1_placeholder, '')::uuid;
    v_p2 := nullif(v_map ->> v_fix.player2_placeholder, '')::uuid;
    update public.tournament_fixtures
    set
      player1_id = coalesce(v_p1, player1_id),
      player2_id = coalesce(v_p2, player2_id)
    where id = v_fix.id;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Advance knockout winners into later placeholder slots
-- ---------------------------------------------------------------------------

create or replace function public.dgl_advance_knockout_winner(p_fixture_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fix public.tournament_fixtures%rowtype;
  v_token text;
  v_n integer;
begin
  select * into v_fix from public.tournament_fixtures where id = p_fixture_id;
  if not found or v_fix.winner_id is null then
    return;
  end if;

  if v_fix.stage = 'quarterfinal' then
    v_n := v_fix.fixture_order + 1;
    v_token := 'Winner QF' || v_n::text;
  elsif v_fix.stage = 'semifinal' then
    v_n := v_fix.fixture_order + 1;
    v_token := 'Winner SF' || v_n::text;
  else
    return;
  end if;

  update public.tournament_fixtures f
  set player1_id = v_fix.winner_id
  where f.tournament_id = v_fix.tournament_id
    and f.player1_placeholder = v_token
    and f.player1_id is null;

  update public.tournament_fixtures f
  set player2_id = v_fix.winner_id
  where f.tournament_id = v_fix.tournament_id
    and f.player2_placeholder = v_token
    and f.player2_id is null;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Publish final placements + points when Grand Final completes
-- ---------------------------------------------------------------------------

create or replace function public.dgl_publish_standings_from_final(p_tournament_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_final public.tournament_fixtures%rowtype;
  v_rules public.dgl_points_rules%rowtype;
  v_champion uuid;
  v_runner uuid;
  v_sf record;
  v_qf record;
  v_member record;
  v_refresh uuid;
  v_champion_pts integer := 200;
  v_runner_pts integer := 150;
  v_sf_pts integer := 100;
  v_qf_pts integer := 50;
  v_group_pts integer := 50;
  v_refresh_ids uuid[] := '{}';
begin
  select * into v_final
  from public.tournament_fixtures
  where tournament_id = p_tournament_id
    and stage = 'final'
  order by fixture_order
  limit 1;

  if not found or v_final.status <> 'completed' or v_final.winner_id is null then
    return;
  end if;

  select * into v_rules
  from public.dgl_points_rules
  where is_active = true
  order by effective_from desc
  limit 1;

  if found then
    v_champion_pts := coalesce(v_rules.champion_points, v_champion_pts);
    v_runner_pts := coalesce(v_rules.runner_up_points, v_runner_pts);
    v_sf_pts := coalesce(v_rules.semifinal_points, v_sf_pts);
    v_qf_pts := coalesce(v_rules.quarterfinal_points, v_qf_pts);
    v_group_pts := coalesce(v_rules.group_stage_points, v_group_pts);
  end if;

  v_champion := v_final.winner_id;
  v_runner := case
    when v_final.player1_id = v_champion then v_final.player2_id
    else v_final.player1_id
  end;

  select coalesce(array_agg(distinct player_id), '{}')
    into v_refresh_ids
  from (
    select player_id from public.player_points_ledger where tournament_id = p_tournament_id
    union
    select player_id from public.tournament_placements where tournament_id = p_tournament_id
  ) prior_players
  where player_id is not null;

  delete from public.player_points_ledger
  where tournament_id = p_tournament_id;

  delete from public.tournament_placements
  where tournament_id = p_tournament_id;

  if v_champion is not null then
    insert into public.tournament_placements (
      tournament_id, entity_type, player_id, placement, points_awarded
    ) values (
      p_tournament_id, 'player', v_champion, 1,
      v_champion_pts + v_runner_pts + v_sf_pts + v_qf_pts + v_group_pts
    );
    v_refresh_ids := array_append(v_refresh_ids, v_champion);
  end if;

  if v_runner is not null then
    insert into public.tournament_placements (
      tournament_id, entity_type, player_id, placement, points_awarded
    ) values (
      p_tournament_id, 'player', v_runner, 2,
      v_runner_pts + v_sf_pts + v_qf_pts + v_group_pts
    );
    v_refresh_ids := array_append(v_refresh_ids, v_runner);
  end if;

  for v_sf in
    select *
    from public.tournament_fixtures
    where tournament_id = p_tournament_id
      and stage = 'semifinal'
      and status = 'completed'
      and winner_id is not null
  loop
    if v_sf.player1_id is not null and v_sf.player1_id <> v_sf.winner_id then
      insert into public.tournament_placements (
        tournament_id, entity_type, player_id, placement, points_awarded
      ) values (
        p_tournament_id, 'player', v_sf.player1_id, 4,
        v_sf_pts + v_qf_pts + v_group_pts
      );
      v_refresh_ids := array_append(v_refresh_ids, v_sf.player1_id);
    end if;
    if v_sf.player2_id is not null and v_sf.player2_id <> v_sf.winner_id then
      insert into public.tournament_placements (
        tournament_id, entity_type, player_id, placement, points_awarded
      ) values (
        p_tournament_id, 'player', v_sf.player2_id, 4,
        v_sf_pts + v_qf_pts + v_group_pts
      );
      v_refresh_ids := array_append(v_refresh_ids, v_sf.player2_id);
    end if;
  end loop;

  for v_qf in
    select *
    from public.tournament_fixtures
    where tournament_id = p_tournament_id
      and stage = 'quarterfinal'
      and status = 'completed'
      and winner_id is not null
  loop
    if v_qf.player1_id is not null and v_qf.player1_id <> v_qf.winner_id then
      insert into public.tournament_placements (
        tournament_id, entity_type, player_id, placement, points_awarded
      ) values (
        p_tournament_id, 'player', v_qf.player1_id, 5,
        v_qf_pts + v_group_pts
      );
      v_refresh_ids := array_append(v_refresh_ids, v_qf.player1_id);
    end if;
    if v_qf.player2_id is not null and v_qf.player2_id <> v_qf.winner_id then
      insert into public.tournament_placements (
        tournament_id, entity_type, player_id, placement, points_awarded
      ) values (
        p_tournament_id, 'player', v_qf.player2_id, 5,
        v_qf_pts + v_group_pts
      );
      v_refresh_ids := array_append(v_refresh_ids, v_qf.player2_id);
    end if;
  end loop;

  for v_member in
    select distinct m.player_id
    from public.tournament_group_members m
    join public.tournament_groups g on g.id = m.group_id
    where g.tournament_id = p_tournament_id
      and not exists (
        select 1 from public.tournament_placements tp
        where tp.tournament_id = p_tournament_id
          and tp.player_id = m.player_id
      )
  loop
    insert into public.tournament_placements (
      tournament_id, entity_type, player_id, placement, points_awarded
    ) values (
      p_tournament_id, 'player', v_member.player_id, 6, v_group_pts
    );
    v_refresh_ids := array_append(v_refresh_ids, v_member.player_id);
  end loop;

  update public.tournaments
  set
    status = 'completed',
    completed_at = coalesce(completed_at, timezone('utc', now())),
    updated_at = timezone('utc', now())
  where id = p_tournament_id
    and status <> 'completed';

  for v_refresh in
    select distinct x from unnest(v_refresh_ids) as x where x is not null
  loop
    perform public.dgl_refresh_player_points_summary(v_refresh);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Admin: set fixture live / scheduled
-- ---------------------------------------------------------------------------

create or replace function public.dgl_set_fixture_status(
  p_fixture_id uuid,
  p_status public.dgl_fixture_status
)
returns public.tournament_fixtures
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.tournament_fixtures;
begin
  if not public.is_dgl_admin() then
    raise exception 'Only DGL admins can update fixture status';
  end if;

  -- Compare as text so this migration can reference the newly-added enum
  -- label in the same transaction (PostgreSQL enum ADD VALUE rule).
  if p_status::text not in ('scheduled', 'live') then
    raise exception 'Use dgl_record_fixture_result to complete a match';
  end if;

  update public.tournament_fixtures
  set status = p_status
  where id = p_fixture_id
  returning * into v_row;

  if not found then
    raise exception 'Fixture % not found', p_fixture_id;
  end if;

  return v_row;
end;
$$;

revoke all on function public.dgl_set_fixture_status(uuid, public.dgl_fixture_status) from public;
grant execute on function public.dgl_set_fixture_status(uuid, public.dgl_fixture_status) to authenticated;

-- ---------------------------------------------------------------------------
-- 9. Admin: record match result → advance bracket → standings/points
-- ---------------------------------------------------------------------------

create or replace function public.dgl_record_fixture_result(
  p_fixture_id uuid,
  p_winner_id uuid,
  p_player1_score integer default null,
  p_player2_score integer default null
)
returns public.tournament_fixtures
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.tournament_fixtures;
begin
  if not public.is_dgl_admin() then
    raise exception 'Only DGL admins can record match results';
  end if;

  select * into v_row from public.tournament_fixtures where id = p_fixture_id for update;
  if not found then
    raise exception 'Fixture % not found', p_fixture_id;
  end if;

  if v_row.player1_id is null or v_row.player2_id is null then
    raise exception 'Both players must be assigned before recording a result';
  end if;

  if p_winner_id is distinct from v_row.player1_id
     and p_winner_id is distinct from v_row.player2_id then
    raise exception 'Winner must be one of the fixture players';
  end if;

  update public.tournament_fixtures
  set
    winner_id = p_winner_id,
    player1_score = p_player1_score,
    player2_score = p_player2_score,
    status = 'completed',
    completed_at = timezone('utc', now())
  where id = p_fixture_id
  returning * into v_row;

  if v_row.stage = 'group' then
    perform public.dgl_fill_knockout_from_groups(v_row.tournament_id);
  else
    perform public.dgl_advance_knockout_winner(v_row.id);
  end if;

  if v_row.stage = 'final' then
    perform public.dgl_publish_standings_from_final(v_row.tournament_id);
  end if;

  return v_row;
end;
$$;

revoke all on function public.dgl_record_fixture_result(uuid, uuid, integer, integer) from public;
grant execute on function public.dgl_record_fixture_result(uuid, uuid, integer, integer) to authenticated;

-- Admin schedule helper (optional)
create or replace function public.dgl_set_fixture_schedule(
  p_fixture_id uuid,
  p_scheduled_at timestamptz
)
returns public.tournament_fixtures
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.tournament_fixtures;
begin
  if not public.is_dgl_admin() then
    raise exception 'Only DGL admins can schedule fixtures';
  end if;

  update public.tournament_fixtures
  set scheduled_at = p_scheduled_at
  where id = p_fixture_id
  returning * into v_row;

  if not found then
    raise exception 'Fixture % not found', p_fixture_id;
  end if;

  return v_row;
end;
$$;

revoke all on function public.dgl_set_fixture_schedule(uuid, timestamptz) from public;
grant execute on function public.dgl_set_fixture_schedule(uuid, timestamptz) to authenticated;

commit;
