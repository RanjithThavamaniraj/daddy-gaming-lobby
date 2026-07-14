-- Homepage Featured Games badges: CS2 and FC 26 are live (CS2 registration
-- open, FC 26 completed) but the `games.status` column — a separate field
-- from `tournaments.status`, read only by the homepage Featured Games section
-- (src/lib/supabase/mapGames.js) — was never updated to match, so both still
-- showed "Coming Soon". Marking them available makes the existing green
-- badge render for them exactly as it does for Valorant, with no UI change.

begin;

update public.games
set status = 'available'
where slug in ('cs2', 'fc-26');

commit;
