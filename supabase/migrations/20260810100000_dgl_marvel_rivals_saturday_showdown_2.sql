-- DGL Marvel Rivals Saturday Showdown #2
-- Reuses tournament_series.event_type = saturday_showdown (generic series branding).
-- Individual player registration (solo). No team tables / team registration.
-- Free community event — Free Entry, DGL Points only (no cash prize).

begin;

-- Ensure Marvel Rivals is available for tournament attachment.
update public.games
set status = 'available',
    featured = true,
    updated_at = timezone('utc', now())
where slug = 'marvel-rivals'
  and (status is distinct from 'available' or featured is distinct from true);

-- Game-scoped Saturday Showdown series (generic — not Marvel-hardcoded UI).
insert into public.tournament_series (
  slug, name, game_id, cadence, participation_mode,
  default_format, default_match_type, event_type
)
select
  'marvel-rivals-saturday-showdown',
  'DGL Marvel Rivals Saturday Showdown',
  g.id,
  'weekly',
  'solo',
  '6v6',
  'Best of 5',
  'saturday_showdown'
from public.games g
where g.slug = 'marvel-rivals'
on conflict (slug) do update
set
  name = excluded.name,
  cadence = excluded.cadence,
  participation_mode = excluded.participation_mode,
  default_format = excluded.default_format,
  default_match_type = excluded.default_match_type,
  event_type = excluded.event_type,
  updated_at = timezone('utc', now());

-- Tournament #7 — registration open immediately; not featured (Next Tournament slot).
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
  7,
  2,
  'dgl-marvel-rivals-saturday-showdown-2',
  'marvel-rivals-saturday-showdown-2',
  g.id,
  ts.id,
  'Marvel Rivals',
  'solo',
  '6v6',
  'Best of 5',
  'registration_open',
  g.accent_color,
  false,
  12,
  6,
  timezone('utc', now()),
  timestamptz '2026-08-29 13:00:00+00', -- 6:30 PM IST
  timestamptz '2026-08-29 14:00:00+00', -- 7:30 PM IST
  null,
  0,
  jsonb_build_object(
    'entry_fee', 'Free',
    'subtitle', 'Marvel Rivals Community Cup'
  )
from public.games g
join public.tournament_series ts on ts.slug = 'marvel-rivals-saturday-showdown'
where g.slug = 'marvel-rivals'
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
  'Registration open · Marvel Rivals',
  'Tournament #' || t.global_number || ' is accepting registrations',
  t.id,
  jsonb_build_object(
    'tournament_id', t.id,
    'global_number', t.global_number,
    'slug', t.slug,
    'external_id', t.external_id,
    'game', 'Marvel Rivals',
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
    'series', 'Saturday Showdown'
  ),
  timezone('utc', now()),
  true
from public.tournaments t
where t.external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and t.status = 'registration_open'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'registration_opened'
  );

commit;
