-- Valorant in-game ranks on existing player_game_profiles (player_id, game_id).
-- Does not touch tournaments, placements, ledger, or DGL Points.
-- Canonical identities are not renamed.

begin;

-- Deadcalmee has no existing player row; create identity only (no duplicate of
-- Dead silence / ClmeVictor).
insert into public.players (display_name)
values ('Deadcalmee')
on conflict (display_name_key) do nothing;

insert into public.player_game_profiles (player_id, game_id, rank_tier)
select p.id, g.id, v.rank_tier
from public.games g
cross join (values
  ('mxththunder', 'Gold 3'),
  ('spontaneous_bear', 'Diamond 1'),
  ('frenzyvjn', 'Diamond 3'),
  ('smallboy', 'Platinum 2'),
  ('deadcalmee', 'Silver 2'),
  ('kp4', 'Gold 2'),
  ('big smoke 46', 'Gold 3'),
  ('farhan_mhd', 'Gold 3'),
  ('shadowsniper', 'Platinum 2'),
  ('rbs876', 'Gold 2'),
  ('shade_567', 'Diamond 3')
) as v(name_key, rank_tier)
join public.players p on p.display_name_key = v.name_key
where g.slug = 'valorant'
on conflict (player_id, game_id) do update
  set rank_tier = excluded.rank_tier,
      updated_at = timezone('utc', now());

commit;
