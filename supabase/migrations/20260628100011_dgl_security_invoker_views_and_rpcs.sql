-- DGL security hardening — views and RPCs
-- Converts public API views/RPCs to SECURITY INVOKER so RLS applies to anon/authenticated.
-- Keeps SECURITY DEFINER only on internal trigger helpers that must write system tables.

begin;

-- ---------------------------------------------------------------------------
-- Views: enforce security_invoker (Splinter 0010 — security definer view)
-- ---------------------------------------------------------------------------

alter view public.v_tournament_registration_counts set (security_invoker = true);
alter view public.v_tournaments_enriched set (security_invoker = true);
alter view public.v_hall_of_champions set (security_invoker = true);
alter view public.v_player_leaderboard set (security_invoker = true);
alter view public.v_tournament_results set (security_invoker = true);

do $$
begin
  if to_regclass('public.v_legacy_registrations') is not null then
    execute 'alter view public.v_legacy_registrations set (security_invoker = true)';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Public RPCs: SECURITY INVOKER (aggregate only public RLS-visible rows)
-- ---------------------------------------------------------------------------

alter function public.get_platform_stats() security invoker;
alter function public.get_home_community_proof_stats() security invoker;
alter function public.get_home_community_proof() security invoker;

-- ---------------------------------------------------------------------------
-- Internal trigger functions: keep SECURITY DEFINER, revoke API execution
-- (must write ledger/summary/activity without granting anon INSERT policies)
-- ---------------------------------------------------------------------------

revoke all on function public.dgl_refresh_player_points_summary(uuid)
  from public, anon, authenticated;

revoke all on function public.dgl_sync_points_for_player_placement()
  from public, anon, authenticated;

revoke all on function public.dgl_log_tournament_completed_activity()
  from public, anon, authenticated;

commit;
