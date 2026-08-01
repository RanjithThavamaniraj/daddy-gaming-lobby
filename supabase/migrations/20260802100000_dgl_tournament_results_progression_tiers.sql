-- Extends v_tournament_results with the semi-finalist / quarter-finalist /
-- group-stage (participants) rosters, matching the placement numbers used
-- by 20260801120000_dgl_fc26_championship_2_results.sql (4 = semifinalist,
-- 5 = quarterfinalist, 6 = group stage — deliberately not 3, which stays
-- reserved for an actual third-place decider match).
--
-- Needed so the tournament results page can render the full DGL Points
-- progression breakdown (Champion / Runner-Up / Semi Finalists / Quarter
-- Finalists / Participants) from the same data builder that already powers
-- the Leaderboard and Hall of Titans, instead of only champion/runner-up.
-- Columns are appended, which "create or replace view" allows without
-- disturbing any existing consumer of this view.

create or replace view public.v_tournament_results
with (security_invoker = true) as
select
  te.id as tournament_id,
  te.slug,
  te.championship_name,
  te.tournament_number,
  te.game_slug,
  te.game_name,
  te.format,
  te.match_type,
  te.status,
  te.completed_date_label,
  te.prize_pool_display,
  te.accent_color,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 1
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as champion_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 2
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as runner_up_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 3
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as third_place_players,
  (
    select max(tp.points_awarded)
    from public.tournament_placements tp
    where tp.tournament_id = te.id
      and tp.placement = 1
      and tp.entity_type = 'player'
  ) as champion_points,
  (
    select max(tp.points_awarded)
    from public.tournament_placements tp
    where tp.tournament_id = te.id
      and tp.placement = 2
      and tp.entity_type = 'player'
  ) as runner_up_points,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 4
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as semi_finalist_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 5
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as quarter_finalist_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 6
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as group_stage_players
from public.v_tournaments_enriched te;
