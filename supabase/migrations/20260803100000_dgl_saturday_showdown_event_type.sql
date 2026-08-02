-- Introduces DGL Saturday Showdown as a second permanent event series,
-- alongside DGL Championship. This is a new dimension (event_type) on
-- tournament_series, not a replacement for anything — every existing
-- series defaults to 'championship', so all current tournaments are
-- unaffected.
--
-- Also fixes a latent numbering bug this feature would otherwise expose:
-- game_championship_number was scoped per-game, not per-series. With only
-- one series per game so far that was invisible, but a Valorant Saturday
-- Showdown alongside the existing Valorant Championship would have been
-- mislabeled "Championship #2". Numbering is now scoped per series.

begin;

-- ---------------------------------------------------------------------------
-- 1. Event type enum + column on tournament_series
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.dgl_event_type as enum ('championship', 'saturday_showdown');
exception
  when duplicate_object then null;
end $$;

alter table public.tournament_series
  add column if not exists event_type public.dgl_event_type not null default 'championship';

-- ---------------------------------------------------------------------------
-- 2. Per-series numbering (was per-game)
-- ---------------------------------------------------------------------------

create or replace function public.dgl_assign_game_championship_number()
returns trigger
language plpgsql
as $$
begin
  if new.game_championship_number is null then
    select coalesce(max(t.game_championship_number), 0) + 1
      into new.game_championship_number
    from public.tournaments t
    where t.series_id = new.series_id
      and t.global_number < new.global_number;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. v_tournaments_enriched — join series, expose event_type, and make
--    championship_name event-type-aware ("Championship" vs "Saturday
--    Showdown"). event_type is appended as a new trailing column;
--    championship_name keeps its existing name/position/type, only its
--    computation changes, both of which "create or replace view" allows.
-- ---------------------------------------------------------------------------

create or replace view public.v_tournaments_enriched
with (security_invoker = true) as
select
  t.id,
  t.global_number,
  t.game_championship_number,
  t.external_id,
  t.slug,
  t.championship_label,
  format('Tournament #%s', t.global_number) as tournament_number,
  case ts.event_type
    when 'saturday_showdown' then
      format('DGL %s Saturday Showdown #%s', t.championship_label, t.game_championship_number)
    else
      format('DGL %s Championship #%s', t.championship_label, t.game_championship_number)
  end as championship_name,
  g.slug as game_slug,
  g.name as game_name,
  g.accent_color as game_accent,
  t.participation_mode,
  t.format,
  t.match_type,
  t.status,
  t.prize_pool_display,
  t.prize_pool_amount,
  t.prize_pool_currency,
  t.accent_color,
  t.registration_limit,
  t.registration_opens_at,
  t.registration_closes_at,
  t.starts_at,
  t.completed_at,
  t.completed_date_label,
  t.is_featured,
  t.series_id,
  t.metadata,
  t.created_at,
  t.updated_at,
  coalesce(rc.registered_count, 0) as registered_count,
  coalesce(ts.event_type, 'championship'::public.dgl_event_type) as event_type
from public.tournaments t
join public.games g on g.id = t.game_id
left join public.tournament_series ts on ts.id = t.series_id
left join public.v_tournament_registration_counts rc
  on rc.tournament_id = t.id;

-- ---------------------------------------------------------------------------
-- 4. v_tournament_results — append event_type so the results page can show
--    "🏆 Championship" / "⚡ Saturday Showdown" near the title.
-- ---------------------------------------------------------------------------

create or replace view public.v_tournament_results
with (security_invoker = true) as
select
  te.id as tournament_id,
  te.slug,
  te.championship_name,
  te.tournament_number,
  te.game_slug,
  te.game_name,
  te.format,
  te.match_type,
  te.status,
  te.completed_date_label,
  te.prize_pool_display,
  te.accent_color,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 1
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as champion_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 2
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as runner_up_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 3
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as third_place_players,
  (
    select max(tp.points_awarded)
    from public.tournament_placements tp
    where tp.tournament_id = te.id
      and tp.placement = 1
      and tp.entity_type = 'player'
  ) as champion_points,
  (
    select max(tp.points_awarded)
    from public.tournament_placements tp
    where tp.tournament_id = te.id
      and tp.placement = 2
      and tp.entity_type = 'player'
  ) as runner_up_points,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 4
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as semi_finalist_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 5
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as quarter_finalist_players,
  coalesce(
    (
      select jsonb_agg(p.display_name order by p.display_name)
      from public.tournament_placements tp
      join public.players p on p.id = tp.player_id
      where tp.tournament_id = te.id
        and tp.placement = 6
        and tp.entity_type = 'player'
    ),
    '[]'::jsonb
  ) as group_stage_players,
  te.event_type
from public.v_tournaments_enriched te;

-- ---------------------------------------------------------------------------
-- 5. DGL Valorant Saturday Showdown #1 — the first Saturday Showdown event.
--    coming_soon, not featured (does not disturb the current Main Event).
-- ---------------------------------------------------------------------------

insert into public.tournament_series (
  slug, name, game_id, cadence, participation_mode, default_format, default_match_type, event_type
)
select
  'valorant-saturday-showdown',
  'DGL Valorant Saturday Showdown',
  g.id,
  'weekly',
  'team',
  '5v5',
  'Knockout',
  'saturday_showdown'
from public.games g
where g.slug = 'valorant'
on conflict (slug) do nothing;

insert into public.tournaments (
  global_number, external_id, slug,
  game_id, series_id, championship_label,
  format, match_type, status,
  accent_color, is_featured,
  metadata
)
select
  6,
  'dgl-valorant-saturday-showdown-1',
  'valorant-saturday-showdown-1',
  g.id,
  ts.id,
  'Valorant',
  '5v5',
  'Knockout',
  'coming_soon',
  g.accent_color,
  false,
  jsonb_build_object('entry_fee', 'Free')
from public.games g
join public.tournament_series ts on ts.slug = 'valorant-saturday-showdown'
where g.slug = 'valorant'
on conflict (external_id) do nothing;

commit;
