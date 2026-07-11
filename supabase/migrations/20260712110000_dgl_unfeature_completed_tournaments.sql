-- Completed tournaments should never hold the Main Event slot.
--
-- FC 26 Championship #1 kept is_featured = true after completion, pinning it
-- as the Main Event. Clearing the flag lets selectFeaturedTournament's
-- status-driven priority (Live → Registrations Open → Registrations Closed →
-- Coming Soon → Latest Completed) promote the next event automatically —
-- currently CS2 Championship #1 (coming_soon). No manual UI changes needed.

begin;

update public.tournaments
set is_featured = false
where is_featured = true
  and status = 'completed';

commit;
