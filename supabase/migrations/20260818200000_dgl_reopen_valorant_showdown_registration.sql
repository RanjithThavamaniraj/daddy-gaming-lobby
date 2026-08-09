-- Reopen Valorant Saturday Showdown #1 registration after capacity expand.
--
-- Status only: registration_closed → registration_open.
-- Does NOT insert community_activity (registration_opened already exists —
-- avoid a duplicate Discord announcement).
-- Does NOT change: registration_limit, reserve_limit, registrations,
-- format, teams, bracket, points, results.

begin;

update public.tournaments
set
  status = 'registration_open',
  updated_at = timezone('utc', now())
where slug = 'valorant-saturday-showdown-1'
  and external_id = 'dgl-valorant-saturday-showdown-1'
  and status = 'registration_closed';

commit;
