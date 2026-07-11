-- DGL FC 26 Championship #1 — official completion and results.
--
-- Completed: 11 July 2026. Champions earn 150 DGL Points each, runner-up 100
-- each (the new standard going forward; historical Valorant awards remain
-- untouched in the immutable ledger).
--
-- Data model boundaries respected:
--   tournaments             → metadata + status (updated here)
--   tournament_registrations → registration history (NOT modified)
--   tournament_participants → who actually played (inserted here)
--   tournament_placements   → results (inserted here; trigger
--                             dgl_sync_points_for_player_placement writes the
--                             player_points_ledger and refreshes the summary)
--   player_points_ledger / summary → leaderboard (derived from results only)

begin;

-- ---------------------------------------------------------------------------
-- 1. New standard award values: champions 150, runner-up 100
-- ---------------------------------------------------------------------------

update public.dgl_points_rules
set champion_points = 150,
    runner_up_points = 100
where is_active = true;

-- ---------------------------------------------------------------------------
-- 2. Ensure a players row exists for every participant
-- ---------------------------------------------------------------------------

insert into public.players (display_name)
values
  ('viddy1485'),
  ('noisyboy96'),
  ('sabaresh9801'),
  ('ironfist3525'),
  ('iambalas'),
  ('ak4642'),
  ('danish01769'),
  ('ash4u'),
  ('K2K'),
  ('vinsonxavier12'),
  ('atlas.key'),
  ('limbo'),
  ('Naveen Kumar'),
  ('Frez'),
  ('Richie'),
  ('Palnikumar'),
  ('Herooo'),
  ('Jai')
on conflict (display_name_key) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Complete the tournament (metadata per the official record)
-- ---------------------------------------------------------------------------

update public.tournaments
set status = 'completed',
    completed_at = timestamptz '2026-07-11 17:30:00+00', -- 11:00 PM IST
    completed_date_label = 'July 11, 2026',
    format = '11v11',
    match_type = 'Best of 3',
    prize_pool_display = '₹2,000',
    metadata = metadata || jsonb_build_object('entry_fee', 'Free')
where external_id = 'dgl-fc26-championship-1';

-- ---------------------------------------------------------------------------
-- 4. Participants — the players who actually played.
--    Linked back to a registration when the same player registered;
--    substitutes/walk-ins keep registration_id null. Registrations themselves
--    are preserved untouched.
-- ---------------------------------------------------------------------------

insert into public.tournament_participants (tournament_id, player_id, registration_id, status)
select t.id, p.id, tr.id, 'active'
from public.tournaments t
cross join (values
  ('viddy1485'), ('noisyboy96'), ('sabaresh9801'), ('ironfist3525'),
  ('iambalas'), ('ak4642'), ('danish01769'), ('ash4u'), ('K2K'),
  ('vinsonxavier12'),
  ('atlas.key'), ('limbo'), ('Naveen Kumar'), ('Frez'), ('Richie'),
  ('Palnikumar'), ('Herooo'), ('Jai')
) as roster(display_name)
join public.players p on p.display_name_key = lower(btrim(roster.display_name))
left join public.tournament_registrations tr
  on tr.tournament_id = t.id and tr.player_id = p.id
where t.external_id = 'dgl-fc26-championship-1'
on conflict (tournament_id, player_id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Results — champions (placement 1, 150 pts) and runner-up (placement 2,
--    100 pts). The placements trigger writes the points ledger and refreshes
--    player_points_summary, so the leaderboard derives from results only.
-- ---------------------------------------------------------------------------

insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 1, 'player', p.id, 150
from public.tournaments t
cross join (values
  ('viddy1485'), ('noisyboy96'), ('sabaresh9801'), ('ironfist3525'),
  ('iambalas'), ('ak4642'), ('danish01769'), ('ash4u'), ('K2K'),
  ('vinsonxavier12')
) as champs(display_name)
join public.players p on p.display_name_key = lower(btrim(champs.display_name))
where t.external_id = 'dgl-fc26-championship-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id
      and tp.placement = 1
      and tp.player_id = p.id
  );

insert into public.tournament_placements
  (tournament_id, placement, entity_type, player_id, points_awarded)
select t.id, 2, 'player', p.id, 100
from public.tournaments t
cross join (values
  ('atlas.key'), ('limbo'), ('Naveen Kumar'), ('Frez'), ('Richie'),
  ('Palnikumar'), ('Herooo'), ('Jai')
) as runners(display_name)
join public.players p on p.display_name_key = lower(btrim(runners.display_name))
where t.external_id = 'dgl-fc26-championship-1'
  and not exists (
    select 1 from public.tournament_placements tp
    where tp.tournament_id = t.id
      and tp.placement = 2
      and tp.player_id = p.id
  );

-- ---------------------------------------------------------------------------
-- 6. Expose actual awarded points per tournament on the results view so the
--    UI renders real per-tournament values (Valorant keeps its historical
--    50/20; FC 26 shows 150/100) instead of a client-side constant.
--    Columns are appended, which "create or replace view" allows.
-- ---------------------------------------------------------------------------

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
  ) as runner_up_points
from public.v_tournaments_enriched te;

-- ---------------------------------------------------------------------------
-- 7. Community activity entry (mirrors the Valorant completion pattern)
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
  '🏆 DGL FC 26 Championship #1 completed',
  'July 11, 2026',
  t.id,
  jsonb_build_object('global_number', 2, 'slug', 'fc26-1'),
  timezone('utc', timestamptz '2026-07-11 17:30:00+00')
from public.tournaments t
where t.external_id = 'dgl-fc26-championship-1'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_completed'
  );

commit;
