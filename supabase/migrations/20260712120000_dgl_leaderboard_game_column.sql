-- Leaderboard "Game" column.
--
-- v_player_leaderboard carried no game information, so the UI rendered "—"
-- for every player. Derive each player's game from the tournament that
-- awarded their points (Tournament → Game → Placements → Ledger → Player):
-- the most recently awarding tournament's game wins if a player has earned
-- points in more than one game. Columns are appended, which
-- "create or replace view" allows.

begin;

create or replace view public.v_player_leaderboard
with (security_invoker = true) as
select
  row_number() over (
    order by s.total_points desc, s.championships desc, p.display_name asc
  )::integer as rank,
  p.id as player_id,
  p.display_name,
  s.total_points as points,
  s.championships,
  s.runner_up_finishes,
  s.third_place_finishes,
  s.tournaments_played,
  s.last_awarded_at,
  lg.game_name,
  lg.game_slug,
  lg.game_accent
from public.player_points_summary s
join public.players p on p.id = s.player_id
left join lateral (
  select
    g.name as game_name,
    g.slug as game_slug,
    g.accent_color as game_accent
  from public.player_points_ledger l
  join public.tournaments t on t.id = l.tournament_id
  join public.games g on g.id = t.game_id
  where l.player_id = p.id
    and l.points_delta > 0
  order by l.awarded_at desc
  limit 1
) lg on true
where s.total_points > 0 or s.tournaments_played > 0;

commit;
