-- DGL Signature branding for prize (championship) tournaments.
--
-- Display-only: championship_name is computed in v_tournaments_enriched.
-- Free Saturday Showdowns keep "DGL {Game} Saturday Showdown #N".
-- Prize events become "DGL Signature — {Game} Championship #N".
--
-- Also renames championship tournament_series.name for admin/creation UX.
-- Does NOT touch: tournament ids/slugs, registrations, results, placements,
-- points, status, dates, prize amounts, community_activity, or functions.

begin;

-- 1. Series display names (championship / prize series only)
update public.tournament_series
set
  name = case slug
    when 'valorant-championship' then 'DGL Signature — Valorant Championship'
    when 'fc26-championship' then 'DGL Signature — FC 26 Championship'
    when 'cs2-championship' then 'DGL Signature — CS2 Championship'
    when 'rocket-league-championship' then 'DGL Signature — Rocket League Championship'
    else name
  end,
  updated_at = timezone('utc', now())
where event_type = 'championship'
  and slug in (
    'valorant-championship',
    'fc26-championship',
    'cs2-championship',
    'rocket-league-championship'
  )
  and name is distinct from case slug
    when 'valorant-championship' then 'DGL Signature — Valorant Championship'
    when 'fc26-championship' then 'DGL Signature — FC 26 Championship'
    when 'cs2-championship' then 'DGL Signature — CS2 Championship'
    when 'rocket-league-championship' then 'DGL Signature — Rocket League Championship'
    else name
  end;

-- 2. Enriched view — Signature title for championship event_type only
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
  case ts.event_type
    when 'saturday_showdown' then
      format('DGL %s Saturday Showdown #%s', t.championship_label, t.game_championship_number)
    else
      format(
        'DGL Signature — %s Championship #%s',
        t.championship_label,
        t.game_championship_number
      )
  end as championship_name,
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

commit;
