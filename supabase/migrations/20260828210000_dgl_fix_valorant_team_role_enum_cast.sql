-- Fix dgl_register_valorant_team: cast team member role to dgl_team_member_role.
--
-- PL/pgSQL CASE returns text; tournament_team_members.role is dgl_team_member_role.
-- Existing enum values unchanged: captain, member, substitute, coach.
-- Does not alter tables, registrations, or other RPCs.

begin;

create or replace function public.dgl_register_valorant_team(
  p_tournament_id uuid,
  p_team_name text,
  p_players jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tournament record;
  v_team_id uuid;
  v_group_id uuid := gen_random_uuid();
  v_confirmed integer;
  v_main_available integer;
  v_player jsonb;
  v_discord text;
  v_rank text;
  v_player_id uuid;
  v_key text;
  v_reg_id uuid;
  v_registration_ids uuid[] := '{}';
  v_discord_keys text[] := '{}';
  v_i integer;
  v_target_status public.dgl_registration_status := 'confirmed';
begin
  select t.*, g.id as game_id
    into v_tournament
  from public.tournaments t
  join public.games g on g.id = t.game_id
  where t.id = p_tournament_id
  for update;

  if not found then
    raise exception 'Tournament not found';
  end if;

  if v_tournament.external_id is distinct from 'dgl-valorant-championship-2' then
    raise exception 'Team registration is only available for Valorant Championship #2';
  end if;

  if v_tournament.status in ('completed', 'cancelled', 'active', 'draft') then
    raise exception 'Registration is closed for this tournament (status %)', v_tournament.status;
  end if;

  if v_tournament.status = 'coming_soon' then
    raise exception 'Registration has not opened yet';
  end if;

  if v_tournament.registration_closes_at is not null
     and v_tournament.registration_closes_at <= timezone('utc', now()) then
    raise exception 'Registrations Closed';
  end if;

  if p_team_name is null or trim(p_team_name) = '' then
    raise exception 'Team name is required';
  end if;

  if jsonb_typeof(p_players) is distinct from 'array'
     or jsonb_array_length(p_players) is distinct from 5 then
    raise exception 'A full team requires exactly 5 players';
  end if;

  for v_i in 0..4 loop
    v_player := p_players->v_i;
    v_discord := trim(v_player->>'discord_username');
    v_rank := trim(v_player->>'rank');

    if v_discord is null or v_discord = '' then
      raise exception 'Discord username is required for all players';
    end if;

    if v_rank is null or v_rank = '' then
      raise exception 'Valorant rank is required for all players';
    end if;

    v_key := lower(v_discord);
    if v_key = any(v_discord_keys) then
      raise exception 'Duplicate Discord username in team: %', v_discord;
    end if;
    v_discord_keys := array_append(v_discord_keys, v_key);
  end loop;

  select count(*) into v_confirmed
  from public.tournament_registrations
  where tournament_id = p_tournament_id
    and status in ('pending', 'confirmed');

  v_main_available := coalesce(v_tournament.registration_limit, 0) - v_confirmed;

  -- Full teams register into MAIN only — never reserve.
  if v_main_available < 5 then
    raise exception 'Not enough main capacity for a full team (5 main player slots required)';
  end if;

  v_target_status := 'confirmed';

  for v_i in 0..4 loop
    v_discord := trim((p_players->v_i)->>'discord_username');
    v_key := lower(v_discord);

    if exists (
      select 1
      from public.tournament_registrations tr
      join public.players p on p.id = tr.player_id
      where tr.tournament_id = p_tournament_id
        and p.display_name_key = v_key
        and tr.status in ('pending', 'confirmed', 'waitlist')
    ) then
      raise exception 'Player already registered: %', v_discord;
    end if;
  end loop;

  insert into public.tournament_teams (tournament_id, name)
  values (p_tournament_id, trim(p_team_name))
  returning id into v_team_id;

  for v_i in 0..4 loop
    v_player := p_players->v_i;
    v_discord := trim(v_player->>'discord_username');
    v_rank := trim(v_player->>'rank');
    v_key := lower(v_discord);

    select id into v_player_id
    from public.players
    where display_name_key = v_key;

    if not found then
      insert into public.players (display_name, discord_username)
      values (v_discord, v_discord)
      returning id into v_player_id;
    end if;

    perform public.dgl_ensure_player_points_summary(v_player_id);

    insert into public.player_game_profiles (player_id, game_id, rank_tier)
    values (v_player_id, v_tournament.game_id, v_rank)
    on conflict (player_id, game_id) do update
      set rank_tier = excluded.rank_tier,
          updated_at = timezone('utc', now());

    insert into public.tournament_registrations (
      tournament_id,
      player_id,
      status,
      confirmed_at,
      team_name,
      form_data,
      metadata
    ) values (
      p_tournament_id,
      v_player_id,
      v_target_status,
      case
        when v_target_status = 'confirmed' then timezone('utc', now())
        else null
      end,
      trim(p_team_name),
      jsonb_build_object(
        'discord_username', v_discord,
        'rank', v_rank,
        'registration_type', 'team',
        'registration_group_id', v_group_id::text,
        'is_captain', coalesce((v_player->>'is_captain')::boolean, false)
      ),
      jsonb_build_object('skip_status_assignment', true)
    )
    returning id into v_reg_id;

    v_registration_ids := array_append(v_registration_ids, v_reg_id);

    insert into public.tournament_team_members (team_id, player_id, role)
    values (
      v_team_id,
      v_player_id,
      case
        when coalesce((v_player->>'is_captain')::boolean, false)
          then 'captain'::public.dgl_team_member_role
        else 'member'::public.dgl_team_member_role
      end
    );
  end loop;

  if v_target_status = 'confirmed' then
    select count(*) into v_confirmed
    from public.tournament_registrations
    where tournament_id = p_tournament_id
      and status in ('pending', 'confirmed');

    if v_tournament.registration_limit is not null
       and v_confirmed >= v_tournament.registration_limit
       and v_tournament.status = 'registration_open' then
      update public.tournaments
      set status = 'registration_closed',
          updated_at = timezone('utc', now())
      where id = p_tournament_id;
    end if;
  end if;

  return jsonb_build_object(
    'team_id', v_team_id,
    'team_name', trim(p_team_name),
    'registration_group_id', v_group_id,
    'registration_ids', to_jsonb(v_registration_ids),
    'status', v_target_status,
    'is_reserve', false,
    'player_count', 5
  );
end;
$$;

grant execute on function public.dgl_register_valorant_team(uuid, text, jsonb)
  to anon, authenticated;

commit;
