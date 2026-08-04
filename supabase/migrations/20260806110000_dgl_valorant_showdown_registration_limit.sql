-- Valorant Saturday Showdown #1 was switched to 2v2 without a
-- registration_limit. The public registration form falls back to the
-- legacy DEFAULT_REGISTRATION_CAPACITY (22) when the column is null,
-- which is leftover 5v5-era behaviour. Set an explicit 2v2 capacity
-- (16 players / 8 teams) for this tournament only.

begin;

update public.tournaments
set registration_limit = 16,
    updated_at = timezone('utc', now())
where external_id = 'dgl-valorant-saturday-showdown-1'
  and (registration_limit is distinct from 16);

update public.tournament_series
set default_format = '2v2'
where slug = 'valorant-saturday-showdown'
  and default_format is distinct from '2v2';

commit;
