-- Valorant Saturday Showdown #1 — start 8:00 PM IST → 3:00 PM IST.
--
-- 15 Aug 2026 15:00 Asia/Kolkata = 2026-08-15 09:30:00+00
-- Updates ONLY tournaments.starts_at. No ends_at column exists; metadata
-- has no match_duration. Status, limits, registrations, format, points,
-- community_activity, and other dates are untouched.

begin;

update public.tournaments
set
  starts_at = timestamptz '2026-08-15 09:30:00+00',
  updated_at = timezone('utc', now())
where slug = 'valorant-saturday-showdown-1'
  and external_id = 'dgl-valorant-saturday-showdown-1'
  and starts_at is distinct from timestamptz '2026-08-15 09:30:00+00';

commit;
