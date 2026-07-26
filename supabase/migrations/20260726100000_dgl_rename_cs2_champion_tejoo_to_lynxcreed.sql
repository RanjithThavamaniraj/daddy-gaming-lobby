-- Renames the DGL CS2 Championship #1 champion "Tejoo" to "Lynxcreed".
--
-- Scoped precisely to the player who holds the placement=1 (champion) row
-- for dgl-cs2-championship-1, not any "Tejoo" globally, so this can never
-- accidentally rename an unrelated player who happens to share the name.
--
-- players.display_name_key is a generated column derived from display_name,
-- and every downstream surface (tournament_results view, hall of champions,
-- leaderboard) joins back to players by player_id — so renaming this one
-- row is sufficient to update every page that reads from Supabase.

begin;

update public.players p
set display_name = 'Lynxcreed'
where p.display_name_key = 'tejoo'
  and exists (
    select 1
    from public.tournament_placements tp
    join public.tournaments t on t.id = tp.tournament_id
    where tp.player_id = p.id
      and tp.placement = 1
      and tp.entity_type = 'player'
      and t.external_id = 'dgl-cs2-championship-1'
  );

commit;
