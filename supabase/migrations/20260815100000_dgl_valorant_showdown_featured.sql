-- Promote Valorant Saturday Showdown #1 to Main Event (is_featured).
-- Marvel Rivals Saturday Showdown #2 remains the Next Tournament
-- (registration_open, not featured).
--
-- Root cause: selectFeaturedTournament falls through to "Registrations Open"
-- before "Registrations Closed" when no tournament has is_featured=true.
-- After Rocket League completed with is_featured=false, Marvel (open)
-- incorrectly became Main Event ahead of Valorant (closed).

begin;

update public.tournaments
set is_featured = true,
    updated_at = timezone('utc', now())
where slug = 'valorant-saturday-showdown-1'
  and external_id = 'dgl-valorant-saturday-showdown-1'
  and is_featured is distinct from true;

update public.tournaments
set is_featured = false,
    updated_at = timezone('utc', now())
where slug = 'marvel-rivals-saturday-showdown-2'
  and external_id = 'dgl-marvel-rivals-saturday-showdown-2'
  and is_featured is distinct from false;

-- Ensure no other active tournament is accidentally featured.
update public.tournaments
set is_featured = false,
    updated_at = timezone('utc', now())
where slug not in ('valorant-saturday-showdown-1')
  and is_featured = true;

commit;
