-- DGL admin foundation (Phase 1)
-- Additive only: admin membership, archive flag, audit log, activity types,
-- admin write RLS, Realtime prep for community_activity.
--
-- Does NOT change public tournament SELECT policy (drafts stay hidden;
-- archived filtering is application-layer in a later phase).
-- Does NOT modify the tournament_completed activity trigger.

-- ---------------------------------------------------------------------------
-- Activity types for admin + Jarvis event stream
-- (ADD VALUE must run outside an explicit transaction on some PG versions;
--  Supabase CLI wraps migrations — IF NOT EXISTS keeps this idempotent.)
-- ---------------------------------------------------------------------------

alter type public.dgl_activity_type add value if not exists 'tournament_created';
alter type public.dgl_activity_type add value if not exists 'tournament_updated';
alter type public.dgl_activity_type add value if not exists 'tournament_cancelled';
alter type public.dgl_activity_type add value if not exists 'tournament_featured';
alter type public.dgl_activity_type add value if not exists 'tournament_archived';
alter type public.dgl_activity_type add value if not exists 'leaderboard_updated';
alter type public.dgl_activity_type add value if not exists 'hall_of_fame_updated';
alter type public.dgl_activity_type add value if not exists 'giveaway_created';
alter type public.dgl_activity_type add value if not exists 'giveaway_completed';

begin;

-- ---------------------------------------------------------------------------
-- Admin membership
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.admin_users is
  'Authenticated users allowed to manage DGL tournaments via the admin dashboard.';

alter table public.admin_users enable row level security;

create or replace function public.is_dgl_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

comment on function public.is_dgl_admin() is
  'True when the current auth.uid() is listed in admin_users. Used by RLS.';

revoke all on function public.is_dgl_admin() from public;
grant execute on function public.is_dgl_admin() to anon, authenticated;

-- Admins can list membership; any user can read their own row (membership check).
drop policy if exists "admin_users_select_self_or_admin" on public.admin_users;
create policy "admin_users_select_self_or_admin"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid() or public.is_dgl_admin());

-- Membership writes: service role / SQL Editor for bootstrap; admins can manage after.
drop policy if exists "admin_users_admin_insert" on public.admin_users;
create policy "admin_users_admin_insert"
  on public.admin_users for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "admin_users_admin_update" on public.admin_users;
create policy "admin_users_admin_update"
  on public.admin_users for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "admin_users_admin_delete" on public.admin_users;
create policy "admin_users_admin_delete"
  on public.admin_users for delete
  to authenticated
  using (public.is_dgl_admin());

-- ---------------------------------------------------------------------------
-- Tournaments: archive + attribution
-- ---------------------------------------------------------------------------

alter table public.tournaments
  add column if not exists is_archived boolean not null default false;

alter table public.tournaments
  add column if not exists created_by uuid references auth.users (id) on delete set null;

alter table public.tournaments
  add column if not exists updated_by uuid references auth.users (id) on delete set null;

comment on column public.tournaments.is_archived is
  'When true, application-layer lists may hide this tournament. Not enforced by public RLS.';

comment on column public.tournaments.created_by is
  'Auth user who created the tournament (admin session).';

comment on column public.tournaments.updated_by is
  'Auth user who last updated the tournament (admin session).';

create index if not exists tournaments_is_archived_idx
  on public.tournaments (is_archived)
  where is_archived = true;

create index if not exists tournaments_created_by_idx
  on public.tournaments (created_by)
  where created_by is not null;

-- ---------------------------------------------------------------------------
-- Admin audit log
-- ---------------------------------------------------------------------------

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null default 'tournament',
  entity_id uuid,
  tournament_id uuid references public.tournaments (id) on delete set null,
  old_value jsonb not null default '{}'::jsonb,
  new_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.admin_audit_log is
  'Append-only record of important admin actions for troubleshooting.';

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_admin_user_idx
  on public.admin_audit_log (admin_user_id, created_at desc);

create index if not exists admin_audit_log_tournament_idx
  on public.admin_audit_log (tournament_id, created_at desc)
  where tournament_id is not null;

alter table public.admin_audit_log enable row level security;

drop policy if exists "admin_audit_log_admin_select" on public.admin_audit_log;
create policy "admin_audit_log_admin_select"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_dgl_admin());

drop policy if exists "admin_audit_log_admin_insert" on public.admin_audit_log;
create policy "admin_audit_log_admin_insert"
  on public.admin_audit_log for insert
  to authenticated
  with check (public.is_dgl_admin());

-- No update/delete policies — audit log is append-only for authenticated roles.

-- ---------------------------------------------------------------------------
-- Admin write policies (public read policies unchanged)
-- Multiple permissive SELECT policies are OR'd — admins see drafts; public does not.
-- ---------------------------------------------------------------------------

drop policy if exists "tournaments_admin_select" on public.tournaments;
create policy "tournaments_admin_select"
  on public.tournaments for select
  to authenticated
  using (public.is_dgl_admin());

drop policy if exists "tournaments_admin_insert" on public.tournaments;
create policy "tournaments_admin_insert"
  on public.tournaments for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "tournaments_admin_update" on public.tournaments;
create policy "tournaments_admin_update"
  on public.tournaments for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "tournaments_admin_delete" on public.tournaments;
create policy "tournaments_admin_delete"
  on public.tournaments for delete
  to authenticated
  using (public.is_dgl_admin());

-- Community activity: admins insert events for Jarvis / site feed.
-- tournament_completed remains owned by the existing trigger.
drop policy if exists "community_activity_admin_insert" on public.community_activity;
create policy "community_activity_admin_insert"
  on public.community_activity for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "community_activity_admin_select" on public.community_activity;
create policy "community_activity_admin_select"
  on public.community_activity for select
  to authenticated
  using (public.is_dgl_admin());

-- Placements / players: admin writes for Results Editor (Phase 5).
drop policy if exists "tournament_placements_admin_insert" on public.tournament_placements;
create policy "tournament_placements_admin_insert"
  on public.tournament_placements for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "tournament_placements_admin_update" on public.tournament_placements;
create policy "tournament_placements_admin_update"
  on public.tournament_placements for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "tournament_placements_admin_delete" on public.tournament_placements;
create policy "tournament_placements_admin_delete"
  on public.tournament_placements for delete
  to authenticated
  using (public.is_dgl_admin());

drop policy if exists "players_admin_update" on public.players;
create policy "players_admin_update"
  on public.players for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

-- Series writes for create/duplicate flows that attach series_id.
drop policy if exists "tournament_series_admin_insert" on public.tournament_series;
create policy "tournament_series_admin_insert"
  on public.tournament_series for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "tournament_series_admin_update" on public.tournament_series;
create policy "tournament_series_admin_update"
  on public.tournament_series for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

-- ---------------------------------------------------------------------------
-- Realtime: Jarvis primary event source (website does not depend on this)
-- ---------------------------------------------------------------------------

do $$
begin
  alter publication supabase_realtime add table public.community_activity;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'supabase_realtime publication not found — skip Realtime registration';
  when others then
    -- Already a member of the publication
    if sqlerrm ilike '%already member%' then
      null;
    else
      raise;
    end if;
end $$;

commit;
