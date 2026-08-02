-- DGL community giveaways (Phase G1)
-- Admin-managed giveaways with eligibility from tournament registrations.
-- No public policies — website admin is the source of truth.

do $$ begin
  create type public.dgl_giveaway_status as enum (
    'draft',
    'published',
    'entries_closed',
    'winner_selected',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

begin;

create table if not exists public.giveaways (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  reason text,
  description text,
  prize text not null,
  rules text,
  status public.dgl_giveaway_status not null default 'draft',
  eligible_tournament_ids uuid[] not null default '{}'::uuid[],
  entries_close_at timestamptz,
  draw_at timestamptz,
  winner_player_id uuid references public.players (id) on delete set null,
  winner_name text,
  winner_discord_name text,
  winner_notes text,
  published_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  is_archived boolean not null default false,
  constraint giveaways_title_not_blank check (length(btrim(title)) > 0),
  constraint giveaways_prize_not_blank check (length(btrim(prize)) > 0)
);

create index if not exists giveaways_status_idx
  on public.giveaways (status)
  where is_archived = false;

create index if not exists giveaways_archived_idx
  on public.giveaways (is_archived)
  where is_archived = true;

create index if not exists giveaways_created_at_idx
  on public.giveaways (created_at desc);

drop trigger if exists giveaways_set_updated_at on public.giveaways;
create trigger giveaways_set_updated_at
  before update on public.giveaways
  for each row execute function public.dgl_set_updated_at();

comment on table public.giveaways is
  'DGL community reward giveaways. Eligibility is computed from tournament_registrations for eligible_tournament_ids.';

comment on column public.giveaways.eligible_tournament_ids is
  'Official tournament UUIDs whose registered players form the distinct eligible pool.';

comment on column public.giveaways.winner_player_id is
  'Official winner recorded after an external Wheel of Names draw. Must be in the eligible set.';

alter table public.giveaways enable row level security;

drop policy if exists "giveaways_admin_select" on public.giveaways;
create policy "giveaways_admin_select"
  on public.giveaways for select
  to authenticated
  using (public.is_dgl_admin());

drop policy if exists "giveaways_admin_insert" on public.giveaways;
create policy "giveaways_admin_insert"
  on public.giveaways for insert
  to authenticated
  with check (public.is_dgl_admin());

drop policy if exists "giveaways_admin_update" on public.giveaways;
create policy "giveaways_admin_update"
  on public.giveaways for update
  to authenticated
  using (public.is_dgl_admin())
  with check (public.is_dgl_admin());

drop policy if exists "giveaways_admin_delete" on public.giveaways;
create policy "giveaways_admin_delete"
  on public.giveaways for delete
  to authenticated
  using (public.is_dgl_admin());

commit;
