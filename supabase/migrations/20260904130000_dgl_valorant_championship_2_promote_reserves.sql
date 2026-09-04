-- Valorant Championship #2 — promote 2 existing reserves into main.
--
-- Tournament: dgl-valorant-championship-2 / slug valorant-2
-- Rows (existing waitlist registrations only):
--   naveen.v4  c38c3435-d5db-49a0-97a7-4a6fecfd63c0
--   Lynxcreed  7a0d4a0c-dd2e-433a-aa33-5a7a49f52f0e
--
-- Mirrors dgl_promote_reserve_registration fields (status, confirmed_at,
-- updated_at) without requiring an admin JWT (migration context).
-- Does NOT insert or delete registration rows.
-- Does NOT touch: capacity, status, featured flag, dates, prize, format,
-- other tournaments, player identities, or the existing 40 confirmed rows.

begin;

do $$
declare
  v_updated integer;
begin
  update public.tournament_registrations as tr
  set
    status = 'confirmed',
    confirmed_at = coalesce(tr.confirmed_at, timezone('utc', now())),
    updated_at = timezone('utc', now())
  where tr.id in (
      'c38c3435-d5db-49a0-97a7-4a6fecfd63c0',
      '7a0d4a0c-dd2e-433a-aa33-5a7a49f52f0e'
    )
    and tr.status = 'waitlist'
    and exists (
      select 1
      from public.tournaments t
      where t.id = tr.tournament_id
        and t.external_id = 'dgl-valorant-championship-2'
        and t.slug = 'valorant-2'
    )
    and exists (
      select 1
      from public.players p
      where p.id = tr.player_id
        and p.display_name_key in ('naveen.v4', 'lynxcreed')
    );

  get diagnostics v_updated = row_count;
  if v_updated is distinct from 2 then
    raise exception
      'Expected to promote exactly 2 waitlist rows, updated %',
      v_updated;
  end if;
end $$;

commit;
