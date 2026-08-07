-- Rocket League Championship #1: free entry (pre-tournament refinement).
-- Prize pool, registration, reserve, limit, and lifecycle unchanged.

begin;

update public.tournaments
set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('entry_fee', 'Free'),
    updated_at = timezone('utc', now())
where external_id = 'dgl-rocket-league-championship-1'
  and coalesce(metadata->>'entry_fee', '') is distinct from 'Free';

commit;
