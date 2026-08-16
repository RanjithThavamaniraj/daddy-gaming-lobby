-- DGL VALORANT SHOWDOWN (Saturday Showdown #1) — 15 August 2026
-- Actual results. 16-team / 32-slot format; 30 players actually played.
--
-- ASH + HOP (E33) did not play Round 1 Match 2. They are NOT participants.
-- yato + mike_ advanced. Match stored completed with no scores and a
-- placeholder on the E33 side (not a invented score).
--
-- Replaced original names (SUGINAKKI, SUGINAKASH, Drongon, Shanks,
-- HARI ARAVIND) are not participants. tournament_registrations UNTOUCHED.
--
-- Identity aliases (requested display → existing players.display_name_key):
--   GIRISH          → g1rish          (keep; other tournament history)
--   Ironfist        → ironfist3525    (keep; other championship history)
--   Bumblee_Bee     → bumblee_bee     (existing row; not Bumblebee registrant)
--   Lynxcreed       → lynxcreed       (existing row; not lynxcreed294 registrant)
--   ClmeVictor      → NEW player      (cl_me_Brian is a different identity)
--   KONG / K.O.N.G  → K.O.N.G
-- Display-name updates only for rows with no other championship identity:
--   groot_16 → !GROOT, Bumblebee → Bumblee_Bee, lynxcreed294 → Lynxcreed,
--   shade_567. → Shade_567, senjuuzumaki__59633 → senjuuzumaki,
--   kp04 → KP4, big smoke → big smoke 46, skbakaa → SK,
--   machira777 → Machira
--
-- DGL Points (no group stage; knockout stages actually reached):
--   Champion  (QF + SF + Champion):           50 + 100 + 200 = 350
--   Runner-up (QF + SF + Runner-up):          50 + 100 + 150 = 300
--   SF loser  (QF + SF):                      50 + 100 = 150
--   QF loser  (QF):                           50
--   R1 loser  (played Round of 16 only):      0  (placement 6)
-- yato + mike_ received a walkover in R1 then lost QF → 50 (QF).
--
-- dgl_publish_standings_from_final is NOT called.

begin;

-- ---------------------------------------------------------------------------
-- 1. Players
-- ---------------------------------------------------------------------------

-- Rename existing identities first so we do not insert a second row.
-- Skip Bumblebee→Bumblee_Bee and lynxcreed294→Lynxcreed: those target keys
-- already belong to separate existing player rows. Use the existing rows.
update public.players set display_name = '!GROOT' where display_name_key = 'groot_16';
update public.players set display_name = 'Shade_567' where display_name_key = 'shade_567.';
update public.players set display_name = 'senjuuzumaki' where display_name_key = 'senjuuzumaki__59633';
update public.players set display_name = 'KP4' where display_name_key = 'kp04';
update public.players set display_name = 'big smoke 46' where display_name_key = 'big smoke';
update public.players set display_name = 'SK' where display_name_key = 'skbakaa';
update public.players set display_name = 'Machira' where display_name_key = 'machira777';

-- New identities only. Do not insert GIRISH / Ironfist (those map to g1rish / ironfist3525).
insert into public.players (display_name)
values
  ('Farhan_Mhd'),
  ('Shadowsniper'),
  ('ClmeVictor'),
  ('SmallboY'),
  ('rbs876'),
  ('Tomato'),
  ('Yuvarajaaa'),
  ('sham* sensei'),
  ('NADDY'),
  ('K.O.N.G'),
  ('Dead silence')
on conflict (display_name_key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Complete tournament
-- ---------------------------------------------------------------------------

update public.tournaments
set status = 'completed',
    completed_at = timestamptz '2026-08-15 14:30:00+00',
    completed_date_label = 'August 15, 2026',
    is_featured = false,
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'scheduled_slots', 32,
      'scheduled_teams', 16,
      'actual_participants', 30,
      'actual_teams', 15,
      'note', 'E33 (ASH + HOP) did not play Round 1; yato + mike_ advanced'
    ),
    updated_at = timezone('utc', now())
where external_id = 'dgl-valorant-saturday-showdown-1'
  and slug = 'valorant-saturday-showdown-1';

-- ---------------------------------------------------------------------------
-- 3. Participants — 30 actual players (not ASH/HOP)
-- ---------------------------------------------------------------------------

insert into public.tournament_participants (tournament_id, player_id, registration_id, status)
select t.id, p.id, tr.id, 'active'
from public.tournaments t
cross join (values
  ('!groot'),
  ('victor'),
  ('farhan_mhd'),
  ('shadowsniper'),
  ('yato'),
  ('mike_'),
  ('g1rish'),
  ('clmevictor'),
  ('smallboy'),
  ('rbs876'),
  ('tomato'),
  ('bumblee_bee'),
  ('lynxcreed'),
  ('shinigami ishigami'),
  ('frenzyvjn'),
  ('spontaneous_bear'),
  ('sk'),
  ('yuvarajaaa'),
  ('mxththunder'),
  ('shade_567'),
  ('senjuuzumaki'),
  ('sham* sensei'),
  ('kp4'),
  ('big smoke 46'),
  ('naddy'),
  ('k.o.n.g'),
  ('samf'),
  ('machira'),
  ('dead silence'),
  ('ironfist3525')
) as roster(name_key)
join public.players p on p.display_name_key = roster.name_key
left join public.tournament_registrations tr
  on tr.tournament_id = t.id and tr.player_id = p.id
where t.external_id = 'dgl-valorant-saturday-showdown-1'
on conflict (tournament_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Teams — 16 scheduled names; E33 has no members (did not play)
-- ---------------------------------------------------------------------------

with t as (
  select id from public.tournaments
  where external_id = 'dgl-valorant-saturday-showdown-1'
),
ins as (
  insert into public.tournament_teams (tournament_id, name, seed, metadata)
  select t.id, v.name, v.seed, v.meta
  from t
  cross join (values
    ('MIB', 1, '{"format":"2v2"}'::jsonb),
    ('Team 15', 2, '{"format":"2v2"}'::jsonb),
    ('E33', 3, '{"format":"2v2","did_not_play":true}'::jsonb),
    ('Team 12', 4, '{"format":"2v2"}'::jsonb),
    ('Junambu A', 5, '{"format":"2v2"}'::jsonb),
    ('Team 16', 6, '{"format":"2v2"}'::jsonb),
    ('Junambu B', 7, '{"format":"2v2"}'::jsonb),
    ('Team 11', 8, '{"format":"2v2"}'::jsonb),
    ('Team Glitch', 9, '{"format":"2v2"}'::jsonb),
    ('Noobs Lobby', 10, '{"format":"2v2"}'::jsonb),
    ('Washed Picaso', 11, '{"format":"2v2"}'::jsonb),
    ('Team 10', 12, '{"format":"2v2"}'::jsonb),
    ('Manda Baathram', 13, '{"format":"2v2"}'::jsonb),
    ('Team 14', 14, '{"format":"2v2"}'::jsonb),
    ('Nanga Kolaru', 15, '{"format":"2v2"}'::jsonb),
    ('Team 13', 16, '{"format":"2v2"}'::jsonb)
  ) as v(name, seed, meta)
  on conflict (tournament_id, name) do update
    set seed = excluded.seed,
        metadata = excluded.metadata,
        updated_at = timezone('utc', now())
  returning id, name
)
insert into public.tournament_team_members (team_id, player_id, role)
select ins.id, p.id, 'member'
from ins
join lateral (
  select * from (values
    ('MIB', '!groot'),
    ('MIB', 'victor'),
    ('Team 15', 'farhan_mhd'),
    ('Team 15', 'shadowsniper'),
    ('Team 12', 'yato'),
    ('Team 12', 'mike_'),
    ('Junambu A', 'g1rish'),
    ('Junambu A', 'clmevictor'),
    ('Team 16', 'smallboy'),
    ('Team 16', 'rbs876'),
    ('Junambu B', 'tomato'),
    ('Junambu B', 'bumblee_bee'),
    ('Team 11', 'lynxcreed'),
    ('Team 11', 'shinigami ishigami'),
    ('Team Glitch', 'frenzyvjn'),
    ('Team Glitch', 'spontaneous_bear'),
    ('Noobs Lobby', 'sk'),
    ('Noobs Lobby', 'yuvarajaaa'),
    ('Washed Picaso', 'mxththunder'),
    ('Washed Picaso', 'shade_567'),
    ('Team 10', 'senjuuzumaki'),
    ('Team 10', 'sham* sensei'),
    ('Manda Baathram', 'kp4'),
    ('Manda Baathram', 'big smoke 46'),
    ('Team 14', 'samf'),
    ('Team 14', 'machira'),
    ('Nanga Kolaru', 'naddy'),
    ('Nanga Kolaru', 'k.o.n.g'),
    ('Team 13', 'dead silence'),
    ('Team 13', 'ironfist3525')
  ) as m(team_name, name_key)
  where m.team_name = ins.name
) members on true
join public.players p on p.display_name_key = members.name_key
on conflict (team_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Fixtures
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
  where external_id = 'dgl-valorant-saturday-showdown-1';

  if v_tid is null then
    raise exception 'Valorant Saturday Showdown #1 tournament not found';
  end if;

  if exists (
    select 1 from public.tournament_fixtures where tournament_id = v_tid
  ) then
    raise notice 'Fixtures already exist for valorant-saturday-showdown-1 — skipping';
    return;
  end if;

  -- R1 M1: MIB vs Team 15 — winner Team 15 (Farhan_Mhd + Shadowsniper)
  select id into v_p1 from public.players where display_name_key = '!groot';
  select id into v_p2 from public.players where display_name_key = 'farhan_mhd';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'round_of_16', 'Round 1 Match 1', 1,
    v_p1, v_p2, v_p2, 'completed', timestamptz '2026-08-15 10:00:00+00'
  );

  -- R1 M2: E33 vs Team 12 — DID NOT TAKE PLACE; yato + mike_ advanced
  select id into v_p2 from public.players where display_name_key = 'yato';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at,
    player1_placeholder
  ) values (
    v_tid, 'round_of_16', 'Round 1 Match 2 — did not take place', 2,
    null, v_p2, v_p2, 'completed', timestamptz '2026-08-15 10:10:00+00',
    'E33 (did not play)'
  );

  -- R1 M3: Junambu A vs Team 16 — winner Team 16 (SmallboY + rbs876)
  select id into v_p1 from public.players where display_name_key = 'g1rish';
  select id into v_p2 from public.players where display_name_key = 'smallboy';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'round_of_16', 'Round 1 Match 3', 3,
    v_p1, v_p2, v_p2, 'completed', timestamptz '2026-08-15 10:20:00+00'
  );

  -- R1 M4: Junambu B vs Team 11 — winner Junambu B (Tomato + Bumblee_Bee)
  select id into v_p1 from public.players where display_name_key = 'tomato';
  select id into v_p2 from public.players where display_name_key = 'lynxcreed';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'round_of_16', 'Round 1 Match 4', 4,
    v_p1, v_p2, v_p1, 'completed', timestamptz '2026-08-15 10:30:00+00'
  );

  -- R1 M5: Team Glitch vs Noobs Lobby — winner Team Glitch
  select id into v_p1 from public.players where display_name_key = 'frenzyvjn';
  select id into v_p2 from public.players where display_name_key = 'sk';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'round_of_16', 'Round 1 Match 5', 5,
    v_p1, v_p2, v_p1, 'completed', timestamptz '2026-08-15 10:40:00+00'
  );

  -- R1 M6: Washed Picaso vs Team 10 — winner Washed Picaso
  select id into v_p1 from public.players where display_name_key = 'mxththunder';
  select id into v_p2 from public.players where display_name_key = 'senjuuzumaki';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'round_of_16', 'Round 1 Match 6', 6,
    v_p1, v_p2, v_p1, 'completed', timestamptz '2026-08-15 10:50:00+00'
  );

  -- R1 M7: Manda Baathram vs Team 14 — winner Manda Baathram
  select id into v_p1 from public.players where display_name_key = 'kp4';
  select id into v_p2 from public.players where display_name_key = 'samf';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'round_of_16', 'Round 1 Match 7', 7,
    v_p1, v_p2, v_p1, 'completed', timestamptz '2026-08-15 11:00:00+00'
  );

  -- R1 M8: Nanga Kolaru vs Team 13 — winner Nanga Kolaru (NADDY + K.O.N.G)
  select id into v_p1 from public.players where display_name_key = 'naddy';
  select id into v_p2 from public.players where display_name_key = 'dead silence';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'round_of_16', 'Round 1 Match 8', 8,
    v_p1, v_p2, v_p1, 'completed', timestamptz '2026-08-15 11:10:00+00'
  );

  -- QF1: yato + mike_ vs Farhan_Mhd + Shadowsniper — winner Farhan_Mhd
  select id into v_p1 from public.players where display_name_key = 'yato';
  select id into v_p2 from public.players where display_name_key = 'farhan_mhd';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'quarterfinal', 'Quarterfinal 1', 1,
    v_p1, v_p2, v_p2, 'completed', timestamptz '2026-08-15 12:00:00+00'
  );

  -- QF2: rbs876 + SmallboY vs Tomato + Bumblee_Bee — winner Tomato
  select id into v_p1 from public.players where display_name_key = 'smallboy';
  select id into v_p2 from public.players where display_name_key = 'tomato';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'quarterfinal', 'Quarterfinal 2', 2,
    v_p1, v_p2, v_p2, 'completed', timestamptz '2026-08-15 12:15:00+00'
  );

  -- QF3: FrenzyVJN + Spontaneous_Bear vs MxthThunder + Shade_567 — winner Frenzy
  select id into v_p1 from public.players where display_name_key = 'frenzyvjn';
  select id into v_p2 from public.players where display_name_key = 'mxththunder';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'quarterfinal', 'Quarterfinal 3', 3,
    v_p1, v_p2, v_p1, 'completed', timestamptz '2026-08-15 12:30:00+00'
  );

  -- QF4: KP4 + big smoke 46 vs NADDY + K.O.N.G — winner NADDY
  select id into v_p1 from public.players where display_name_key = 'kp4';
  select id into v_p2 from public.players where display_name_key = 'naddy';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'quarterfinal', 'Quarterfinal 4', 4,
    v_p1, v_p2, v_p2, 'completed', timestamptz '2026-08-15 12:45:00+00'
  );

  -- SF1: Farhan_Mhd + Shadowsniper vs Tomato + Bumblee_Bee — winner Tomato
  select id into v_p1 from public.players where display_name_key = 'farhan_mhd';
  select id into v_p2 from public.players where display_name_key = 'tomato';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'semifinal', 'Semifinal 1', 1,
    v_p1, v_p2, v_p2, 'completed', timestamptz '2026-08-15 13:15:00+00'
  );

  -- SF2: FrenzyVJN + Spontaneous_Bear vs NADDY + K.O.N.G — winner NADDY
  select id into v_p1 from public.players where display_name_key = 'frenzyvjn';
  select id into v_p2 from public.players where display_name_key = 'naddy';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'semifinal', 'Semifinal 2', 2,
    v_p1, v_p2, v_p2, 'completed', timestamptz '2026-08-15 13:30:00+00'
  );

  -- Grand Final: Tomato + Bumblee_Bee vs NADDY + K.O.N.G — champions NADDY + K.O.N.G
  select id into v_p1 from public.players where display_name_key = 'tomato';
  select id into v_p2 from public.players where display_name_key = 'naddy';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'final', 'Grand Final', 1,
    v_p1, v_p2, v_p2, 'completed', timestamptz '2026-08-15 14:30:00+00'
  );
end $$;

-- ---------------------------------------------------------------------------
-- 6. Placements
-- ---------------------------------------------------------------------------

-- Champions: NADDY + K.O.N.G (350)
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 1, 'player', p.id, 350
from public.tournaments t
cross join (values ('naddy'), ('k.o.n.g')) as champs(name_key)
join public.players p on p.display_name_key = champs.name_key
where t.external_id = 'dgl-valorant-saturday-showdown-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 1 and tp.player_id = p.id
  );

-- Runner-up: Tomato + Bumblee_Bee (300)
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 2, 'player', p.id, 300
from public.tournaments t
cross join (values ('tomato'), ('bumblee_bee')) as runners(name_key)
join public.players p on p.display_name_key = runners.name_key
where t.external_id = 'dgl-valorant-saturday-showdown-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 2 and tp.player_id = p.id
  );

-- Semifinalists (placement 4): Farhan_Mhd + Shadowsniper, FrenzyVJN + Spontaneous_Bear
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 4, 'player', p.id, 150
from public.tournaments t
cross join (values
  ('farhan_mhd'),
  ('shadowsniper'),
  ('frenzyvjn'),
  ('spontaneous_bear')
) as v(name_key)
join public.players p on p.display_name_key = v.name_key
where t.external_id = 'dgl-valorant-saturday-showdown-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 4 and tp.player_id = p.id
  );

-- Quarterfinalists (placement 5)
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 5, 'player', p.id, 50
from public.tournaments t
cross join (values
  ('yato'), ('mike_'),
  ('rbs876'), ('smallboy'),
  ('mxththunder'), ('shade_567'),
  ('kp4'), ('big smoke 46')
) as qf(name_key)
join public.players p on p.display_name_key = qf.name_key
where t.external_id = 'dgl-valorant-saturday-showdown-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 5 and tp.player_id = p.id
  );

-- Round of 16 losers (placement 6) — 0 points; still actual participants
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 6, 'player', p.id, 0
from public.tournaments t
cross join (values
  ('!groot'), ('victor'),
  ('g1rish'), ('clmevictor'),
  ('lynxcreed'), ('shinigami ishigami'),
  ('sk'), ('yuvarajaaa'),
  ('senjuuzumaki'), ('sham* sensei'),
  ('samf'), ('machira'),
  ('dead silence'), ('ironfist3525')
) as r1(name_key)
join public.players p on p.display_name_key = r1.name_key
where t.external_id = 'dgl-valorant-saturday-showdown-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 6 and tp.player_id = p.id
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
  '🏆 DGL VALORANT SHOWDOWN completed',
  'August 15, 2026 — Champions: NADDY + K.O.N.G',
  t.id,
  jsonb_build_object(
    'global_number', t.global_number,
    'slug', t.slug,
    'champion', 'NADDY + K.O.N.G',
    'runner_up', 'Tomato + Bumblee_Bee',
    'actual_participants', 30
  ),
  timezone('utc', timestamptz '2026-08-15 14:30:00+00')
from public.tournaments t
where t.external_id = 'dgl-valorant-saturday-showdown-1'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_completed'
  );

-- ---------------------------------------------------------------------------
-- 8. Sanity checks
-- ---------------------------------------------------------------------------

do $$
declare
  v_tid uuid;
  v_parts integer;
  v_fix integer;
  v_champs integer;
begin
  select id into v_tid
  from public.tournaments
  where external_id = 'dgl-valorant-saturday-showdown-1';

  select count(*) into v_parts
  from public.tournament_participants
  where tournament_id = v_tid;

  if v_parts <> 30 then
    raise exception 'Expected 30 participants, found %', v_parts;
  end if;

  if exists (
    select 1
    from public.tournament_participants tp
    join public.players p on p.id = tp.player_id
    where tp.tournament_id = v_tid
      and p.display_name_key in ('ashiskindacool', 'hop_fps', 'ash', 'hop')
  ) then
    raise exception 'ASH/HOP must not be participants';
  end if;

  select count(*) into v_fix
  from public.tournament_fixtures
  where tournament_id = v_tid;

  if v_fix <> 15 then
    raise exception 'Expected 15 fixtures, found %', v_fix;
  end if;

  select count(*) into v_champs
  from public.tournament_placements tp
  join public.players p on p.id = tp.player_id
  where tp.tournament_id = v_tid
    and tp.placement = 1
    and p.display_name_key in ('naddy', 'k.o.n.g');

  if v_champs <> 2 then
    raise exception 'Expected champions NADDY + K.O.N.G';
  end if;
end $$;

commit;
