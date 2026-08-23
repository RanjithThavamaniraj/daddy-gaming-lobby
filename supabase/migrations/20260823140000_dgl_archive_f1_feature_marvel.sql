-- Archive the F1 Hotlap Event that was not conducted (Tournament #7).
-- Promote Marvel Rivals Saturday Showdown #2 (Aug 29) to Main Event.
-- Expose is_archived on v_tournaments_enriched for public archive filtering.

begin;

-- 1. F1 Hotlap: cancelled + archived (not completed — no results/points activity).
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

-- 2. Marvel Rivals Aug 29 → Main Event.
update public.tournaments
set
  is_featured = true,
  updated_at = timezone('utc', now())
where external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and is_featured is distinct from true;

-- Safety: exactly one featured row — Marvel Rivals.
update public.tournaments
set
  is_featured = false,
  updated_at = timezone('utc', now())
where external_id is distinct from 'dgl-marvel-rivals-saturday-showdown-2'
  and is_featured = true;

-- 3. Audit activity (idempotent — no tournament_completed).
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
  'Tournament #' || t.global_number || ' was cancelled',
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
where t.external_id = 'dgl-f1-hotlap-1'
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
  'Tournament #' || t.global_number || ' was archived',
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
where t.external_id = 'dgl-f1-hotlap-1'
  and t.is_archived = true
  and not exists (
    select 1
    from public.community_activity ca
    where ca.tournament_id = t.id
      and ca.activity_type = 'tournament_archived'
  );

-- 4. v_tournaments_enriched — expose is_archived for application-layer archive UI.
create or replace view public.v_tournaments_enriched
with (security_invoker = true) as
select
  t.id,
  t.global_number,
  t.game_championship_number,
  t.external_id,
  t.slug,
  t.championship_label,
  case
    when t.global_number is null then null
    else format('Tournament #%s', t.global_number)
  end as tournament_number,
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
  coalesce(t.reserve_limit, 4) as reserve_limit,
  t.is_archived
from public.tournaments t
join public.games g on g.id = t.game_id
left join public.tournament_series ts on ts.id = t.series_id
left join public.v_tournament_registration_counts rc
  on rc.tournament_id = t.id;

grant select on public.v_tournaments_enriched to anon, authenticated;

commit;
