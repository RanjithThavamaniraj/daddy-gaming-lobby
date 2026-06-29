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
