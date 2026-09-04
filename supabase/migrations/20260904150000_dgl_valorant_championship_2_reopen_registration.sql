-- Valorant Championship #2 — reopen registration for remaining main slots.
--
-- Tournament: dgl-valorant-championship-2 / slug valorant-2
-- Status only: registration_closed → registration_open.
--
-- Does NOT insert community_activity (avoid a duplicate Discord announcement).
-- Does NOT change: registration_limit, reserve_limit, registrations,
-- featured flag, dates, prize, format, or any other tournament.

begin;

update public.tournaments
set
  status = 'registration_open',
  updated_at = timezone('utc', now())
where external_id = 'dgl-valorant-championship-2'
  and slug = 'valorant-2'
  and status = 'registration_closed';

commit;
