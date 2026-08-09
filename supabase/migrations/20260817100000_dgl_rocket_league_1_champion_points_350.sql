-- Correct DGL Rocket League Championship #1 champion points: 300 → 350.
--
-- Product rule: a bye does not remove stage points. Champions are credited
-- QF + SF + Champion (50 + 100 + 200 = 350). Runner-up stays 300
-- (QF + SF + Runner-up = 50 + 100 + 150).
--
-- Why placements alone are not enough:
--   dgl_sync_points_for_player_placement (20260628100004) on UPDATE, when a
--   ledger row already exists for placement_id, only calls
--   dgl_refresh_player_points_summary and does NOT rewrite points_delta.
--   Summary totals come from sum(player_points_ledger.points_delta).
--   Therefore this migration updates placements AND matching ledger rows,
--   then refreshes summaries for the two champions only.
--
-- Scope: Rocket League #1 champions only. No other tournaments / players.
-- Idempotent: skips rows already at 350.

begin;

-- 1. Placement rows (authoritative award)
update public.tournament_placements as tp
set points_awarded = 350
where tp.placement = 1
  and tp.entity_type = 'player'
  and tp.points_awarded is distinct from 350
  and tp.tournament_id = (
    select t.id
    from public.tournaments t
    where t.external_id = 'dgl-rocket-league-championship-1'
  )
  and tp.player_id in (
    select p.id
    from public.players p
    where p.display_name_key in ('rheniumnoob', 'shady')
  );

-- 2. Ledger deltas (source of v_player_leaderboard totals)
update public.player_points_ledger as l
set points_delta = 350
where l.points_delta is distinct from 350
  and l.placement_id in (
    select tp.id
    from public.tournament_placements tp
    join public.tournaments t on t.id = tp.tournament_id
    join public.players p on p.id = tp.player_id
    where t.external_id = 'dgl-rocket-league-championship-1'
      and tp.placement = 1
      and tp.entity_type = 'player'
      and p.display_name_key in ('rheniumnoob', 'shady')
  );

-- 3. Refresh summaries from ledger + placements
select public.dgl_refresh_player_points_summary(p.id)
from public.players p
where p.display_name_key in ('rheniumnoob', 'shady');

commit;
