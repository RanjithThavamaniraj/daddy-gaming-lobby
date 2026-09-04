-- DGL Marvel Rivals Saturday Showdown #2 — official completion from the
-- ACTUAL 6v6 Best of 5 that was played (2 teams / 12 players / 1 final).
-- Then hand the Main Event slot to Valorant Signature Championship #2.
--
-- Completed: 3 September 2026, 9:00 PM IST.
--
-- Identity aliases (in-game / result sheet → existing players.display_name_key):
--   spryzen.xxx           → Spryzen                    (Marvel registrant)
--   dorathedestroyer3036  → DORA THE DESTROYER#3036    (Marvel waitlist)
-- New players created only when no row exists.
-- Similar-but-distinct identities are NOT merged (same rule as Valorant
-- Showdown ClmeVictor ≠ cl_me_Brian):
--   noisyboy  is NOT noisyboy96
--   SH4D0W    is NOT Shadow / Shadowsniper
--
-- tournament_registrations UNTOUCHED (audit history). Several confirmed
-- registrants did not play; waitlisted DORA THE DESTROYER#3036 did play.
--
-- Data model (same pattern as Rocket League #1 / Valorant Showdown #1):
--   tournaments               → status completed, is_featured false
--   tournament_registrations  → UNTOUCHED
--   tournament_participants   → the 12 who actually played
--   tournament_teams          → 2 sixes
--   tournament_team_members   → 6 players per team
--   tournament_fixtures       → 1 completed Grand Final
--   tournament_placements     → per-player results + DGL points
--   community_activity        → tournament_completed
--   tournaments (Valorant #2) → is_featured true only
--
-- DGL Points — progression standard (20260801100000 / dgl_calculate_points),
-- stages actually reached. This event was a single Grand Final (no group,
-- QF, or SF):
--   Champion  (Final + Champion):  public.dgl_calculate_points(f,f,f,t,t) = 200
--   Runner-up (Final + Runner-up): public.dgl_calculate_points(f,f,f,t,f) = 150
--
-- Points are awarded ONLY by inserting tournament_placements. The existing
-- trigger dgl_sync_points_for_player_placement writes player_points_ledger
-- and refreshes player_points_summary. Do NOT insert ledger rows here.
--
-- dgl_publish_standings_from_final is NOT called: it awards a single
-- player_id per fixture slot.

begin;

-- ---------------------------------------------------------------------------
-- 1. Players
-- ---------------------------------------------------------------------------

-- Rename existing identities first so we do not insert a second row.
-- Both targets have no other championship identity.
update public.players
set display_name = 'spryzen.xxx'
where display_name_key = 'spryzen'
  and display_name is distinct from 'spryzen.xxx';

update public.players
set display_name = 'dorathedestroyer3036'
where display_name_key = 'dora the destroyer#3036'
  and display_name is distinct from 'dorathedestroyer3036';

insert into public.players (display_name)
values
  ('rama1122002'),
  ('lagleon2015'),
  ('spryzen.xxx'),
  ('thasaprakasam'),
  ('bananaman2060'),
  ('dorathedestroyer3036'),
  ('sushiii'),
  ('noisyboy'),
  ('SH4D0W'),
  ('TOMMY'),
  ('harish'),
  ('sNippY')
on conflict (display_name_key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Complete Marvel Rivals Saturday Showdown #2
-- ---------------------------------------------------------------------------

update public.tournaments
set status = 'completed',
    completed_at = timestamptz '2026-09-03 15:30:00+00', -- 9:00 PM IST
    completed_date_label = 'September 3, 2026',
    is_featured = false,
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'actual_teams', 2,
      'actual_participants', 12,
      'actual_matches', 1
    ),
    updated_at = timezone('utc', now())
where external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and slug = 'marvel-rivals-saturday-showdown-2';

-- ---------------------------------------------------------------------------
-- 3. Participants — the 12 who actually played
-- ---------------------------------------------------------------------------

insert into public.tournament_participants (tournament_id, player_id, registration_id, status)
select t.id, p.id, tr.id, 'active'
from public.tournaments t
cross join (values
  ('rama1122002'),
  ('lagleon2015'),
  ('spryzen.xxx'),
  ('thasaprakasam'),
  ('bananaman2060'),
  ('dorathedestroyer3036'),
  ('sushiii'),
  ('noisyboy'),
  ('sh4d0w'),
  ('tommy'),
  ('harish'),
  ('snippy')
) as roster(name_key)
join public.players p on p.display_name_key = roster.name_key
left join public.tournament_registrations tr
  on tr.tournament_id = t.id and tr.player_id = p.id
where t.external_id = 'dgl-marvel-rivals-saturday-showdown-2'
on conflict (tournament_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Teams — Winning Team vs Opponent Team
-- ---------------------------------------------------------------------------

with t as (
  select id from public.tournaments
  where external_id = 'dgl-marvel-rivals-saturday-showdown-2'
),
ins as (
  insert into public.tournament_teams (tournament_id, name, seed, metadata)
  select t.id, v.name, v.seed, jsonb_build_object('format', '6v6')
  from t
  cross join (values
    ('Winning Team', 1),
    ('Opponent Team', 2)
  ) as v(name, seed)
  on conflict (tournament_id, name) do update
    set seed = excluded.seed,
        metadata = excluded.metadata,
        updated_at = timezone('utc', now())
  returning id, name
)
insert into public.tournament_team_members (team_id, player_id, role)
select ins.id, p.id, 'member'::public.dgl_team_member_role
from ins
join lateral (
  select * from (values
    ('Winning Team', 'rama1122002'),
    ('Winning Team', 'lagleon2015'),
    ('Winning Team', 'spryzen.xxx'),
    ('Winning Team', 'thasaprakasam'),
    ('Winning Team', 'bananaman2060'),
    ('Winning Team', 'dorathedestroyer3036'),
    ('Opponent Team', 'sushiii'),
    ('Opponent Team', 'noisyboy'),
    ('Opponent Team', 'sh4d0w'),
    ('Opponent Team', 'tommy'),
    ('Opponent Team', 'harish'),
    ('Opponent Team', 'snippy')
  ) as m(team_name, name_key)
  where m.team_name = ins.name
) members on true
join public.players p on p.display_name_key = members.name_key
on conflict (team_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Grand Final fixture
-- ---------------------------------------------------------------------------

do $$
declare
  v_tid uuid;
  v_p1 uuid;
  v_p2 uuid;
begin
  select id into v_tid
  from public.tournaments
  where external_id = 'dgl-marvel-rivals-saturday-showdown-2';

  if v_tid is null then
    raise exception 'Marvel Rivals Saturday Showdown #2 tournament not found';
  end if;

  if exists (
    select 1 from public.tournament_fixtures where tournament_id = v_tid
  ) then
    raise notice 'Fixtures already exist for marvel-rivals-saturday-showdown-2 — skipping';
    return;
  end if;

  -- Grand Final: Winning Team vs Opponent Team — champions Winning Team
  -- player1_id/player2_id = team primary for FK; hub UI resolves full
  -- 6v6 labels via tournament_teams (same pattern as Rocket League #1).
  select id into v_p1 from public.players where display_name_key = 'rama1122002';
  select id into v_p2 from public.players where display_name_key = 'sushiii';

  if v_p1 is null or v_p2 is null then
    raise exception 'Marvel Rivals Grand Final primaries not found';
  end if;

  insert into public.tournament_fixtures (
    tournament_id, stage, round_label, fixture_order,
    player1_id, player2_id, winner_id, status, completed_at
  ) values (
    v_tid, 'final', 'Grand Final', 1,
    v_p1, v_p2, v_p1, 'completed', timestamptz '2026-09-03 15:30:00+00'
  );
end $$;

-- ---------------------------------------------------------------------------
-- 6. Placements — trigger awards ledger points (no manual ledger insert)
-- ---------------------------------------------------------------------------

-- Champions (placement 1): Final + Champion = 200
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 1, 'player', p.id,
       public.dgl_calculate_points(false, false, false, true, true)
from public.tournaments t
cross join (values
  ('rama1122002'),
  ('lagleon2015'),
  ('spryzen.xxx'),
  ('thasaprakasam'),
  ('bananaman2060'),
  ('dorathedestroyer3036')
) as champs(name_key)
join public.players p on p.display_name_key = champs.name_key
where t.external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 1 and tp.player_id = p.id
  );

-- Runner-up (placement 2): Final + Runner-up = 150
insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 2, 'player', p.id,
       public.dgl_calculate_points(false, false, false, true, false)
from public.tournaments t
cross join (values
  ('sushiii'),
  ('noisyboy'),
  ('sh4d0w'),
  ('tommy'),
  ('harish'),
  ('snippy')
) as runners(name_key)
join public.players p on p.display_name_key = runners.name_key
where t.external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id and tp.placement = 2 and tp.player_id = p.id
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
  '🏆 DGL Marvel Rivals Saturday Showdown #2 completed',
  'September 3, 2026 — Champions: rama1122002, lagleon2015, spryzen.xxx, thasaprakasam, bananaman2060, dorathedestroyer3036',
  t.id,
  jsonb_build_object(
    'global_number', t.global_number,
    'slug', t.slug,
    'champion', 'rama1122002, lagleon2015, spryzen.xxx, thasaprakasam, bananaman2060, dorathedestroyer3036',
    'runner_up', 'sushiii, noisyboy, SH4D0W, TOMMY, harish, sNippY',
    'actual_participants', 12
  ),
  timezone('utc', timestamptz '2026-09-03 15:30:00+00')
from public.tournaments t
where t.external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_completed'
  );

-- ---------------------------------------------------------------------------
-- 8. Main Event — Valorant Signature Championship #2
--    Featured flag only. Date, status, capacity, prize, format untouched.
--    enforce_single_featured_tournament also unfeatures any other row.
-- ---------------------------------------------------------------------------

update public.tournaments
set
  is_featured = true,
  updated_at = timezone('utc', now())
where external_id = 'dgl-valorant-championship-2'
  and is_featured is distinct from true;

update public.tournaments
set
  is_featured = false,
  updated_at = timezone('utc', now())
where external_id is distinct from 'dgl-valorant-championship-2'
  and is_featured = true;

-- ---------------------------------------------------------------------------
-- 9. Sanity checks
-- ---------------------------------------------------------------------------

do $$
declare
  v_tid uuid;
  v_parts integer;
  v_champs integer;
  v_runners integer;
  v_ledger integer;
  v_champ_pts integer;
  v_runner_pts integer;
  v_featured text;
  v_featured_count integer;
  v_marvel_status text;
  v_marvel_featured boolean;
  v_missing text;
begin
  select id, status, is_featured
    into v_tid, v_marvel_status, v_marvel_featured
  from public.tournaments
  where external_id = 'dgl-marvel-rivals-saturday-showdown-2';

  if v_tid is null then
    raise exception 'Marvel Rivals Saturday Showdown #2 tournament not found';
  end if;

  if v_marvel_status is distinct from 'completed' then
    raise exception 'Marvel Rivals #2 status expected completed, found %', v_marvel_status;
  end if;

  if v_marvel_featured is distinct from false then
    raise exception 'Marvel Rivals #2 must not remain featured';
  end if;

  select string_agg(name_key, ', ' order by name_key)
    into v_missing
  from (values
    ('rama1122002'),
    ('lagleon2015'),
    ('spryzen.xxx'),
    ('thasaprakasam'),
    ('bananaman2060'),
    ('dorathedestroyer3036'),
    ('sushiii'),
    ('noisyboy'),
    ('sh4d0w'),
    ('tommy'),
    ('harish'),
    ('snippy')
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

  if v_parts <> 12 then
    raise exception 'Expected 12 participants, found %', v_parts;
  end if;

  select count(*), max(tp.points_awarded)
    into v_champs, v_champ_pts
  from public.tournament_placements tp
  where tp.tournament_id = v_tid
    and tp.placement = 1
    and tp.entity_type = 'player';

  if v_champs <> 6 or v_champ_pts is distinct from 200 then
    raise exception 'Expected 6 champions at 200 points, found % at %', v_champs, v_champ_pts;
  end if;

  select count(*), max(tp.points_awarded)
    into v_runners, v_runner_pts
  from public.tournament_placements tp
  where tp.tournament_id = v_tid
    and tp.placement = 2
    and tp.entity_type = 'player';

  if v_runners <> 6 or v_runner_pts is distinct from 150 then
    raise exception 'Expected 6 runners-up at 150 points, found % at %', v_runners, v_runner_pts;
  end if;

  select count(*) into v_ledger
  from public.player_points_ledger
  where tournament_id = v_tid;

  if v_ledger <> 12 then
    raise exception 'Expected 12 ledger rows for Marvel Rivals #2, found %', v_ledger;
  end if;

  if exists (
    select 1
    from public.player_points_ledger
    where tournament_id = v_tid
    group by player_id
    having count(*) > 1
  ) then
    raise exception 'Duplicate ledger awards for Marvel Rivals #2';
  end if;

  select external_id into v_featured
  from public.tournaments
  where is_featured = true;

  select count(*) into v_featured_count
  from public.tournaments
  where is_featured = true;

  if v_featured_count <> 1 or v_featured is distinct from 'dgl-valorant-championship-2' then
    raise exception 'Expected Valorant Championship #2 as sole featured tournament, found % (count %)',
      v_featured, v_featured_count;
  end if;
end $$;

commit;
