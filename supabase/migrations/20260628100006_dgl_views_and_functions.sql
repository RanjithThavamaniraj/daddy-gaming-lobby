-- DGL schema extension — migration 7 of 8
-- Read models, helper functions, and legacy compatibility view.

begin;

-- Enriched tournaments (matches app tournamentModel fields)
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
  format(
    'DGL %s Championship #%s',
    t.championship_label,
    t.game_championship_number
  ) as championship_name,
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
  coalesce(rc.registered_count, 0) as registered_count
from public.tournaments t
join public.games g on g.id = t.game_id
left join public.v_tournament_registration_counts rc
  on rc.tournament_id = t.id;

-- Hall of Champions (placement 1 player rows per completed tournament)
create or replace view public.v_hall_of_champions
with (security_invoker = true) as
select
  te.id as tournament_id,
  te.slug,
  te.global_number,
  te.tournament_number,
  te.championship_name,
  te.game_slug,
  te.game_name,
  te.prize_pool_display,
  te.completed_date_label,
  te.accent_color,
  te.status,
  p.id as player_id,
  p.display_name as player_name,
  tp.points_awarded as dgl_points
from public.v_tournaments_enriched te
join public.tournament_placements tp
  on tp.tournament_id = te.id
 and tp.placement = 1
 and tp.entity_type = 'player'
join public.players p on p.id = tp.player_id
where te.status = 'completed'::public.dgl_tournament_status
order by te.global_number desc, p.display_name;

-- Leaderboard read model
create or replace view public.v_player_leaderboard
with (security_invoker = true) as
select
  row_number() over (
    order by s.total_points desc, s.championships desc, p.display_name asc
  )::integer as rank,
  p.id as player_id,
  p.display_name,
  s.total_points as points,
  s.championships,
  s.runner_up_finishes,
  s.third_place_finishes,
  s.tournaments_played,
  s.last_awarded_at
from public.player_points_summary s
join public.players p on p.id = s.player_id
where s.total_points > 0 or s.tournaments_played > 0;

-- Tournament results bundle (champion + runner-up player names)
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
  ) as third_place_players
from public.v_tournaments_enriched te;

-- Legacy registrations compatibility (read-only; does not modify source table)
do $$
begin
  if to_regclass('public.registrations') is not null then
    execute $view$
      create or replace view public.v_legacy_registrations
      with (security_invoker = true) as
      select
        r.id,
        r.discord_name,
        r.valorant_ign,
        r.rank,
        r.created_at
      from public.registrations r
    $view$;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- RPCs referenced by the frontend config layer
-- ---------------------------------------------------------------------------

create or replace function public.get_platform_stats()
returns jsonb
language sql
stable
set search_path = public
as $$
  with completed as (
    select count(*)::integer as tournaments_hosted
    from public.tournaments
    where status = 'completed'::public.dgl_tournament_status
  ),
  registrations as (
    select count(distinct coalesce(tr.player_id::text, tr.id::text))::integer as registered_players
    from public.tournament_registrations tr
    where tr.status in ('pending', 'confirmed', 'waitlist')
  ),
  points as (
    select coalesce(sum(points_delta), 0)::integer as dgl_points_awarded
    from public.player_points_ledger
  ),
  prizes as (
    select coalesce(sum(prize_pool_amount), 0)::numeric as prize_pool_awarded
    from public.tournaments
    where status = 'completed'::public.dgl_tournament_status
      and prize_pool_amount is not null
  )
  select jsonb_build_object(
    'tournaments_hosted', (select tournaments_hosted from completed),
    'registered_players', (select registered_players from registrations),
    'dgl_points_awarded', (select dgl_points_awarded from points),
    'prize_pool_awarded', (select prize_pool_awarded from prizes)
  );
$$;

create or replace function public.get_home_community_proof_stats()
returns jsonb
language sql
stable
set search_path = public
as $$
  with completed as (
    select count(*)::integer as tournaments_hosted
    from public.tournaments
    where status = 'completed'::public.dgl_tournament_status
  ),
  participants as (
    select count(distinct tp.player_id)::integer as registered_players
    from public.tournament_placements tp
    join public.tournaments t on t.id = tp.tournament_id
    where t.status = 'completed'::public.dgl_tournament_status
      and tp.player_id is not null
  ),
  champions as (
    select count(*)::integer as champions_crowned
    from public.tournament_placements tp
    where tp.placement = 1
      and tp.entity_type = 'player'
  ),
  prizes as (
    select coalesce(sum(prize_pool_amount), 0)::numeric as prize_pool_awarded
    from public.tournaments
    where status = 'completed'::public.dgl_tournament_status
      and prize_pool_amount is not null
  )
  select jsonb_build_object(
    'tournaments_hosted', (select tournaments_hosted from completed),
    'registered_players', (select registered_players from participants),
    'champions_crowned', (select champions_crowned from champions),
    'prize_pool_awarded', (select prize_pool_awarded from prizes)
  );
$$;

create or replace function public.get_home_community_proof()
returns jsonb
language sql
stable
set search_path = public
as $$
  with stats as (
    select public.get_home_community_proof_stats() as data
  ),
  latest as (
    select
      te.tournament_number,
      te.championship_name,
      te.slug,
      te.accent_color
    from public.v_tournaments_enriched te
    where te.status = 'completed'::public.dgl_tournament_status
    order by te.global_number desc
    limit 1
  )
  select jsonb_build_object(
    'stats', (select data from stats),
    'latest_champion', (
      select jsonb_build_object(
        'tournament_number', l.tournament_number,
        'championship_name', l.championship_name,
        'results_path', case when l.slug is not null then '/tournaments/' || l.slug else null end,
        'accent', l.accent_color
      )
      from latest l
    )
  );
$$;

grant execute on function public.get_platform_stats() to anon, authenticated;
grant execute on function public.get_home_community_proof_stats() to anon, authenticated;
grant execute on function public.get_home_community_proof() to anon, authenticated;

commit;
