-- Valorant Saturday Showdown #1 — main capacity 16 → 22 ONLY.
--
-- Does NOT touch:
--   tournament_registrations (including the 2 existing waitlist rows)
--   reserve_limit (remains 4)
--   status / lifecycle / featured flags
--   players / results / fixtures

begin;

update public.tournaments
set registration_limit = 22,
    updated_at = timezone('utc', now())
where slug = 'valorant-saturday-showdown-1'
  and external_id = 'dgl-valorant-saturday-showdown-1'
  and registration_limit = 16;

-- Guard: if the row was not at 16, this update matches 0 rows (safe no-op).

commit;
