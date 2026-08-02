-- Fixes the Tournament Results page understating DGL Points for Semi
-- Finalists and Quarter Finalists (found in the pre-commit release audit
-- for 20260803100000).
--
-- Root cause: v_tournament_results only aggregated champion_points /
-- runner_up_points (placements 1/2). mapEnrichedTournamentRow and
-- mapTournamentResultsRow had no real value to read for placements 4/5/6,
-- so they silently fell back to the generic DGL_POINTS constants
-- (100/50/50) instead of a tournament's actual cumulative award
-- (200/100/50 for FC 26 Championship #2) — display-only, the leaderboard
-- itself was always correct since it reads player_points_ledger directly,
-- not this view.
--
-- Columns appended at the very end, after event_type — "create or replace
-- view" only allows appending, not repositioning existing columns.

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
  ) as group_stage_players,
  te.event_type,
  (
    select max(tp.points_awarded)
    from public.tournament_placements tp
    where tp.tournament_id = te.id
      and tp.placement = 4
      and tp.entity_type = 'player'
  ) as semi_finalist_points,
  (
    select max(tp.points_awarded)
    from public.tournament_placements tp
    where tp.tournament_id = te.id
      and tp.placement = 5
      and tp.entity_type = 'player'
  ) as quarter_finalist_points,
  (
    select max(tp.points_awarded)
    from public.tournament_placements tp
    where tp.tournament_id = te.id
      and tp.placement = 6
      and tp.entity_type = 'player'
  ) as group_stage_points
from public.v_tournaments_enriched te;
