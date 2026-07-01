-- Migration: enforce_single_featured_tournament
-- Ensures at most one tournament can have is_featured = true at any time.
--
-- Approach:
--   An AFTER INSERT OR UPDATE trigger fires when is_featured is set to true
--   and automatically unfeatures all other tournaments. The trigger's WHEN
--   clause (NEW.is_featured = true) prevents recursion and ensures the
--   function only runs when something actually needs to be unfeatured.
--
--   A one-time UPDATE normalizes existing data before the trigger is applied,
--   keeping only the most recently created featured tournament.
--
-- Limitations:
--   Two concurrent transactions that both set is_featured = true on
--   different tournaments can temporarily race; the last trigger to commit
--   wins. This is acceptable for DGL's usage pattern — simultaneous
--   featured-tournament changes are extremely rare and the window is brief.

-- ── 1. Normalize existing data ──────────────────────────────────────────────
-- Keep only the newest featured tournament; unfeature all others.
update public.tournaments
set is_featured = false
where is_featured = true
  and id != (
    select id
    from public.tournaments
    where is_featured = true
    order by created_at desc, id desc
    limit 1
  );

-- ── 2. Trigger function ─────────────────────────────────────────────────────
create or replace function public.enforce_single_featured_tournament()
returns trigger
language plpgsql
as $$
begin
  update public.tournaments
  set is_featured = false
  where is_featured = true
    and id != new.id;
  return new;
end;
$$;

-- ── 3. Trigger ──────────────────────────────────────────────────────────────
-- Fires after INSERT or UPDATE of is_featured, but only when the new value
-- is true.  The WHEN clause eliminates recursion because updates issued by
-- the trigger itself always set is_featured = false.
drop trigger if exists enforce_single_featured_tournament_trigger
  on public.tournaments;

create trigger enforce_single_featured_tournament_trigger
  after insert or update of is_featured
  on public.tournaments
  for each row
  when (new.is_featured = true)
  execute function public.enforce_single_featured_tournament();
