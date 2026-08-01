-- DGL FC 26 Championship #2 — official completion and results.
--
-- Completed: 1 August 2026. First tournament run under the new cumulative
-- DGL Points progression standard (20260801100000): a player's total is the
-- sum of every stage they reached, not just their final placement —
--   Group Stage (+50) -> Quarterfinal (+50) -> Semifinal (+100)
--   -> Runner-Up (+150) or Champion (+200)
-- so e.g. the champion's total is 50+50+100+200 = 400 (group, QF, SF, then
-- champion — not also runner-up, since they won the final rather than lost
-- it), and the runner-up's is 50+50+100+150 = 350.
--
-- Recorded as one tournament_placements row per player, points_awarded set
-- to that cumulative total directly — same pattern as every prior results
-- migration (CS2 #1, FC 26 #1): the ledger trigger
-- (dgl_sync_points_for_player_placement) always uses the explicit
-- points_awarded value, so this correctly increments each player's existing
-- total rather than overwriting it.
--
-- placement numbers: 1 = champion, 2 = runner-up (the only two the
-- champion/runner-up views read); 4/5/6 = semifinalist/quarterfinalist/
-- group-stage, used here purely for record-keeping — deliberately not 3,
-- which v_tournament_results reads as "third place" (not a real stage in
-- this bracket).
--
-- "AK_4642" (the champion, as given) and the existing player "ak4642" (FC26
-- Championship #1's champion) are the same person — confirmed with the
-- site owner — so this migration targets the existing "ak4642" row rather
-- than creating a duplicate, giving them a combined total of 150 + 400 = 550.

begin;

-- ---------------------------------------------------------------------------
-- 1. Ensure a players row exists for every participant not already known.
-- ---------------------------------------------------------------------------

insert into public.players (display_name)
values
  ('VALUS_VX'),
  ('suriya_sr12'),
  ('danish01769'),
  ('Pranav'),
  ('Mokey D Luffy'),
  ('viddy1485'),
  ('Noisyboy96'),
  ('SamF'),
  ('iambalas'),
  ('K2k'),
  ('Palnikumar'),
  ('naveen kumar'),
  ('Shinigami Ishigami'),
  ('Sabaresh9801'),
  ('RamRoyce'),
  ('Niwas Khan'),
  ('ak4642')
on conflict (display_name_key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Complete the tournament
-- ---------------------------------------------------------------------------

update public.tournaments
set status = 'completed',
    completed_at = timestamptz '2026-08-01 12:00:00+00',
    completed_date_label = 'August 1, 2026'
where external_id = 'dgl-fc26-championship-2';

-- ---------------------------------------------------------------------------
-- 3. Participants — everyone who actually played, linked back to a
--    registration when one exists. Registrations themselves untouched.
-- ---------------------------------------------------------------------------

insert into public.tournament_participants (tournament_id, player_id, registration_id, status)
select t.id, p.id, tr.id, 'active'
from public.tournaments t
cross join (values
  ('ak4642'), ('VALUS_VX'),
  ('suriya_sr12'), ('danish01769'),
  ('Pranav'), ('Mokey D Luffy'), ('viddy1485'), ('Noisyboy96'),
  ('SamF'), ('iambalas'), ('K2k'), ('Palnikumar'), ('naveen kumar'),
  ('Shinigami Ishigami'), ('Sabaresh9801'), ('RamRoyce'), ('Niwas Khan')
) as roster(display_name)
join public.players p on p.display_name_key = lower(btrim(roster.display_name))
left join public.tournament_registrations tr
  on tr.tournament_id = t.id and tr.player_id = p.id
where t.external_id = 'dgl-fc26-championship-2'
on conflict (tournament_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Results — cumulative points per stage reached.
-- ---------------------------------------------------------------------------

-- Champion (+400: group 50 + QF 50 + SF 100 + champion 200)
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 1, 'player', p.id, 400
from public.tournaments t
join public.players p on p.display_name_key = lower(btrim('ak4642'))
where t.external_id = 'dgl-fc26-championship-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 1 and tp.player_id = p.id
  );

-- Runner-up (+350: group 50 + QF 50 + SF 100 + runner-up 150)
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 2, 'player', p.id, 350
from public.tournaments t
join public.players p on p.display_name_key = lower(btrim('VALUS_VX'))
where t.external_id = 'dgl-fc26-championship-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 2 and tp.player_id = p.id
  );

-- Semifinalists (+200: group 50 + QF 50 + SF 100)
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 4, 'player', p.id, 200
from public.tournaments t
cross join (values ('suriya_sr12'), ('danish01769')) as semis(display_name)
join public.players p on p.display_name_key = lower(btrim(semis.display_name))
where t.external_id = 'dgl-fc26-championship-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 4 and tp.player_id = p.id
  );

-- Quarterfinalists (+100: group 50 + QF 50)
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 5, 'player', p.id, 100
from public.tournaments t
cross join (values
  ('Pranav'), ('Mokey D Luffy'), ('viddy1485'), ('Noisyboy96')
) as quarters(display_name)
join public.players p on p.display_name_key = lower(btrim(quarters.display_name))
where t.external_id = 'dgl-fc26-championship-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 5 and tp.player_id = p.id
  );

-- Group Stage Participants (+50)
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 6, 'player', p.id, 50
from public.tournaments t
cross join (values
  ('SamF'), ('iambalas'), ('K2k'), ('Palnikumar'), ('naveen kumar'),
  ('Shinigami Ishigami'), ('Sabaresh9801'), ('RamRoyce'), ('Niwas Khan')
) as groupstage(display_name)
join public.players p on p.display_name_key = lower(btrim(groupstage.display_name))
where t.external_id = 'dgl-fc26-championship-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 6 and tp.player_id = p.id
  );

-- ---------------------------------------------------------------------------
-- 5. Community activity entry (mirrors every prior completion pattern)
-- ---------------------------------------------------------------------------

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
  '🏆 DGL FC 26 Championship #2 completed',
  'August 1, 2026',
  t.id,
  jsonb_build_object('global_number', 4, 'slug', 'fc26-2'),
  timezone('utc', timestamptz '2026-08-01 12:00:00+00')
from public.tournaments t
where t.external_id = 'dgl-fc26-championship-2'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_completed'
  );

commit;
