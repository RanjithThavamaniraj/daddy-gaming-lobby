-- Opens registration for DGL Rocket League Championship #1.
--
-- The public registration form and admin panel already support Rocket League
-- fields, but the source-of-truth row is still status = 'coming_soon', so the
-- Main Event CTA stays "Coming Soon" and registrations are not marked open.
-- Mirrors 20260714100000_dgl_open_cs2_registration.sql.

begin;

update public.tournaments
set status = 'registration_open',
    registration_opens_at = coalesce(
      registration_opens_at,
      timezone('utc', now())
    ),
    updated_at = timezone('utc', now())
where external_id = 'dgl-rocket-league-championship-1'
  and status = 'coming_soon';

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
  'Registration open · Rocket League',
  'Tournament #' || t.global_number || ' is accepting registrations',
  t.id,
  jsonb_build_object(
    'tournament_id', t.id,
    'global_number', t.global_number,
    'slug', t.slug,
    'external_id', t.external_id,
    'game', 'Rocket League',
    'game_id', t.game_id,
    'championship_label', t.championship_label,
    'status', t.status,
    'registration_limit', t.registration_limit,
    'prize_pool_display', t.prize_pool_display,
    'start_at', t.starts_at,
    'registration_opens_at', t.registration_opens_at,
    'registration_closes_at', t.registration_closes_at,
    'featured', t.is_featured
  ),
  timezone('utc', now()),
  true
from public.tournaments t
where t.external_id = 'dgl-rocket-league-championship-1'
  and t.status = 'registration_open'
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'registration_opened'
  );

commit;
