-- Opens CS2 Championship #1 registration.
--
-- The client (commit 7fde6fd) already generalized the registration flow and
-- updated the offline fallback registry to show CS2 as Registrations Open —
-- but this app always prefers live Supabase data when reachable
-- (useSupabaseData(fallback, liveFetcher)), so the tournament stayed on
-- "Coming Soon" in production until the source-of-truth row itself is
-- updated. This migration brings Supabase in line with the registry.

begin;

update public.tournaments
set status = 'registration_open',
    slug = 'cs2-1',
    match_type = 'Best of 3',
    prize_pool_display = '₹2,000 Team Prize',
    registration_limit = 10,
    starts_at = timestamptz '2026-07-25 19:30:00+00',
    metadata = metadata || jsonb_build_object('entry_fee', 'Free')
where external_id = 'dgl-cs2-championship-1';

commit;
