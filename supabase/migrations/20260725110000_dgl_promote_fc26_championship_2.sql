-- Promotes DGL FC 26 Championship #2 to Main Event, now that CS2
-- Championship #1 has concluded (see 20260725100000).
--
-- Reuses the existing promote_next_tournament(uuid) admin action
-- (20260716100000_dgl_next_tournament_lifecycle.sql) instead of hand-editing
-- status/is_featured directly:
--   - sets status = 'registration_open' (registrations open for #2)
--   - sets is_featured = true (enforce_single_featured_tournament trigger
--     automatically unfeatures whichever tournament currently holds it)
--
-- Guarded to only run while the tournament is still 'coming_soon', so this
-- migration is safe to re-run / re-apply without erroring.

begin;

do $$
declare
  v_id uuid;
  v_status public.dgl_tournament_status;
begin
  select id, status
    into v_id, v_status
  from public.tournaments
  where external_id = 'dgl-fc26-championship-2';

  if v_id is not null and v_status = 'coming_soon' then
    perform public.promote_next_tournament(v_id);
  end if;
end $$;

commit;
