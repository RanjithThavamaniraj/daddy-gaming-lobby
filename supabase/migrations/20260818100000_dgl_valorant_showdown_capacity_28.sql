-- Valorant Saturday Showdown #1 — capacity 22+4 → 28+4 (32 total).
--
-- Confirmed: registration_limit = 28
-- Reserve:   reserve_limit = 4  (product "Reserve" = status waitlist)
-- Total max registered: 32
--
-- Also promotes existing waitlist rows into confirmed in registered_at order
-- until the confirmed roster reaches registration_limit (or waitlist is empty).
-- Mirrors dgl_promote_reserve_registration fields (status, confirmed_at) without
-- requiring an admin JWT (migration context).
--
-- Does NOT touch: format, teams, bracket, points, results, lifecycle status,
-- other tournaments, or registration timestamps / player identity.

begin;

-- 1. Capacity: 28 confirmed + 4 reserve
update public.tournaments
set
  registration_limit = 28,
  reserve_limit = 4,
  updated_at = timezone('utc', now())
where slug = 'valorant-saturday-showdown-1'
  and external_id = 'dgl-valorant-saturday-showdown-1'
  and (
    registration_limit is distinct from 28
    or reserve_limit is distinct from 4
  );

-- 2. Promote reserves (waitlist) → confirmed in registration order,
--    only while confirmed count is below the new limit.
with tournament as (
  select id, registration_limit
  from public.tournaments
  where external_id = 'dgl-valorant-saturday-showdown-1'
),
confirmed_count as (
  select count(*)::integer as n
  from public.tournament_registrations tr
  join tournament t on t.id = tr.tournament_id
  where tr.status in ('pending', 'confirmed')
),
slots as (
  select greatest(0, t.registration_limit - c.n) as needed
  from tournament t
  cross join confirmed_count c
),
to_promote as (
  select tr.id
  from public.tournament_registrations tr
  join tournament t on t.id = tr.tournament_id
  cross join slots s
  where tr.status = 'waitlist'
    and s.needed > 0
  order by tr.registered_at asc, tr.id asc
  limit (select needed from slots)
)
update public.tournament_registrations as tr
set
  status = 'confirmed',
  confirmed_at = coalesce(tr.confirmed_at, timezone('utc', now())),
  updated_at = timezone('utc', now())
from to_promote p
where tr.id = p.id;

commit;
