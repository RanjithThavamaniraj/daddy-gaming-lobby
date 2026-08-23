-- Archive FC26 Pro Clubs (not conducted) and promote Valorant Championship #2
-- (5 Sep 2026, 5v5, ₹2,000) as Main Event with registration still closed.
--
-- Reuses existing is_archived / is_featured mechanisms — no new archive system.
-- Does NOT modify Marvel Rivals beyond clearing is_featured (required for single Main Event).
-- Idempotent: safe to run more than once; no tournament_completed activity.

begin;

-- 1. FC26 Clubs: cancelled + archived (not completed).
update public.tournaments
set
  status = 'cancelled',
  is_archived = true,
  is_featured = false,
  updated_at = timezone('utc', now())
where external_id = 'dgl-fc26-saturday-showdown-3'
  and (
    status is distinct from 'cancelled'
    or is_archived is distinct from true
    or is_featured is distinct from false
  );

-- 2. Valorant Signature Championship #2 — Tournament #9, coming_soon, featured.
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
  prize_pool_display,
  prize_pool_amount,
  accent_color,
  is_featured,
  starts_at,
  metadata
)
select
  9,
  2,
  'dgl-valorant-championship-2',
  'valorant-2',
  g.id,
  ts.id,
  'Valorant',
  'team',
  '5v5',
  'Best of 3',
  'coming_soon',
  '₹2,000',
  2000,
  g.accent_color,
  true,
  timestamptz '2026-09-05 10:30:00+00', -- 4:00 PM IST
  jsonb_build_object('entry_fee', 'Free')
from public.games g
join public.tournament_series ts on ts.slug = 'valorant-championship'
where g.slug = 'valorant'
on conflict (external_id) do update
set
  global_number = excluded.global_number,
  game_championship_number = excluded.game_championship_number,
  slug = excluded.slug,
  series_id = excluded.series_id,
  championship_label = excluded.championship_label,
  participation_mode = excluded.participation_mode,
  format = excluded.format,
  match_type = excluded.match_type,
  status = excluded.status,
  prize_pool_display = excluded.prize_pool_display,
  prize_pool_amount = excluded.prize_pool_amount,
  accent_color = excluded.accent_color,
  is_featured = excluded.is_featured,
  starts_at = excluded.starts_at,
  metadata = coalesce(public.tournaments.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = timezone('utc', now());

-- 3. Feature Valorant; unfeature all others (Marvel, F1, FC26, etc.).
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

-- 4. Safety: preserve prior archive state for F1 Hotlap.
update public.tournaments
set
  status = 'cancelled',
  is_archived = true,
  is_featured = false,
  updated_at = timezone('utc', now())
where external_id = 'dgl-f1-hotlap-1'
  and (
    status is distinct from 'cancelled'
    or is_archived is distinct from true
    or is_featured is distinct from false
  );

-- 5. Audit activity for FC26 (idempotent — no tournament_completed).
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
  'tournament_cancelled',
  'Cancelled · ' || t.championship_label,
  coalesce(
    'Tournament #' || t.global_number || ' was cancelled',
    t.championship_label || ' event was cancelled'
  ),
  t.id,
  jsonb_build_object(
    'tournament_id', t.id,
    'global_number', t.global_number,
    'slug', t.slug,
    'external_id', t.external_id,
    'status', t.status,
    'is_archived', t.is_archived,
    'reason', 'not_conducted'
  ),
  timezone('utc', now()),
  true
from public.tournaments t
where t.external_id = 'dgl-fc26-saturday-showdown-3'
  and t.status = 'cancelled'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_cancelled'
  );

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
  'tournament_archived',
  'Archived · ' || t.championship_label,
  coalesce(
    'Tournament #' || t.global_number || ' was archived',
    t.championship_label || ' event was archived'
  ),
  t.id,
  jsonb_build_object(
    'tournament_id', t.id,
    'global_number', t.global_number,
    'slug', t.slug,
    'external_id', t.external_id,
    'status', t.status,
    'is_archived', t.is_archived,
    'reason', 'not_conducted'
  ),
  timezone('utc', now()),
  true
from public.tournaments t
where t.external_id = 'dgl-fc26-saturday-showdown-3'
  and t.is_archived = true
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_archived'
  );

commit;
