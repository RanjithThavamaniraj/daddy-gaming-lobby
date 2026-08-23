-- Valorant Signature Championship #2 — capacity 30+4, match type Knockout.
--
-- Updates ONLY dgl-valorant-championship-2 (Tournament #9, slug valorant-2).
-- Does NOT open registration, change status, prize pool, featured flag, or date/time.
-- Idempotent: safe to run more than once.
--
-- Does NOT touch: Marvel Rivals, F1, FC26, completed tournaments, other Valorant events.

begin;

update public.tournaments
set
  format = '5v5',
  match_type = 'Knockout',
  registration_limit = 30,
  reserve_limit = 4,
  updated_at = timezone('utc', now())
where external_id = 'dgl-valorant-championship-2'
  and slug = 'valorant-2'
  and (
    format is distinct from '5v5'
    or match_type is distinct from 'Knockout'
    or registration_limit is distinct from 30
    or reserve_limit is distinct from 4
  );

commit;
