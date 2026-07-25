-- Fixes the Homepage "Prize Pool Awarded" stat undercounting completed
-- tournaments.
--
-- Root cause: get_platform_stats() / get_home_community_proof_stats() sum
-- the numeric prize_pool_amount column (public.tournaments), but every
-- results/prize migration since the initial seed (FC 26 #1 results, CS2 #1
-- results, the FC 26 #2 prize update) only ever set prize_pool_display
-- (text) and never prize_pool_amount. sum(...) silently skips nulls, so
-- CS2 Championship #1's ₹2,000 win dropped out of the total without error
-- — the aggregate itself was already correctly generic (sums ALL completed
-- tournaments), the underlying data just had a hole in it.
--
-- Fix, two parts:
--   1. One-time backfill — derive prize_pool_amount from prize_pool_display
--      for every row where the numeric column is missing.
--   2. A trigger that keeps doing this automatically on every future
--      insert/update, so writing a migration that only sets
--      prize_pool_display (the common case — see CS2 #1 results) can never
--      again silently zero out the homepage total.

begin;

-- ---------------------------------------------------------------------------
-- 1. Backfill existing rows (mirrors the client-side parsePrizePoolAmount
--    logic in src/lib/tournamentStats.js: strip everything but digits).
-- ---------------------------------------------------------------------------

update public.tournaments
set prize_pool_amount = nullif(regexp_replace(prize_pool_display, '[^0-9]', '', 'g'), '')::numeric
where prize_pool_amount is null
  and prize_pool_display is not null
  and regexp_replace(prize_pool_display, '[^0-9]', '', 'g') <> '';

-- ---------------------------------------------------------------------------
-- 2. Trigger — auto-derive prize_pool_amount whenever it's left null but a
--    display string is present. Never overwrites an explicitly set amount.
-- ---------------------------------------------------------------------------

create or replace function public.dgl_derive_prize_pool_amount()
returns trigger
language plpgsql
as $$
begin
  if new.prize_pool_amount is null and new.prize_pool_display is not null then
    new.prize_pool_amount := nullif(
      regexp_replace(new.prize_pool_display, '[^0-9]', '', 'g'),
      ''
    )::numeric;
  end if;
  return new;
end;
$$;

drop trigger if exists dgl_derive_prize_pool_amount_trigger on public.tournaments;

create trigger dgl_derive_prize_pool_amount_trigger
  before insert or update of prize_pool_display, prize_pool_amount
  on public.tournaments
  for each row
  execute function public.dgl_derive_prize_pool_amount();

commit;
