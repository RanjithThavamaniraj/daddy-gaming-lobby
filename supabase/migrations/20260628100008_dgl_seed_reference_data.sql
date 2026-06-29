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
