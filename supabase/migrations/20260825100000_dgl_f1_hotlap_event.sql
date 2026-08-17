-- DGL F1 Hotlap Event — Tournament #9, single Main Event.
--
-- Intended changes only:
--   1. Add F1 to the games catalog (if missing).
--   2. Add an F1 Hotlap series using existing championship (prize) event_type.
--   3. Insert the F1 Hotlap tournament (20 player cap, ₹100 × confirmed).
--   4. Make F1 the single featured Main Event (is_featured).
--   5. Unfeature FC 26 Saturday Showdown #3 (is_featured = false only).
--   6. Allow metadata.title to override championship_name in the enriched view.
--
-- Does NOT delete or rewrite: FC 26 Showdown #3 row, its registrations,
-- participants, teams, completed tournament results, DGL Points, ranks,
-- or Valorant Showdown data.
--
-- Schedule: Saturday 22 Aug 2026, 6:00 PM – 10:00 PM IST.
-- Prize rule (metadata.prize_per_confirmed): confirmed × ₹100, capped by
-- registration_limit (20 → ₹2,000). Display is derived in the app mapper
-- from confirmed_count; prize_pool_display is left null so no hardcoded
-- ₹1,000 / ₹2,000 amount is stored.

begin;

-- 1. F1 game catalog
insert into public.games (
  slug,
  name,
  category,
  accent_color,
  glow_color,
  team_size,
  max_roster_size,
  default_participation_mode,
  sort_order,
  featured,
  status,
  metadata
)
values (
  'f1',
  'F1',
  'Racing',
  '#e10600',
  'rgba(225, 6, 0, 0.45)',
  1,
  1,
  'solo',
  96,
  true,
  'available',
  jsonb_build_object(
    'short_name', 'F1',
    'platform', 'PC / PS5 / Xbox',
    'format', 'Hotlap / Time Trial'
  )
)
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  accent_color = excluded.accent_color,
  glow_color = excluded.glow_color,
  team_size = excluded.team_size,
  max_roster_size = excluded.max_roster_size,
  default_participation_mode = excluded.default_participation_mode,
  sort_order = excluded.sort_order,
  featured = excluded.featured,
  status = excluded.status,
  metadata = excluded.metadata,
  updated_at = timezone('utc', now())
where public.games.name is distinct from excluded.name
   or public.games.category is distinct from excluded.category
   or public.games.accent_color is distinct from excluded.accent_color
   or public.games.glow_color is distinct from excluded.glow_color
   or public.games.team_size is distinct from excluded.team_size
   or public.games.max_roster_size is distinct from excluded.max_roster_size
   or public.games.default_participation_mode is distinct from excluded.default_participation_mode
   or public.games.sort_order is distinct from excluded.sort_order
   or public.games.featured is distinct from excluded.featured
   or public.games.status is distinct from excluded.status
   or public.games.metadata is distinct from excluded.metadata;

-- 2. F1 Hotlap series (existing championship / prize event_type)
insert into public.tournament_series (
  slug, name, game_id, cadence, participation_mode,
  default_format, default_match_type, event_type
)
select
  'f1-hotlap',
  'DGL F1 Hotlap Event',
  g.id,
  'seasonal',
  'solo',
  'Hotlap / Time Trial',
  'Time Trial',
  'championship'
from public.games g
where g.slug = 'f1'
on conflict (slug) do update
set
  name = excluded.name,
  cadence = excluded.cadence,
  participation_mode = excluded.participation_mode,
  default_format = excluded.default_format,
  default_match_type = excluded.default_match_type,
  event_type = excluded.event_type,
  updated_at = timezone('utc', now());

-- 3. Unfeature FC 26 Saturday Showdown #3 — flag only, no other columns.
update public.tournaments
set
  is_featured = false,
  updated_at = timezone('utc', now())
where external_id = 'dgl-fc26-saturday-showdown-3'
  and is_featured is distinct from false;

-- 4. Tournament #9 — F1 Hotlap Event (featured Main Event)
insert into public.tournaments (
  global_number,
  game_championship_number,
  external_id,
  slug,
  game_id,
  series_id,
  championship_label,
  participation_mode,
  format,
  match_type,
  status,
  accent_color,
  is_featured,
  registration_limit,
  reserve_limit,
  registration_opens_at,
  registration_closes_at,
  starts_at,
  prize_pool_display,
  prize_pool_amount,
  metadata
)
select
  9,
  1,
  'dgl-f1-hotlap-1',
  'f1-hotlap-1',
  g.id,
  ts.id,
  'F1',
  'solo',
  'Hotlap / Time Trial',
  'Time Trial',
  'registration_open',
  g.accent_color,
  true,
  20,
  0,
  timezone('utc', now()),
  timestamptz '2026-08-22 11:30:00+00', -- 5:00 PM IST (1h before start)
  timestamptz '2026-08-22 12:30:00+00', -- 6:00 PM IST
  null,
  null,
  jsonb_build_object(
    'title', 'DGL F1 Hotlap Event',
    'entry_fee', 'Free',
    'subtitle', 'Track: To Be Announced',
    'platform', 'PC / PS5 / Xbox',
    'match_duration', '4 Hours',
    'ends_at', '2026-08-22T16:30:00.000Z',
    'prize_per_confirmed', 100,
    'rewards', 'DGL Points • Hall of Titans Recognition',
    'rules', jsonb_build_array(
      'No Assists',
      'Equal Conditions',
      'Same car/settings for everyone where applicable',
      'No custom setups'
    ),
    'track', 'To Be Announced',
    'submission', 'Players submit their fastest verified lap time according to the existing DGL event process.',
    'leaderboard', 'Top Times'
  )
from public.games g
join public.tournament_series ts on ts.slug = 'f1-hotlap'
where g.slug = 'f1'
on conflict (external_id) do update
set
  series_id = excluded.series_id,
  championship_label = excluded.championship_label,
  participation_mode = excluded.participation_mode,
  format = excluded.format,
  match_type = excluded.match_type,
  status = excluded.status,
  accent_color = excluded.accent_color,
  is_featured = excluded.is_featured,
  registration_limit = excluded.registration_limit,
  reserve_limit = excluded.reserve_limit,
  registration_opens_at = coalesce(
    public.tournaments.registration_opens_at,
    excluded.registration_opens_at
  ),
  registration_closes_at = excluded.registration_closes_at,
  starts_at = excluded.starts_at,
  prize_pool_display = excluded.prize_pool_display,
  prize_pool_amount = excluded.prize_pool_amount,
  metadata = coalesce(public.tournaments.metadata, '{}'::jsonb) || excluded.metadata,
  game_championship_number = excluded.game_championship_number,
  updated_at = timezone('utc', now());

-- Safety: exactly one featured row — F1 Hotlap.
update public.tournaments
set
  is_featured = false,
  updated_at = timezone('utc', now())
where is_featured = true
  and external_id is distinct from 'dgl-f1-hotlap-1';

update public.tournaments
set
  is_featured = true,
  updated_at = timezone('utc', now())
where external_id = 'dgl-f1-hotlap-1'
  and is_featured is distinct from true;

-- 5. Enriched view — metadata.title overrides generated championship_name.
create or replace view public.v_tournaments_enriched
with (security_invoker = true) as
select
  t.id,
  t.global_number,
  t.game_championship_number,
  t.external_id,
  t.slug,
  t.championship_label,
  format('Tournament #%s', t.global_number) as tournament_number,
  coalesce(
    nullif(btrim(t.metadata->>'title'), ''),
    case ts.event_type
      when 'saturday_showdown' then
        format('DGL %s Saturday Showdown #%s', t.championship_label, t.game_championship_number)
      else
        format(
          'DGL Signature — %s Championship #%s',
          t.championship_label,
          t.game_championship_number
        )
    end
  ) as championship_name,
  g.slug as game_slug,
  g.name as game_name,
  g.accent_color as game_accent,
  t.participation_mode,
  t.format,
  t.match_type,
  t.status,
  t.prize_pool_display,
  t.prize_pool_amount,
  t.prize_pool_currency,
  t.accent_color,
  t.registration_limit,
  t.registration_opens_at,
  t.registration_closes_at,
  t.starts_at,
  t.completed_at,
  t.completed_date_label,
  t.is_featured,
  t.series_id,
  t.metadata,
  t.created_at,
  t.updated_at,
  coalesce(rc.confirmed_count, 0) as registered_count,
  coalesce(ts.event_type, 'championship'::public.dgl_event_type) as event_type,
  coalesce(rc.confirmed_count, 0) as confirmed_count,
  coalesce(rc.waitlist_count, 0) as waitlist_count,
  coalesce(t.reserve_limit, 4) as reserve_limit
from public.tournaments t
join public.games g on g.id = t.game_id
left join public.tournament_series ts on ts.id = t.series_id
left join public.v_tournament_registration_counts rc
  on rc.tournament_id = t.id;

grant select on public.v_tournaments_enriched to anon, authenticated;

insert into public.community_activity (
  activity_type,
  title,
  summary,
  tournament_id,
  payload,
  occurred_at,
  is_public
)
select
  'registration_opened',
  'Registration open · DGL F1 Hotlap Event',
  'Tournament #' || t.global_number || ' is accepting registrations',
  t.id,
  jsonb_build_object(
    'tournament_id', t.id,
    'global_number', t.global_number,
    'slug', t.slug,
    'external_id', t.external_id,
    'game', 'F1',
    'game_id', t.game_id,
    'championship_label', t.championship_label,
    'status', t.status,
    'registration_limit', t.registration_limit,
    'reserve_limit', t.reserve_limit,
    'prize_per_confirmed', 100,
    'start_at', t.starts_at,
    'registration_opens_at', t.registration_opens_at,
    'registration_closes_at', t.registration_closes_at,
    'featured', t.is_featured,
    'series', 'DGL F1 Hotlap Event',
    'format', t.format,
    'match_type', t.match_type
  ),
  timezone('utc', now()),
  true
from public.tournaments t
where t.external_id = 'dgl-f1-hotlap-1'
  and t.status = 'registration_open'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'registration_opened'
  );

commit;
