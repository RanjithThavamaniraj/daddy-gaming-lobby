-- DGL Signature — Valorant Championship #2 (Tournament #9, slug valorant-2)
-- Official knockout results. Completed 5 September 2026.
--
-- tournament_registrations UNTOUCHED (audit history). Registration 5-stacks
-- do not match several played lineups; results use new tournament_teams
-- (plus Team Junnambu / Strawhats, whose played rosters match signup).
--
-- Identity aliases (result sheet → existing players.display_name_key):
--   END          → END / dhilip.          (same Valorant #2 registrant)
--   ZUKO         → ZUKO / rofxzuko
--   ROCKIE       → ROCKIE / rockie_11
--   Vasanth GR   → Vasanth GR / vasanthgr
--   Lynxcreed294 → lynxcreed294           (NOT Lynxcreed)
--   ShinigamiIshigami → Shinigami Ishigami (existing championship identity)
--   SamFurious   → SamF
--   Ash          → Ashiskindacool         (NOT Ash4U)
--   Viv          → vivxk
--   big smoke 46 → big smoke 46           (NOT the BIG SMOKE registrant row)
-- Similar-but-distinct identities are NOT merged.
-- New players created only when no row exists.
--
-- QF3 winners: END, Lina ♡, ZUKO, Aqua 🦋, ROCKIE
-- SF2 / Grand Final champions: END, ROCKIE, ZUKO, Aqua 🦋, Vasanth GR
-- (Lina ♡ played QF only; Vasanth GR joined from SF.) Fixture primaries for
-- those two lineups are Lina ♡ and Vasanth GR so the hub roster map does
-- not collapse both sides onto one team.
--
-- QF4 runner-up is a 4-player lineup as supplied. No 5th name invented.
-- Fixture scores are NULL — none were provided.
--
-- Data model (Rocket League #1 / Valorant Showdown #1 / Marvel #2):
--   tournaments               → status completed, is_featured false
--   tournament_registrations  → UNTOUCHED
--   tournament_participants   → 40 who actually played
--   tournament_teams          → played lineups
--   tournament_team_members   → 5 (or 4) per lineup
--   tournament_fixtures       → 4 QF + 2 SF + 1 Grand Final, no scores
--   tournament_placements     → per-player results + DGL points
--   community_activity        → tournament_completed (trigger + idempotent insert)
--
-- DGL Points — knockout, no group stage (dgl_calculate_points):
--   Champion  (QF + SF + Champion):  50 + 100 + 200 = 350
--   Runner-up (QF + SF + Runner-up): 50 + 100 + 150 = 300
--   SF loser  (QF + SF):             50 + 100 = 150
--   QF loser  (QF):                  50
-- Lina ♡ won QF3 then left the roster → quarterfinalist (50).
-- The five listed CHAMPIONS, including Vasanth GR, receive the champion
-- knockout total (350). dgl_publish_standings_from_final is NOT called.
--
-- Points are awarded ONLY by inserting tournament_placements. The existing
-- trigger writes player_points_ledger. Do NOT insert ledger rows here.

begin;

-- ---------------------------------------------------------------------------
-- 1. Players — rename Sequence registrants to result-sheet names first
-- ---------------------------------------------------------------------------

update public.players
set display_name = 'END'
where display_name_key = 'end / dhilip.'
  and display_name is distinct from 'END'
  and not exists (select 1 from public.players p2 where p2.display_name_key = 'end');

update public.players
set display_name = 'ZUKO'
where display_name_key = 'zuko / rofxzuko'
  and display_name is distinct from 'ZUKO'
  and not exists (select 1 from public.players p2 where p2.display_name_key = 'zuko');

update public.players
set display_name = 'ROCKIE'
where display_name_key = 'rockie / rockie_11'
  and display_name is distinct from 'ROCKIE'
  and not exists (select 1 from public.players p2 where p2.display_name_key = 'rockie');

update public.players
set display_name = 'Vasanth GR'
where display_name_key = 'vasanth gr / vasanthgr'
  and display_name is distinct from 'Vasanth GR'
  and not exists (select 1 from public.players p2 where p2.display_name_key = 'vasanth gr');

update public.players
set display_name = 'Lynxcreed294'
where display_name_key = 'lynxcreed294'
  and display_name is distinct from 'Lynxcreed294';

insert into public.players (display_name)
values
  ('Lina ♡'),
  ('Aqua 🦋'),
  ('Kanieeshk'),
  ('chasri38'),
  ('Eternality'),
  ('Vishal'),
  ('Kautxlyxn'),
  ('Noah')
on conflict (display_name_key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Complete tournament
-- ---------------------------------------------------------------------------

update public.tournaments
set status = 'completed',
    completed_at = timestamptz '2026-09-05 18:00:00+00', -- 11:30 PM IST
    completed_date_label = 'September 5, 2026',
    is_featured = false,
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'actual_teams', 9,
      'actual_participants', 40,
      'actual_matches', 7
    ),
    updated_at = timezone('utc', now())
where external_id = 'dgl-valorant-championship-2'
  and slug = 'valorant-2';

-- ---------------------------------------------------------------------------
-- 3. Participants — 40 who actually played
-- ---------------------------------------------------------------------------

insert into public.tournament_participants (tournament_id, player_id, registration_id, status)
select t.id, p.id, tr.id, 'active'
from public.tournaments t
cross join (values
  ('spontaneous_bear'),
  ('mxththunder'),
  ('frenzyvjn'),
  ('smallboy'),
  ('farhan_mhd'),
  ('g1rish'),
  ('cl_me_brian'),
  ('victor'),
  ('bumblebee'),
  ('mrbean'),
  ('kp4'),
  ('big smoke 46'),
  ('kanieeshk'),
  ('spark'),
  ('dead silence'),
  ('bluegod3663'),
  ('heroicptiv'),
  ('thirumalai777'),
  ('blackdevil15082'),
  ('kamal050379'),
  ('end'),
  ('lina ♡'),
  ('zuko'),
  ('aqua 🦋'),
  ('rockie'),
  ('hackers_tale'),
  ('shinigami ishigami'),
  ('lynxcreed294'),
  ('samf'),
  ('chasri38'),
  ('eternality'),
  ('vishal'),
  ('k a l e e'),
  ('kautxlyxn'),
  ('noah'),
  ('ashiskindacool'),
  ('acewolfbolt'),
  ('vivxk'),
  ('naddy'),
  ('vasanth gr')
) as roster(name_key)
join public.players p on p.display_name_key = roster.name_key
left join public.tournament_registrations tr
  on tr.tournament_id = t.id and tr.player_id = p.id
where t.external_id = 'dgl-valorant-championship-2'
on conflict (tournament_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Played lineups
--    Team Junnambu / Strawhats already exist from signup (exact match).
--    Other registration teams are left unchanged.
-- ---------------------------------------------------------------------------

with t as (
  select id from public.tournaments
  where external_id = 'dgl-valorant-championship-2'
),
ins as (
  insert into public.tournament_teams (tournament_id, name, seed, metadata)
  select t.id, v.name, v.seed, jsonb_build_object('format', '5v5', 'result_lineup', true)
  from t
  cross join (values
    ('Team 1', 1),
    ('Team Junnambu', 2),
    ('Team 3', 3),
    ('Strawhats', 4),
    ('Team 5', 5),
    ('Team 6', 6),
    ('Team 7', 7),
    ('Team 8', 8),
    ('Team 9', 9)
  ) as v(name, seed)
  on conflict (tournament_id, name) do update
    set seed = excluded.seed,
        metadata = public.tournament_teams.metadata || excluded.metadata,
        updated_at = timezone('utc', now())
  returning id, name
)
insert into public.tournament_team_members (team_id, player_id, role)
select ins.id, p.id, 'member'::public.dgl_team_member_role
from ins
join lateral (
  select * from (values
    ('Team 1', 'spontaneous_bear'),
    ('Team 1', 'mxththunder'),
    ('Team 1', 'frenzyvjn'),
    ('Team 1', 'smallboy'),
    ('Team 1', 'farhan_mhd'),
    ('Team Junnambu', 'g1rish'),
    ('Team Junnambu', 'cl_me_brian'),
    ('Team Junnambu', 'victor'),
    ('Team Junnambu', 'bumblebee'),
    ('Team Junnambu', 'mrbean'),
    ('Team 3', 'kp4'),
    ('Team 3', 'big smoke 46'),
    ('Team 3', 'kanieeshk'),
    ('Team 3', 'spark'),
    ('Team 3', 'dead silence'),
    ('Strawhats', 'bluegod3663'),
    ('Strawhats', 'heroicptiv'),
    ('Strawhats', 'thirumalai777'),
    ('Strawhats', 'blackdevil15082'),
    ('Strawhats', 'kamal050379'),
    ('Team 5', 'end'),
    ('Team 5', 'lina ♡'),
    ('Team 5', 'zuko'),
    ('Team 5', 'aqua 🦋'),
    ('Team 5', 'rockie'),
    ('Team 6', 'hackers_tale'),
    ('Team 6', 'shinigami ishigami'),
    ('Team 6', 'lynxcreed294'),
    ('Team 6', 'samf'),
    ('Team 6', 'chasri38'),
    ('Team 7', 'eternality'),
    ('Team 7', 'vishal'),
    ('Team 7', 'k a l e e'),
    ('Team 7', 'kautxlyxn'),
    ('Team 7', 'noah'),
    ('Team 8', 'ashiskindacool'),
    ('Team 8', 'acewolfbolt'),
    ('Team 8', 'vivxk'),
    ('Team 8', 'naddy'),
    ('Team 9', 'end'),
    ('Team 9', 'rockie'),
    ('Team 9', 'zuko'),
    ('Team 9', 'aqua 🦋'),
    ('Team 9', 'vasanth gr')
  ) as m(team_name, name_key)
  where m.team_name = ins.name
) members on true
join public.players p on p.display_name_key = members.name_key
on conflict (team_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Fixtures — QF1–QF4, SF1–SF2, Grand Final. No scores.
--    Primaries: Lina ♡ for QF3 (Team 5), Vasanth GR for SF2/GF (Team 9).
-- ---------------------------------------------------------------------------

do $$
declare
  v_tid uuid;
  v_p1 uuid;
  v_p2 uuid;
  v_w uuid;
  v_done timestamptz := timestamptz '2026-09-05 18:00:00+00';
begin
  select id into v_tid
  from public.tournaments
  where external_id = 'dgl-valorant-championship-2';

  if v_tid is null then
    raise exception 'Valorant Championship #2 tournament not found';
  end if;

  if exists (
    select 1 from public.tournament_fixtures where tournament_id = v_tid
  ) then
    raise notice 'Fixtures already exist for valorant-2 — skipping';
    return;
  end if;

  -- QF1: Team 1 vs Team Junnambu — winner Team 1
  select id into v_p1 from public.players where display_name_key = 'spontaneous_bear';
  select id into v_p2 from public.players where display_name_key = 'g1rish';
  if v_p1 is null or v_p2 is null then
    raise exception 'Valorant #2 QF1 primaries not found';
  end if;
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'quarterfinal', 'Quarterfinal 1', 1,
    v_p1, v_p2, v_p1, 'completed', v_done
  );

  -- QF2: Team 3 vs Strawhats — winner Team 3
  select id into v_p1 from public.players where display_name_key = 'kp4';
  select id into v_p2 from public.players where display_name_key = 'bluegod3663';
  if v_p1 is null or v_p2 is null then
    raise exception 'Valorant #2 QF2 primaries not found';
  end if;
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'quarterfinal', 'Quarterfinal 2', 2,
    v_p1, v_p2, v_p1, 'completed', v_done
  );

  -- QF3: Team 5 vs Team 6 — winner Team 5 (primary Lina ♡)
  select id into v_p1 from public.players where display_name_key = 'lina ♡';
  select id into v_p2 from public.players where display_name_key = 'hackers_tale';
  if v_p1 is null or v_p2 is null then
    raise exception 'Valorant #2 QF3 primaries not found';
  end if;
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'quarterfinal', 'Quarterfinal 3', 3,
    v_p1, v_p2, v_p1, 'completed', v_done
  );

  -- QF4: Team 7 vs Team 8 — winner Team 7
  select id into v_p1 from public.players where display_name_key = 'eternality';
  select id into v_p2 from public.players where display_name_key = 'naddy';
  if v_p1 is null or v_p2 is null then
    raise exception 'Valorant #2 QF4 primaries not found';
  end if;
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'quarterfinal', 'Quarterfinal 4', 4,
    v_p1, v_p2, v_p1, 'completed', v_done
  );

  -- SF1: Team 1 vs Team 3 — winner Team 1
  select id into v_p1 from public.players where display_name_key = 'spontaneous_bear';
  select id into v_p2 from public.players where display_name_key = 'kp4';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'semifinal', 'Semifinal 1', 1,
    v_p1, v_p2, v_p1, 'completed', v_done
  );

  -- SF2: Team 9 vs Team 7 — winner Team 9 (primary Vasanth GR)
  select id into v_p1 from public.players where display_name_key = 'vasanth gr';
  select id into v_p2 from public.players where display_name_key = 'eternality';
  if v_p1 is null or v_p2 is null then
    raise exception 'Valorant #2 SF2 primaries not found';
  end if;
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'semifinal', 'Semifinal 2', 2,
    v_p1, v_p2, v_p1, 'completed', v_done
  );

  -- Grand Final: Team 9 vs Team 1 — champions Team 9
  select id into v_p1 from public.players where display_name_key = 'vasanth gr';
  select id into v_p2 from public.players where display_name_key = 'spontaneous_bear';
  select id into v_w from public.players where display_name_key = 'vasanth gr';
  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'final', 'Grand Final', 1,
    v_p1, v_p2, v_w, 'completed', v_done
  );
end $$;

-- ---------------------------------------------------------------------------
-- 6. Placements — trigger awards ledger points (no manual ledger insert)
-- ---------------------------------------------------------------------------

-- Champions (placement 1): QF + SF + Champion = 350
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 1, 'player', p.id,
       public.dgl_calculate_points(false, true, true, true, true)
from public.tournaments t
cross join (values
  ('end'),
  ('rockie'),
  ('zuko'),
  ('aqua 🦋'),
  ('vasanth gr')
) as champs(name_key)
join public.players p on p.display_name_key = champs.name_key
where t.external_id = 'dgl-valorant-championship-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 1 and tp.player_id = p.id
  );

-- Runner-up (placement 2): QF + SF + Runner-up = 300
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 2, 'player', p.id,
       public.dgl_calculate_points(false, true, true, true, false)
from public.tournaments t
cross join (values
  ('spontaneous_bear'),
  ('mxththunder'),
  ('frenzyvjn'),
  ('smallboy'),
  ('farhan_mhd')
) as runners(name_key)
join public.players p on p.display_name_key = runners.name_key
where t.external_id = 'dgl-valorant-championship-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 2 and tp.player_id = p.id
  );

-- Semifinalists (placement 4): QF2 winners + QF4 winners
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 4, 'player', p.id,
       public.dgl_calculate_points(false, true, true, false, false)
from public.tournaments t
cross join (values
  ('kp4'),
  ('big smoke 46'),
  ('kanieeshk'),
  ('spark'),
  ('dead silence'),
  ('eternality'),
  ('vishal'),
  ('k a l e e'),
  ('kautxlyxn'),
  ('noah')
) as sf(name_key)
join public.players p on p.display_name_key = sf.name_key
where t.external_id = 'dgl-valorant-championship-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 4 and tp.player_id = p.id
  );

-- Quarterfinalists (placement 5): QF losers + Lina ♡
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 5, 'player', p.id,
       public.dgl_calculate_points(false, true, false, false, false)
from public.tournaments t
cross join (values
  ('g1rish'),
  ('cl_me_brian'),
  ('victor'),
  ('bumblebee'),
  ('mrbean'),
  ('bluegod3663'),
  ('heroicptiv'),
  ('thirumalai777'),
  ('blackdevil15082'),
  ('kamal050379'),
  ('hackers_tale'),
  ('shinigami ishigami'),
  ('lynxcreed294'),
  ('samf'),
  ('chasri38'),
  ('ashiskindacool'),
  ('acewolfbolt'),
  ('vivxk'),
  ('naddy'),
  ('lina ♡')
) as qf(name_key)
join public.players p on p.display_name_key = qf.name_key
where t.external_id = 'dgl-valorant-championship-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 5 and tp.player_id = p.id
  );

-- ---------------------------------------------------------------------------
-- 7. Community activity (idempotent if the status trigger already wrote a row)
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
  '🏆 DGL Signature — Valorant Championship #2 completed',
  'September 5, 2026 — Champions: END, ROCKIE, ZUKO, Aqua 🦋, Vasanth GR',
  t.id,
  jsonb_build_object(
    'global_number', t.global_number,
    'slug', t.slug,
    'champion', 'END, ROCKIE, ZUKO, Aqua 🦋, Vasanth GR',
    'runner_up', 'Spontaneous_Bear, MxthThunder, FrenzyVJN, SmallboY, Farhan_Mhd',
    'actual_participants', 40
  ),
  timezone('utc', timestamptz '2026-09-05 18:00:00+00')
from public.tournaments t
where t.external_id = 'dgl-valorant-championship-2'
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
  v_status text;
  v_featured boolean;
  v_parts integer;
  v_fix integer;
  v_champs integer;
  v_champ_pts integer;
  v_runners integer;
  v_runner_pts integer;
  v_sf integer;
  v_qf integer;
  v_ledger integer;
  v_scored integer;
  v_missing text;
begin
  select id, status, is_featured
    into v_tid, v_status, v_featured
  from public.tournaments
  where external_id = 'dgl-valorant-championship-2'
    and slug = 'valorant-2';

  if v_tid is null then
    raise exception 'Valorant Championship #2 tournament not found';
  end if;

  if v_status is distinct from 'completed' then
    raise exception 'Valorant Championship #2 status expected completed, found %', v_status;
  end if;

  if v_featured is distinct from false then
    raise exception 'Valorant Championship #2 must not remain featured';
  end if;

  select string_agg(name_key, ', ' order by name_key)
    into v_missing
  from (values
    ('spontaneous_bear'),
    ('mxththunder'),
    ('frenzyvjn'),
    ('smallboy'),
    ('farhan_mhd'),
    ('g1rish'),
    ('cl_me_brian'),
    ('victor'),
    ('bumblebee'),
    ('mrbean'),
    ('kp4'),
    ('big smoke 46'),
    ('kanieeshk'),
    ('spark'),
    ('dead silence'),
    ('bluegod3663'),
    ('heroicptiv'),
    ('thirumalai777'),
    ('blackdevil15082'),
    ('kamal050379'),
    ('end'),
    ('lina ♡'),
    ('zuko'),
    ('aqua 🦋'),
    ('rockie'),
    ('hackers_tale'),
    ('shinigami ishigami'),
    ('lynxcreed294'),
    ('samf'),
    ('chasri38'),
    ('eternality'),
    ('vishal'),
    ('k a l e e'),
    ('kautxlyxn'),
    ('noah'),
    ('ashiskindacool'),
    ('acewolfbolt'),
    ('vivxk'),
    ('naddy'),
    ('vasanth gr')
  ) as roster(name_key)
  where not exists (
    select 1 from public.players p where p.display_name_key = roster.name_key
  );

  if v_missing is not null then
    raise exception 'Missing player rows: %', v_missing;
  end if;

  select count(*) into v_parts
  from public.tournament_participants
  where tournament_id = v_tid;

  if v_parts <> 40 then
    raise exception 'Expected 40 participants, found %', v_parts;
  end if;

  select count(*) into v_fix
  from public.tournament_fixtures
  where tournament_id = v_tid;

  if v_fix <> 7 then
    raise exception 'Expected 7 fixtures, found %', v_fix;
  end if;

  select count(*) into v_scored
  from public.tournament_fixtures
  where tournament_id = v_tid
    and (player1_score is not null or player2_score is not null);

  if v_scored <> 0 then
    raise exception 'Expected no fixture scores, found % scored rows', v_scored;
  end if;

  select count(*), max(tp.points_awarded)
    into v_champs, v_champ_pts
  from public.tournament_placements tp
  where tp.tournament_id = v_tid
    and tp.placement = 1
    and tp.entity_type = 'player';

  if v_champs <> 5 or v_champ_pts is distinct from 350 then
    raise exception 'Expected 5 champions at 350 points, found % at %', v_champs, v_champ_pts;
  end if;

  select count(*), max(tp.points_awarded)
    into v_runners, v_runner_pts
  from public.tournament_placements tp
  where tp.tournament_id = v_tid
    and tp.placement = 2
    and tp.entity_type = 'player';

  if v_runners <> 5 or v_runner_pts is distinct from 300 then
    raise exception 'Expected 5 runners-up at 300 points, found % at %', v_runners, v_runner_pts;
  end if;

  select count(*) into v_sf
  from public.tournament_placements tp
  where tp.tournament_id = v_tid
    and tp.placement = 4
    and tp.entity_type = 'player';

  if v_sf <> 10 then
    raise exception 'Expected 10 semifinalists, found %', v_sf;
  end if;

  select count(*) into v_qf
  from public.tournament_placements tp
  where tp.tournament_id = v_tid
    and tp.placement = 5
    and tp.entity_type = 'player';

  if v_qf <> 20 then
    raise exception 'Expected 20 quarterfinalists, found %', v_qf;
  end if;

  select count(*) into v_ledger
  from public.player_points_ledger
  where tournament_id = v_tid;

  if v_ledger <> 40 then
    raise exception 'Expected 40 ledger rows for Valorant Championship #2, found %', v_ledger;
  end if;

  if exists (
    select 1
    from public.player_points_ledger
    where tournament_id = v_tid
    group by player_id
    having count(*) > 1
  ) then
    raise exception 'Duplicate ledger awards for Valorant Championship #2';
  end if;
end $$;

commit;
