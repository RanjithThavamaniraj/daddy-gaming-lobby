-- Valorant Signature Championship #2 — capacity 30 → 40 (8×5v5 knockout).
--
-- Updates ONLY dgl-valorant-championship-2 (Tournament #9, slug valorant-2).
-- Changes ONLY registration_limit; format, match_type, reserve_limit, status,
-- featured flag, prize pool, and date/time are already correct in production.
-- Idempotent: safe to run more than once.
--
-- Does NOT touch: Marvel Rivals, F1, FC26, completed tournaments, other Valorant events.
-- Does NOT open registration.

begin;

update public.tournaments
set
  registration_limit = 40,
  updated_at = timezone('utc', now())
where external_id = 'dgl-valorant-championship-2'
  and slug = 'valorant-2'
  and registration_limit is distinct from 40;

commit;
