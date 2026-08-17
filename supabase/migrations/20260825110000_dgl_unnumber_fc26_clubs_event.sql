-- Public DGL tournament numbering correction.
--
-- Actual live sequence before this migration:
--   #1 Valorant Championship #1 (completed)
--   #2 FC 26 Championship #1 (completed)
--   #3 CS2 Championship #1 (completed)
--   #4 FC 26 Championship #2 (completed)
--   #5 Rocket League Championship #1 (completed)
--   #6 Valorant Saturday Showdown #1 (completed)
--   #7 Marvel Rivals Saturday Showdown #2 (Aug 29)
--   #8 FC 26 Saturday Showdown #3 (Clubs — internal/community)
--   #9 F1 Hotlap Event (featured)
--
-- Intended public sequence:
--   #1–#6 unchanged (completed history)
--   #7 F1 Hotlap Event
--   #8 Marvel Rivals Saturday Showdown #2 (DGL Rivals, Aug 29)
--   FC 26 Saturday Showdown #3 remains in the database with its
--   registrations, but does not occupy a public global_number.
--
-- Does NOT delete FC 26 Clubs, its 3 registrations, or any completed
-- results / points / ranks. Does NOT change Marvel or F1 status, dates,
-- capacity, or featured flags — only global_number (and FC26 metadata).

begin;

-- Allow community/internal events to exist without a public Tournament #N.
alter table public.tournaments
  alter column global_number drop not null;

alter table public.tournaments
  drop constraint if exists tournaments_global_number_unique;

create unique index if not exists tournaments_global_number_uidx
  on public.tournaments (global_number)
  where global_number is not null;

comment on column public.tournaments.global_number is
  'Public DGL-wide sequence (Tournament #N). Null = not in the public numbered series (internal/community events). Never reassign after a numbered event is published.';

-- 1. Free #8: FC 26 Clubs leaves the public sequence. Row + registrations stay.
update public.tournaments
set
  global_number = null,
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'counts_in_global_sequence', false
  ),
  updated_at = timezone('utc', now())
where external_id = 'dgl-fc26-saturday-showdown-3'
  and global_number is not null;

-- 2. Marvel Rivals / DGL Rivals Aug 29: #7 → #8 (status/dates untouched).
update public.tournaments
set
  global_number = 8,
  updated_at = timezone('utc', now())
where external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and global_number is distinct from 8;

-- 3. F1 Hotlap: #9 → #7 (featured/dates/capacity untouched).
update public.tournaments
set
  global_number = 7,
  updated_at = timezone('utc', now())
where external_id = 'dgl-f1-hotlap-1'
  and global_number is distinct from 7;

-- Enriched view: omit Tournament #N when global_number is null.
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
  coalesce(t.reserve_limit, 4) as reserve_limit
from public.tournaments t
join public.games g on g.id = t.game_id
left join public.tournament_series ts on ts.id = t.series_id
left join public.v_tournament_registration_counts rc
  on rc.tournament_id = t.id;

grant select on public.v_tournaments_enriched to anon, authenticated;

commit;
