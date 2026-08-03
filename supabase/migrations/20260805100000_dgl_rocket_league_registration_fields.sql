-- Rocket League Championship #1 registration overhaul:
--   - Tournament details: 2v2, 16 players / 8 teams, Single Elimination,
--     5-minute matches, unlimited overtime.
--   - New registration fields (Rocket League Rank, Epic ID, team/solo mode)
--     for the 2v2 team registration flow.
--
-- Purely additive: every new column is nullable or has a safe default, so
-- existing tournament_registrations rows (any tournament) are untouched and
-- keep working exactly as before.

begin;

-- ---------------------------------------------------------------------------
-- 1. New registration fields — additive only.
-- ---------------------------------------------------------------------------

alter table public.tournament_registrations
  add column if not exists epic_id text,
  add column if not exists rocket_league_rank text,
  add column if not exists team_name text,
  add column if not exists needs_teammate boolean not null default false,
  add column if not exists teammate_display_name text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'tournament_registrations_rocket_league_rank_check'
  ) then
    alter table public.tournament_registrations
      add constraint tournament_registrations_rocket_league_rank_check
      check (
        rocket_league_rank is null or rocket_league_rank in (
          'Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond',
          'Champion', 'Grand Champion', 'Supersonic Legend'
        )
      );
  end if;
end $$;

comment on column public.tournament_registrations.epic_id is
  'Epic Games account ID — currently required for Rocket League tournaments only.';
comment on column public.tournament_registrations.rocket_league_rank is
  'Self-reported competitive rank — currently required for Rocket League tournaments only.';
comment on column public.tournament_registrations.team_name is
  'Optional team name for team-mode registrations (2v2, etc).';
comment on column public.tournament_registrations.needs_teammate is
  'True when a solo registrant has no teammate yet and needs DGL to pair them.';
comment on column public.tournament_registrations.teammate_display_name is
  'Teammate''s display name, provided by the registering player in team mode. Not a separate registration.';

-- ---------------------------------------------------------------------------
-- 2. Tournament detail updates for DGL Rocket League Championship #1 —
--    copy-only, no status change.
-- ---------------------------------------------------------------------------

update public.tournaments
set match_type = 'Single Elimination',
    registration_limit = 16,
    metadata = metadata || jsonb_build_object(
      'team_limit', 8,
      'match_duration', '5 Minutes',
      'overtime_rule', 'Unlimited Overtime (default Rocket League rules)'
    )
where external_id = 'dgl-rocket-league-championship-1';

commit;
