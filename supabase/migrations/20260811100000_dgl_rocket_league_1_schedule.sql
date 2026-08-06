-- Set Rocket League Championship #1 (Tournament #5) schedule.
-- 8 Aug 2026, 7:00 PM IST = 2026-08-08 13:30:00 UTC.
-- starts_at was never populated when the tournament was seeded.

begin;

update public.tournaments
set
  starts_at = timestamptz '2026-08-08 13:30:00+00',
  updated_at = timezone('utc', now())
where slug = 'rocket-league-1'
  and (
    starts_at is distinct from timestamptz '2026-08-08 13:30:00+00'
  );

commit;
