-- Marvel Rivals Saturday Showdown #2 identity correction:
-- runner-up "noisyboy" is the existing player noisyboy96.
--
-- Why a follow-up migration (not an edit of 20260904100000): that version
-- is already applied remotely. Changing its checksum would break db push.
--
-- Why placements alone are not enough:
--   dgl_sync_points_for_player_placement (20260628100004) on UPDATE, when a
--   ledger row already exists for placement_id, only refreshes the NEW
--   player summary and does NOT rewrite ledger.player_id. Inserting a new
--   placement would fire the trigger and duplicate the 150-point award.
--   Therefore this remaps the EXISTING participant, team-member, placement,
--   and ledger rows (same placement_id, same points_delta = 150).
--
-- Scope: Marvel Rivals #2 noisyboy → noisyboy96 only.
-- Does NOT touch SH4D0W / Shadow, spryzen.xxx, dorathedestroyer3036,
-- or any other player's points.
-- Idempotent: no-ops once the Marvel runner-up row already belongs to
-- noisyboy96.

begin;

-- 1. Participant roster
update public.tournament_participants as tp
set player_id = n96.id
from public.tournaments t,
     public.players wrong,
     public.players n96
where t.external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and tp.tournament_id = t.id
  and wrong.display_name_key = 'noisyboy'
  and n96.display_name_key = 'noisyboy96'
  and tp.player_id = wrong.id
  and not exists (
    select 1
    from public.tournament_participants x
    where x.tournament_id = t.id
      and x.player_id = n96.id
  );

-- 2. Opponent Team membership
update public.tournament_team_members as tm
set player_id = n96.id
from public.tournament_teams tt,
     public.tournaments t,
     public.players wrong,
     public.players n96
where t.external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and tt.tournament_id = t.id
  and tm.team_id = tt.id
  and wrong.display_name_key = 'noisyboy'
  and n96.display_name_key = 'noisyboy96'
  and tm.player_id = wrong.id
  and not exists (
    select 1
    from public.tournament_team_members x
    where x.team_id = tt.id
      and x.player_id = n96.id
  );

-- 3. Ledger first — same row, same placement_id, same 150. No insert.
update public.player_points_ledger as l
set player_id = n96.id
from public.tournaments t,
     public.players wrong,
     public.players n96
where t.external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and l.tournament_id = t.id
  and wrong.display_name_key = 'noisyboy'
  and n96.display_name_key = 'noisyboy96'
  and l.player_id = wrong.id
  and l.points_delta = 150
  and l.reason = 'runner_up'::public.dgl_points_reason
  and not exists (
    select 1
    from public.player_points_ledger x
    where x.tournament_id = t.id
      and x.player_id = n96.id
  );

-- 4. Placement (trigger sees existing ledger for placement_id → no new award)
update public.tournament_placements as tp
set player_id = n96.id
from public.tournaments t,
     public.players wrong,
     public.players n96
where t.external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and tp.tournament_id = t.id
  and wrong.display_name_key = 'noisyboy'
  and n96.display_name_key = 'noisyboy96'
  and tp.player_id = wrong.id
  and tp.placement = 2
  and tp.entity_type = 'player'
  and not exists (
    select 1
    from public.tournament_placements x
    where x.tournament_id = t.id
      and x.player_id = n96.id
      and x.placement = 2
  );

-- 5. Activity payload name only (same tournament_completed row).
update public.community_activity as ca
set payload = jsonb_set(
  ca.payload,
  '{runner_up}',
  to_jsonb(
    replace(ca.payload->>'runner_up', 'noisyboy', 'noisyboy96')
  )
)
from public.tournaments t
where t.external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and ca.tournament_id = t.id
  and ca.activity_type = 'tournament_completed'
  and coalesce(ca.payload->>'runner_up', '') like '%noisyboy%'
  and coalesce(ca.payload->>'runner_up', '') not like '%noisyboy96%';

-- 6. Refresh summaries from ledger + placements
select public.dgl_refresh_player_points_summary(p.id)
from public.players p
where p.display_name_key in ('noisyboy', 'noisyboy96');

-- 7. Drop the stray noisyboy identity only if nothing else remains.
delete from public.players p
where p.display_name_key = 'noisyboy'
  and not exists (
    select 1 from public.tournament_placements tp where tp.player_id = p.id
  )
  and not exists (
    select 1 from public.player_points_ledger l where l.player_id = p.id
  )
  and not exists (
    select 1 from public.tournament_participants tp where tp.player_id = p.id
  )
  and not exists (
    select 1 from public.tournament_team_members tm where tm.player_id = p.id
  )
  and not exists (
    select 1 from public.tournament_registrations tr where tr.player_id = p.id
  )
  and not exists (
    select 1 from public.tournament_fixtures f
    where f.player1_id = p.id or f.player2_id = p.id or f.winner_id = p.id
  );

-- 8. Sanity checks
do $$
declare
  v_tid uuid;
  v_champs integer;
  v_champ_pts integer;
  v_runners integer;
  v_runner_pts integer;
  v_ledger integer;
  v_marvel_n96 integer;
  v_n96_marvel_pts integer;
  v_stray integer;
  v_n96_total integer;
begin
  select id into v_tid
  from public.tournaments
  where external_id = 'dgl-marvel-rivals-saturday-showdown-2';

  if v_tid is null then
    raise exception 'Marvel Rivals Saturday Showdown #2 tournament not found';
  end if;

  select count(*), max(tp.points_awarded)
    into v_champs, v_champ_pts
  from public.tournament_placements tp
  where tp.tournament_id = v_tid
    and tp.placement = 1
    and tp.entity_type = 'player';

  if v_champs <> 6 or v_champ_pts is distinct from 200 then
    raise exception 'Expected 6 champions at 200, found % at %', v_champs, v_champ_pts;
  end if;

  select count(*), max(tp.points_awarded)
    into v_runners, v_runner_pts
  from public.tournament_placements tp
  where tp.tournament_id = v_tid
    and tp.placement = 2
    and tp.entity_type = 'player';

  if v_runners <> 6 or v_runner_pts is distinct from 150 then
    raise exception 'Expected 6 runners-up at 150, found % at %', v_runners, v_runner_pts;
  end if;

  select count(*) into v_ledger
  from public.player_points_ledger
  where tournament_id = v_tid;

  if v_ledger <> 12 then
    raise exception 'Expected 12 Marvel Rivals #2 ledger rows, found %', v_ledger;
  end if;

  if exists (
    select 1
    from public.player_points_ledger
    where tournament_id = v_tid
    group by player_id
    having count(*) > 1
  ) then
    raise exception 'Duplicate Marvel Rivals #2 ledger awards';
  end if;

  select count(*), max(l.points_delta)
    into v_marvel_n96, v_n96_marvel_pts
  from public.player_points_ledger l
  join public.players p on p.id = l.player_id
  where l.tournament_id = v_tid
    and p.display_name_key = 'noisyboy96';

  if v_marvel_n96 <> 1 or v_n96_marvel_pts is distinct from 150 then
    raise exception 'noisyboy96 should have exactly one 150-point Marvel #2 ledger row, found % at %',
      v_marvel_n96, v_n96_marvel_pts;
  end if;

  select count(*) into v_stray
  from public.players p
  where p.display_name_key = 'noisyboy';

  if v_stray <> 0 then
    raise exception 'Stray noisyboy player identity still present';
  end if;

  if exists (
    select 1
    from public.tournament_placements tp
    join public.players p on p.id = tp.player_id
    where tp.tournament_id = v_tid
      and p.display_name_key = 'noisyboy'
  ) then
    raise exception 'Marvel Rivals #2 placement still on noisyboy';
  end if;

  select s.total_points into v_n96_total
  from public.player_points_summary s
  join public.players p on p.id = s.player_id
  where p.display_name_key = 'noisyboy96';

  -- Prior total 250 (FC26 #1 champion 150 + FC26 #2 QF 100) + Marvel runner-up 150.
  if v_n96_total is distinct from 400 then
    raise exception 'noisyboy96 total expected 400 after remap, found %', v_n96_total;
  end if;
end $$;

commit;
