-- Updates the format for two upcoming tournaments — copy-only change, no
-- status/prize/entry/match-type changes.
--
--   DGL Rocket League Championship #1:      4v4 -> 2v2
--   DGL Valorant Saturday Showdown #1:      5v5 -> 2v2

begin;

update public.tournaments
set format = '2v2'
where external_id = 'dgl-rocket-league-championship-1';

update public.tournaments
set format = '2v2'
where external_id = 'dgl-valorant-saturday-showdown-1';

commit;
