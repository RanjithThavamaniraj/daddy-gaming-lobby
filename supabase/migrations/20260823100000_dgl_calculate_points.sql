-- Centralize cumulative DGL Points in one SQL helper and fix
-- dgl_publish_standings_from_final, which previously added champion AND
-- runner-up stage points (and always added group-stage points).
--
-- Stage increments remain on dgl_points_rules (200/150/100/50/50).
-- dgl_calculate_points is the only cumulative formula.
-- Historical tournament_placements are NOT rewritten.

begin;

create or replace function public.dgl_calculate_points(
  p_reached_group_stage boolean default false,
  p_reached_quarterfinal boolean default false,
  p_reached_semifinal boolean default false,
  p_reached_final boolean default false,
  p_won_final boolean default false
)
returns integer
language plpgsql
stable
set search_path = public
as $$
declare
  v_rules public.dgl_points_rules%rowtype;
  v_total integer := 0;
begin
  select *
    into v_rules
  from public.dgl_points_rules
  where is_active = true
  order by effective_from desc
  limit 1;

  if p_reached_group_stage then
    v_total := v_total + coalesce(v_rules.group_stage_points, 50);
  end if;
  if p_reached_quarterfinal then
    v_total := v_total + coalesce(v_rules.quarterfinal_points, 50);
  end if;
  if p_reached_semifinal then
    v_total := v_total + coalesce(v_rules.semifinal_points, 100);
  end if;
  if p_won_final then
    v_total := v_total + coalesce(v_rules.champion_points, 200);
  elsif p_reached_final then
    v_total := v_total + coalesce(v_rules.runner_up_points, 150);
  end if;

  return v_total;
end;
$$;

comment on function public.dgl_calculate_points(boolean, boolean, boolean, boolean, boolean) is
  'Cumulative DGL Points for stages actually reached. Champion and runner-up are mutually exclusive.';

revoke all on function public.dgl_calculate_points(boolean, boolean, boolean, boolean, boolean) from public;
grant execute on function public.dgl_calculate_points(boolean, boolean, boolean, boolean, boolean) to anon, authenticated;

create or replace function public.dgl_publish_standings_from_final(p_tournament_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_final public.tournament_fixtures%rowtype;
  v_champion uuid;
  v_runner uuid;
  v_sf record;
  v_qf record;
  v_member record;
  v_refresh uuid;
  v_has_group boolean;
  v_has_qf boolean;
  v_has_sf boolean;
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

  v_has_group := exists (
    select 1 from public.tournament_groups g where g.tournament_id = p_tournament_id
  );
  v_has_qf := exists (
    select 1 from public.tournament_fixtures f
    where f.tournament_id = p_tournament_id and f.stage = 'quarterfinal'
  );
  v_has_sf := exists (
    select 1 from public.tournament_fixtures f
    where f.tournament_id = p_tournament_id and f.stage = 'semifinal'
  );

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
      public.dgl_calculate_points(v_has_group, v_has_qf, v_has_sf, true, true)
    );
    v_refresh_ids := array_append(v_refresh_ids, v_champion);
  end if;

  if v_runner is not null then
    insert into public.tournament_placements (
      tournament_id, entity_type, player_id, placement, points_awarded
    ) values (
      p_tournament_id, 'player', v_runner, 2,
      public.dgl_calculate_points(v_has_group, v_has_qf, v_has_sf, true, false)
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
        public.dgl_calculate_points(v_has_group, v_has_qf, true, false, false)
      );
      v_refresh_ids := array_append(v_refresh_ids, v_sf.player1_id);
    end if;
    if v_sf.player2_id is not null and v_sf.player2_id <> v_sf.winner_id then
      insert into public.tournament_placements (
        tournament_id, entity_type, player_id, placement, points_awarded
      ) values (
        p_tournament_id, 'player', v_sf.player2_id, 4,
        public.dgl_calculate_points(v_has_group, v_has_qf, true, false, false)
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
        public.dgl_calculate_points(v_has_group, true, false, false, false)
      );
      v_refresh_ids := array_append(v_refresh_ids, v_qf.player1_id);
    end if;
    if v_qf.player2_id is not null and v_qf.player2_id <> v_qf.winner_id then
      insert into public.tournament_placements (
        tournament_id, entity_type, player_id, placement, points_awarded
      ) values (
        p_tournament_id, 'player', v_qf.player2_id, 5,
        public.dgl_calculate_points(v_has_group, true, false, false, false)
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
      p_tournament_id, 'player', v_member.player_id, 6,
      public.dgl_calculate_points(true, false, false, false, false)
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

commit;
