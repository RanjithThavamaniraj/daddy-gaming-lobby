-- Populate Valorant Saturday Showdown #1 (Tournament #6) schedule.
-- Points-only showdown: no cash prize_pool_display; entry is Free via metadata.

begin;

update public.tournaments
set
  starts_at = timestamptz '2026-08-15 14:30:00+00', -- 8:00 PM IST
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('entry_fee', 'Free'),
  updated_at = timezone('utc', now())
where slug = 'valorant-saturday-showdown-1'
  and (
    starts_at is distinct from timestamptz '2026-08-15 14:30:00+00'
    or coalesce(metadata->>'entry_fee', '') is distinct from 'Free'
  );

commit;
