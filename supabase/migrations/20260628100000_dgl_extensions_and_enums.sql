-- DGL schema extension — migration 1 of 8
-- Extends the existing Supabase project. Does NOT drop or replace legacy tables.
--
-- Known legacy table (created outside this repo, Valorant registration flow):
--   public.registrations (
--     id, discord_name, valorant_ign, rank, created_at
--   )
--   Unique constraint on discord_name was used by the original app (Postgres 23505).
-- This migration leaves public.registrations untouched.

begin;

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.dgl_game_status as enum (
    'available',
    'coming_soon',
    'planned',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_participation_mode as enum (
    'solo',
    'team'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_tournament_status as enum (
    'draft',
    'coming_soon',
    'registration_open',
    'active',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_registration_status as enum (
    'pending',
    'confirmed',
    'waitlist',
    'withdrawn',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_team_member_role as enum (
    'captain',
    'member',
    'substitute',
    'coach'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_placement_entity_type as enum (
    'player',
    'team'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_points_reason as enum (
    'champion',
    'runner_up',
    'third_place',
    'bonus',
    'adjustment',
    'revoked'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_activity_type as enum (
    'platform_update',
    'tournament_announced',
    'registration_opened',
    'registration_closed',
    'tournament_started',
    'tournament_completed',
    'champion_crowned',
    'points_awarded',
    'player_registered'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.dgl_recurrence_cadence as enum (
    'one_off',
    'weekly',
    'monthly',
    'seasonal',
    'custom'
  );
exception
  when duplicate_object then null;
end $$;

-- Shared updated_at trigger helper
create or replace function public.dgl_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

comment on function public.dgl_set_updated_at() is
  'Maintains updated_at on DGL tables.';

commit;
