-- DGL schema extension — migration 6 of 8
-- Community activity feed and platform announcements.

begin;

create table if not exists public.platform_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  tag text,
  icon text,
  highlights jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  is_pinned boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists platform_updates_published_idx
  on public.platform_updates (is_published, published_at desc nulls last);

drop trigger if exists platform_updates_set_updated_at on public.platform_updates;
create trigger platform_updates_set_updated_at
  before update on public.platform_updates
  for each row execute function public.dgl_set_updated_at();

create table if not exists public.community_activity (
  id uuid primary key default gen_random_uuid(),
  activity_type public.dgl_activity_type not null,
  title text not null,
  summary text,
  tournament_id uuid references public.tournaments (id) on delete set null,
  player_id uuid references public.players (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists community_activity_public_timeline_idx
  on public.community_activity (is_public, occurred_at desc);

create index if not exists community_activity_tournament_idx
  on public.community_activity (tournament_id);

-- Emit activity when a tournament completes
create or replace function public.dgl_log_tournament_completed_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed'::public.dgl_tournament_status
     and (old.status is distinct from new.status) then
    insert into public.community_activity (
      activity_type,
      title,
      summary,
      tournament_id,
      payload,
      occurred_at
    )
    values (
      'tournament_completed',
      format('🏆 %s completed', new.championship_label),
      coalesce(new.completed_date_label, 'Recent'),
      new.id,
      jsonb_build_object(
        'global_number', new.global_number,
        'slug', new.slug,
        'prize_pool_display', new.prize_pool_display
      ),
      coalesce(new.completed_at, timezone('utc', now()))
    );
  end if;

  return new;
end;
$$;

drop trigger if exists tournaments_log_completed_activity on public.tournaments;
create trigger tournaments_log_completed_activity
  after update of status on public.tournaments
  for each row execute function public.dgl_log_tournament_completed_activity();

commit;
