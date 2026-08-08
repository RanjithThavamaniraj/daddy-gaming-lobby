-- DGL Rocket League Championship #1 — official completion from the ACTUAL
-- event that was played (6 teams / 12 players / 5 single-elim matches).
--
-- Do NOT use the originally planned 8-team / 16-player bracket.
--
-- Name aliases (as recorded in-game / chat → existing players rows):
--   rhenummoob  → rheniumnoob
--   Momo_01     → Momo_07
--   gui_letitan → gui_le_titan
--   piyushgehlot → piyushgehlot_
-- New players created only when no row exists: shady, Shadow.
--
-- Non-participants who registered (kept in tournament_registrations only):
--   mohan_997, mammu_fm
--
-- Data model (same pattern as CS2 #1 / FC 26 #2 results migrations):
--   tournaments               → status completed
--   tournament_registrations  → UNTOUCHED (audit history)
--   tournament_participants   → the 12 who actually played
--   tournament_teams          → 6 doubles teams
--   tournament_team_members   → 2 players per team
--   tournament_fixtures       → 5 completed knockout matches
--                              (player1_id/player2_id = team primary for FK;
--                               hub UI resolves full "A + B" labels via teams)
--   tournament_placements     → per-player results + DGL points
--   community_activity        → tournament_completed
--
-- DGL Points — progression standard (20260801100000), stages actually reached
-- (no group stage in this event, so no +50 group):
--   Champion (SF + Champion):           100 + 200 = 300
--   Runner-up (QF + SF + Runner-up):     50 + 100 + 150 = 300
--   Semi loser who played QF (QF + SF):  50 + 100 = 150
--   Semi loser with SF bye (SF only):    100
--   Quarterfinal loser (QF only):        50
--
-- dgl_publish_standings_from_final is NOT called: it awards a single
-- player_id per fixture slot and always adds group-stage points.

begin;

-- ---------------------------------------------------------------------------
-- 1. Ensure player rows for every actual participant
-- ---------------------------------------------------------------------------

insert into public.players (display_name)
values
  ('RazensWorth'),
  ('Zerodarkthirty'),
  ('.pixeloton'),
  ('Momo_07'),
  ('rheniumnoob'),
  ('shady'),
  ('Shadow'),
  ('frez69'),
  ('Valtryek'),
  ('gui_le_titan'),
  ('piyushgehlot_'),
  ('chillax.exe')
on conflict (display_name_key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Complete the tournament metadata
-- ---------------------------------------------------------------------------

update public.tournaments
set status = 'completed',
    completed_at = timestamptz '2026-08-08 15:00:00+00',
    completed_date_label = 'August 8, 2026',
    is_featured = false,
    metadata = metadata || jsonb_build_object(
      'team_limit', 6,
      'actual_teams', 6,
      'actual_matches', 5
    ),
    updated_at = timezone('utc', now())
where external_id = 'dgl-rocket-league-championship-1'
  and slug = 'rocket-league-1';

-- ---------------------------------------------------------------------------
-- 3. Participants — only the 12 who actually played
-- ---------------------------------------------------------------------------

insert into public.tournament_participants (tournament_id, player_id, registration_id, status)
select t.id, p.id, tr.id, 'active'
from public.tournaments t
cross join (values
  ('RazensWorth'),
  ('Zerodarkthirty'),
  ('.pixeloton'),
  ('Momo_07'),
  ('rheniumnoob'),
  ('shady'),
  ('Shadow'),
  ('frez69'),
  ('Valtryek'),
  ('gui_le_titan'),
  ('piyushgehlot_'),
  ('chillax.exe')
) as roster(display_name)
join public.players p on p.display_name_key = lower(btrim(roster.display_name))
left join public.tournament_registrations tr
  on tr.tournament_id = t.id and tr.player_id = p.id
where t.external_id = 'dgl-rocket-league-championship-1'
on conflict (tournament_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Teams (6 doubles) + members
-- ---------------------------------------------------------------------------

with t as (
  select id from public.tournaments
  where external_id = 'dgl-rocket-league-championship-1'
),
ins as (
  insert into public.tournament_teams (tournament_id, name, seed, metadata)
  select t.id, v.name, v.seed, jsonb_build_object('format', '2v2')
  from t
  cross join (values
    ('RazensWorth + Zerodarkthirty', 1),
    ('.pixeloton + Momo_07', 2),
    ('rheniumnoob + shady', 3),
    ('Shadow + frez69', 4),
    ('Valtryek + gui_le_titan', 5),
    ('piyushgehlot_ + chillax.exe', 6)
  ) as v(name, seed)
  on conflict (tournament_id, name) do update
    set seed = excluded.seed,
        updated_at = timezone('utc', now())
  returning id, name
)
insert into public.tournament_team_members (team_id, player_id, role)
select ins.id, p.id, 'member'
from ins
join lateral (
  select * from (values
    ('RazensWorth + Zerodarkthirty', 'RazensWorth'),
    ('RazensWorth + Zerodarkthirty', 'Zerodarkthirty'),
    ('.pixeloton + Momo_07', '.pixeloton'),
    ('.pixeloton + Momo_07', 'Momo_07'),
    ('rheniumnoob + shady', 'rheniumnoob'),
    ('rheniumnoob + shady', 'shady'),
    ('Shadow + frez69', 'Shadow'),
    ('Shadow + frez69', 'frez69'),
    ('Valtryek + gui_le_titan', 'Valtryek'),
    ('Valtryek + gui_le_titan', 'gui_le_titan'),
    ('piyushgehlot_ + chillax.exe', 'piyushgehlot_'),
    ('piyushgehlot_ + chillax.exe', 'chillax.exe')
  ) as m(team_name, player_name)
  where m.team_name = ins.name
) members on true
join public.players p on p.display_name_key = lower(btrim(members.player_name))
on conflict (team_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Knockout fixtures — actual 5 matches (idempotent by round_label)
-- ---------------------------------------------------------------------------

do $$
declare
  v_tid uuid;
  v_p1 uuid;
  v_p2 uuid;
  v_w uuid;
begin
  select id into v_tid
  from public.tournaments
  where external_id = 'dgl-rocket-league-championship-1';

  if v_tid is null then
    raise exception 'Rocket League Championship #1 tournament not found';
  end if;

  -- Skip if fixtures already seeded for this tournament
  if exists (
    select 1 from public.tournament_fixtures where tournament_id = v_tid
  ) then
    raise notice 'Fixtures already exist for rocket-league-1 — skipping fixture insert';
    return;
  end if;

  -- QF1: .pixeloton + Momo_07 vs RazensWorth + Zerodarkthirty
  -- Winner: RazensWorth + Zerodarkthirty
  select id into v_p1 from public.players where display_name_key = lower('.pixeloton');
  select id into v_p2 from public.players where display_name_key = lower('RazensWorth');
  select id into v_w from public.players where display_name_key = lower('RazensWorth');
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'quarterfinal', 'Quarterfinal 1', 1,
    v_p1, v_p2, v_w, 'completed', timestamptz '2026-08-08 13:45:00+00'
  );

  -- QF2: Valtryek + gui_le_titan vs piyushgehlot_ + chillax.exe
  -- Winner: piyushgehlot_ + chillax.exe
  select id into v_p1 from public.players where display_name_key = lower('Valtryek');
  select id into v_p2 from public.players where display_name_key = lower('piyushgehlot_');
  select id into v_w from public.players where display_name_key = lower('piyushgehlot_');
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'quarterfinal', 'Quarterfinal 2', 2,
    v_p1, v_p2, v_w, 'completed', timestamptz '2026-08-08 14:00:00+00'
  );

  -- SF1: rheniumnoob + shady vs RazensWorth + Zerodarkthirty
  -- Winner: rheniumnoob + shady
  select id into v_p1 from public.players where display_name_key = lower('rheniumnoob');
  select id into v_p2 from public.players where display_name_key = lower('RazensWorth');
  select id into v_w from public.players where display_name_key = lower('rheniumnoob');
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'semifinal', 'Semifinal 1', 1,
    v_p1, v_p2, v_w, 'completed', timestamptz '2026-08-08 14:20:00+00'
  );

  -- SF2: Shadow + frez69 vs piyushgehlot_ + chillax.exe
  -- Winner: piyushgehlot_ + chillax.exe
  select id into v_p1 from public.players where display_name_key = lower('Shadow');
  select id into v_p2 from public.players where display_name_key = lower('piyushgehlot_');
  select id into v_w from public.players where display_name_key = lower('piyushgehlot_');
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'semifinal', 'Semifinal 2', 2,
    v_p1, v_p2, v_w, 'completed', timestamptz '2026-08-08 14:35:00+00'
  );

  -- Grand Final: rheniumnoob + shady vs piyushgehlot_ + chillax.exe
  -- Winner / Champion: rheniumnoob + shady
  select id into v_p1 from public.players where display_name_key = lower('rheniumnoob');
  select id into v_p2 from public.players where display_name_key = lower('piyushgehlot_');
  select id into v_w from public.players where display_name_key = lower('rheniumnoob');
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'final', 'Grand Final', 1,
    v_p1, v_p2, v_w, 'completed', timestamptz '2026-08-08 15:00:00+00'
  );
end $$;

-- ---------------------------------------------------------------------------
-- 6. Placements + DGL Points (both members of each team)
-- ---------------------------------------------------------------------------

-- Champion: rheniumnoob + shady (300)
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 1, 'player', p.id, 300
from public.tournaments t
cross join (values ('rheniumnoob'), ('shady')) as champs(display_name)
join public.players p on p.display_name_key = lower(btrim(champs.display_name))
where t.external_id = 'dgl-rocket-league-championship-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 1 and tp.player_id = p.id
  );

-- Runner-up: piyushgehlot_ + chillax.exe (300)
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 2, 'player', p.id, 300
from public.tournaments t
cross join (values ('piyushgehlot_'), ('chillax.exe')) as runners(display_name)
join public.players p on p.display_name_key = lower(btrim(runners.display_name))
where t.external_id = 'dgl-rocket-league-championship-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 2 and tp.player_id = p.id
  );

-- Semifinalists (placement 4):
--   RazensWorth + Zerodarkthirty (played QF) → 150
--   Shadow + frez69 (SF bye) → 100
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 4, 'player', p.id, v.pts
from public.tournaments t
cross join (values
  ('RazensWorth', 150),
  ('Zerodarkthirty', 150),
  ('Shadow', 100),
  ('frez69', 100)
) as v(display_name, pts)
join public.players p on p.display_name_key = lower(btrim(v.display_name))
where t.external_id = 'dgl-rocket-league-championship-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 4 and tp.player_id = p.id
  );

-- Quarterfinalists (placement 5): .pixeloton + Momo_07, Valtryek + gui_le_titan → 50
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 5, 'player', p.id, 50
from public.tournaments t
cross join (values
  ('.pixeloton'), ('Momo_07'),
  ('Valtryek'), ('gui_le_titan')
) as qf(display_name)
join public.players p on p.display_name_key = lower(btrim(qf.display_name))
where t.external_id = 'dgl-rocket-league-championship-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 5 and tp.player_id = p.id
  );

-- ---------------------------------------------------------------------------
-- 7. Community activity
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
  '🏆 DGL Rocket League Championship #1 completed',
  'August 8, 2026 — Champions: rheniumnoob + shady',
  t.id,
  jsonb_build_object(
    'global_number', t.global_number,
    'slug', t.slug,
    'champion', 'rheniumnoob + shady',
    'runner_up', 'piyushgehlot_ + chillax.exe'
  ),
  timezone('utc', timestamptz '2026-08-08 15:00:00+00')
from public.tournaments t
where t.external_id = 'dgl-rocket-league-championship-1'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_completed'
  );

commit;
