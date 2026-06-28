-- DGL schema extension — optional migration 10
-- Backfill tournament_registrations from legacy public.registrations (Valorant #1).
-- Does NOT modify public.registrations.
-- Skips silently if the legacy table or target tournament is missing.

begin;

do $$
declare
  v_tournament_id uuid;
  v_legacy record;
  v_player_id uuid;
  v_inserted integer := 0;
begin
  if to_regclass('public.registrations') is null then
    raise notice 'Legacy public.registrations not found — skipping backfill.';
    return;
  end if;

  select id
    into v_tournament_id
  from public.tournaments
  where external_id = 'dgl-valorant-championship-1'
  limit 1;

  if v_tournament_id is null then
    raise notice 'Valorant Championship #1 tournament row not found — skipping backfill.';
    return;
  end if;

  for v_legacy in
    select r.id, r.discord_name, r.valorant_ign, r.rank, r.created_at
    from public.registrations r
  loop
    insert into public.players (display_name, discord_username)
    values (v_legacy.discord_name, v_legacy.discord_name)
    on conflict (display_name_key) do update
    set discord_username = coalesce(public.players.discord_username, excluded.discord_username)
    returning id into v_player_id;

    insert into public.player_game_profiles (player_id, game_id, in_game_name, rank_tier)
    select
      v_player_id,
      g.id,
      v_legacy.valorant_ign,
      v_legacy.rank
    from public.games g
    where g.slug = 'valorant'
    on conflict (player_id, game_id) do update
    set
      in_game_name = coalesce(excluded.in_game_name, public.player_game_profiles.in_game_name),
      rank_tier = coalesce(excluded.rank_tier, public.player_game_profiles.rank_tier);

    insert into public.tournament_registrations (
      tournament_id,
      player_id,
      status,
      registered_at,
      confirmed_at,
      form_data,
      legacy_registration_id
    )
    values (
      v_tournament_id,
      v_player_id,
      'confirmed',
      coalesce(v_legacy.created_at, timezone('utc', now())),
      coalesce(v_legacy.created_at, timezone('utc', now())),
      jsonb_build_object(
        'discord_name', v_legacy.discord_name,
        'valorant_ign', v_legacy.valorant_ign,
        'rank', v_legacy.rank,
        'source', 'legacy_registrations'
      ),
      v_legacy.id
    )
    on conflict (tournament_id, legacy_registration_id) do nothing;

    v_inserted := v_inserted + 1;
  end loop;

  raise notice 'Legacy registration backfill processed % rows.', v_inserted;
end $$;

commit;
