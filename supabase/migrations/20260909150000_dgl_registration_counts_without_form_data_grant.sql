-- Restore anon SELECT on v_tournaments_enriched after Wave B #7.
--
-- Wave B #7 taught v_tournament_registration_counts (security_invoker) to
-- read form_data->>'roster_role'. Phase 1 does not grant anon SELECT on
-- form_data, so select('*') on v_tournaments_enriched started failing.
--
-- Fix: classify substitutes inside a narrow SECURITY DEFINER SQL function
-- that returns only the existing count columns. The public view stays
-- security_invoker and still does not expose form_data.
--
-- Does not grant form_data. Does not modify Phase 1. Does not touch Discord.

begin;

create or replace function public.dgl_tournament_registration_counts()
returns table (
  tournament_id uuid,
  registered_count integer,
  confirmed_count integer,
  waitlist_count integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    tr.tournament_id,
    count(*) filter (
      where tr.status in ('pending', 'confirmed', 'waitlist')
    )::integer as registered_count,
    count(*) filter (
      where tr.status = 'confirmed'
        and coalesce(tr.form_data->>'roster_role', '') is distinct from 'substitute'
    )::integer as confirmed_count,
    count(*) filter (
      where tr.status = 'waitlist'
    )::integer as waitlist_count
  from public.tournament_registrations tr
  group by tr.tournament_id;
$$;

comment on function public.dgl_tournament_registration_counts() is
  'Aggregate registration headcount. confirmed_count excludes substitute roster_role. Does not return form_data.';

revoke all on function public.dgl_tournament_registration_counts() from public;
grant execute on function public.dgl_tournament_registration_counts()
  to anon, authenticated, service_role;

create or replace view public.v_tournament_registration_counts
with (security_invoker = true) as
select
  tournament_id,
  registered_count,
  confirmed_count,
  waitlist_count
from public.dgl_tournament_registration_counts();

comment on view public.v_tournament_registration_counts is
  'Active headcount per tournament. confirmed_count excludes substitute roster_role. Reads registrations through dgl_tournament_registration_counts().';

grant select on public.v_tournament_registration_counts to anon, authenticated;

commit;
