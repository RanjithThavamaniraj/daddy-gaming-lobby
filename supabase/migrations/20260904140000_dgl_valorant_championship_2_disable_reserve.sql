-- Valorant Championship #2 — disable reserve/waitlist for this event only.
--
-- Tournament: dgl-valorant-championship-2 / slug valorant-2
-- Sets reserve_limit 4 → 0.
--
-- Does NOT change: registration_limit, status, featured flag, dates, prize,
-- format, registrations, player records, or any other tournament.
-- Does NOT reopen registration.
-- Existing waitlist-assignment logic already skips reserve when
-- reserve_limit is 0 (dgl_assign_registration_status).

begin;

update public.tournaments
set
  reserve_limit = 0,
  updated_at = timezone('utc', now())
where external_id = 'dgl-valorant-championship-2'
  and slug = 'valorant-2'
  and reserve_limit is distinct from 0;

commit;
