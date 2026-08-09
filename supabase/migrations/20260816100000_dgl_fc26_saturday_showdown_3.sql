-- DGL FC 26 Saturday Showdown #3 — Pro Clubs 7v7
-- Reuses tournament_series.event_type = saturday_showdown.
-- Individual player registration (solo), 14 players → two 7-player clubs
-- assigned later via existing tournament_teams (not at signup).
-- Free community event — Free Entry, DGL Points only (no cash prize).
--
-- Schedule: Saturday 22 Aug 2026, 4:00 PM – 7:00 PM IST (3 hours).

begin;

-- Ensure FC 26 is available for tournament attachment.
update public.games
set status = 'available',
    featured = true,
    updated_at = timezone('utc', now())
where slug = 'fc-26'
  and (status is distinct from 'available' or featured is distinct from true);

-- Game-scoped Saturday Showdown series.
insert into public.tournament_series (
  slug, name, game_id, cadence, participation_mode,
  default_format, default_match_type, event_type
)
select
  'fc26-saturday-showdown',
  'DGL FC 26 Saturday Showdown',
  g.id,
  'weekly',
  'solo',
  '7v7',
  'Pro Clubs',
  'saturday_showdown'
from public.games g
where g.slug = 'fc-26'
on conflict (slug) do update
set
  name = excluded.name,
  cadence = excluded.cadence,
  participation_mode = excluded.participation_mode,
  default_format = excluded.default_format,
  default_match_type = excluded.default_match_type,
  event_type = excluded.event_type,
  updated_at = timezone('utc', now());

-- Tournament #8 — registration open; not featured (Valorant remains Main Event).
-- Chronologically between Valorant Showdown (15 Aug) and Marvel Showdown (29 Aug).
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
  8,
  3,
  'dgl-fc26-saturday-showdown-3',
  'fc26-saturday-showdown-3',
  g.id,
  ts.id,
  'FC 26',
  'solo',
  '7v7',
  'Pro Clubs',
  'registration_open',
  g.accent_color,
  false,
  14,
  4,
  timezone('utc', now()),
  timestamptz '2026-08-22 09:30:00+00', -- 3:00 PM IST (1h before start)
  timestamptz '2026-08-22 10:30:00+00', -- 4:00 PM IST
  null,
  0,
  jsonb_build_object(
    'entry_fee', 'Free',
    'subtitle', 'Pro Clubs 7v7',
    'mode', 'Pro Clubs',
    'team_size', 7,
    'team_limit', 2,
    'match_duration', '3 Hours',
    'ends_at', '2026-08-22T13:30:00.000Z'
  )
from public.games g
join public.tournament_series ts on ts.slug = 'fc26-saturday-showdown'
where g.slug = 'fc-26'
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
  'Registration open · FC 26 Pro Clubs',
  'Tournament #' || t.global_number || ' is accepting registrations',
  t.id,
  jsonb_build_object(
    'tournament_id', t.id,
    'global_number', t.global_number,
    'slug', t.slug,
    'external_id', t.external_id,
    'game', 'EA SPORTS FC 26',
    'game_id', t.game_id,
    'championship_label', t.championship_label,
    'status', t.status,
    'registration_limit', t.registration_limit,
    'reserve_limit', t.reserve_limit,
    'prize_pool_display', t.prize_pool_display,
    'start_at', t.starts_at,
    'registration_opens_at', t.registration_opens_at,
    'registration_closes_at', t.registration_closes_at,
    'featured', t.is_featured,
    'series', 'Saturday Showdown',
    'format', t.format,
    'mode', 'Pro Clubs'
  ),
  timezone('utc', now()),
  true
from public.tournaments t
where t.external_id = 'dgl-fc26-saturday-showdown-3'
  and t.status = 'registration_open'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'registration_opened'
  );

commit;
