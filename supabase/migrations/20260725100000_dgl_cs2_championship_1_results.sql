-- DGL CS2 Championship #1 — official completion and results.
--
-- Completed: 25 July 2026. Champions earn 50 DGL Points each, runner-up 20
-- each (these are the tournament's own award values, distinct from the 150/100
-- standard set for FC 26 #1 — dgl_points_rules is left untouched here since
-- per-placement points_awarded already carries the explicit value).
--
-- Data model boundaries respected (same pattern as the FC 26 #1 results
-- migration, 20260712100001):
--   tournaments             → metadata + status (updated here)
--   tournament_registrations → registration history (NOT modified)
--   tournament_participants → who actually played (inserted here)
--   tournament_placements   → results (inserted here; trigger
--                             dgl_sync_points_for_player_placement writes the
--                             player_points_ledger and refreshes the summary)
--   player_points_ledger / summary → leaderboard (derived from results only,
--                             additive — never overwrites existing totals)

begin;

-- ---------------------------------------------------------------------------
-- 1. Ensure a players row exists for every participant
-- ---------------------------------------------------------------------------

insert into public.players (display_name)
values
  ('Hackers_Tale'),
  ('SamF'),
  ('Shinigami Ishigami'),
  ('Tejoo'),
  ('Wolf Diedrich'),
  ('g1rish'),
  ('saber_tooth24'),
  ('Bumblee_Bee'),
  ('Cl_me_brian'),
  ('Victor')
on conflict (display_name_key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Complete the tournament
-- ---------------------------------------------------------------------------

update public.tournaments
set status = 'completed',
    completed_at = timestamptz '2026-07-25 19:30:00+00',
    completed_date_label = 'July 25, 2026'
where external_id = 'dgl-cs2-championship-1';

-- ---------------------------------------------------------------------------
-- 3. Participants — the players who actually played.
--    Linked back to a registration when the same player registered;
--    registrations themselves are preserved untouched.
-- ---------------------------------------------------------------------------

insert into public.tournament_participants (tournament_id, player_id, registration_id, status)
select t.id, p.id, tr.id, 'active'
from public.tournaments t
cross join (values
  ('Hackers_Tale'), ('SamF'), ('Shinigami Ishigami'), ('Tejoo'), ('Wolf Diedrich'),
  ('g1rish'), ('saber_tooth24'), ('Bumblee_Bee'), ('Cl_me_brian'), ('Victor')
) as roster(display_name)
join public.players p on p.display_name_key = lower(btrim(roster.display_name))
left join public.tournament_registrations tr
  on tr.tournament_id = t.id and tr.player_id = p.id
where t.external_id = 'dgl-cs2-championship-1'
on conflict (tournament_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Results — champion team (placement 1, 50 pts each) and runner-up team
--    (placement 2, 20 pts each). The placements trigger writes the points
--    ledger and refreshes player_points_summary, so the leaderboard derives
--    from results only.
-- ---------------------------------------------------------------------------

insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 1, 'player', p.id, 50
from public.tournaments t
cross join (values
  ('Hackers_Tale'), ('SamF'), ('Shinigami Ishigami'), ('Tejoo'), ('Wolf Diedrich')
) as champs(display_name)
join public.players p on p.display_name_key = lower(btrim(champs.display_name))
where t.external_id = 'dgl-cs2-championship-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id
      and tp.placement = 1
      and tp.player_id = p.id
  );

insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 2, 'player', p.id, 20
from public.tournaments t
cross join (values
  ('g1rish'), ('saber_tooth24'), ('Bumblee_Bee'), ('Cl_me_brian'), ('Victor')
) as runners(display_name)
join public.players p on p.display_name_key = lower(btrim(runners.display_name))
where t.external_id = 'dgl-cs2-championship-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id
      and tp.placement = 2
      and tp.player_id = p.id
  );

-- ---------------------------------------------------------------------------
-- 5. Community activity entry (mirrors the FC 26 #1 completion pattern)
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
  '🏆 DGL CS2 Championship #1 completed',
  'July 25, 2026',
  t.id,
  jsonb_build_object('global_number', 3, 'slug', 'cs2-1'),
  timezone('utc', timestamptz '2026-07-25 19:30:00+00')
from public.tournaments t
where t.external_id = 'dgl-cs2-championship-1'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_completed'
  );

commit;
