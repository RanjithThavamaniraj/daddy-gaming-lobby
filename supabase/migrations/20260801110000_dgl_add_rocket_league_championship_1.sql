-- Adds DGL Rocket League Championship #1 (Tournament #5) as a teaser Main
-- Event: status = 'coming_soon' (registrations not open yet), but
-- is_featured = true so it takes the Main Event slot ahead of FC 26
-- Championship #2's now-completed run.
--
-- This deliberately uses the same mechanism promote_next_tournament() uses
-- (is_featured = true), just without also opening registration — the
-- existing selectFeaturedTournament priority rule (src/lib/tournamentModel.js)
-- already checks isFeatured before status, with no exclusion for
-- coming_soon there; the coming_soon exclusion only applies to the
-- *unfeatured* status-priority fallback. enforce_single_featured_tournament
-- (20260628100012) automatically unfeatures FC 26 Championship #2 the
-- moment this row's is_featured flips to true.

begin;

insert into public.tournament_series (
  slug, name, game_id, cadence, participation_mode, default_format, default_match_type
)
select
  'rocket-league-championship',
  'DGL Rocket League Championship',
  g.id,
  'seasonal',
  'team',
  '4v4',
  'Knockout'
from public.games g
where g.slug = 'rocket-league'
on conflict (slug) do nothing;

insert into public.tournaments (
  global_number, external_id, slug,
  game_id, series_id, championship_label,
  format, match_type, status,
  prize_pool_display, accent_color, is_featured,
  metadata
)
select
  5,
  'dgl-rocket-league-championship-1',
  'rocket-league-1',
  g.id,
  ts.id,
  'Rocket League',
  '4v4',
  'Knockout',
  'coming_soon',
  '₹2,000 Team Prize',
  g.accent_color,
  true,
  jsonb_build_object('entry_fee', '₹50 Per Player')
from public.games g
join public.tournament_series ts on ts.slug = 'rocket-league-championship'
where g.slug = 'rocket-league'
on conflict (external_id) do update
set is_featured = excluded.is_featured;

commit;
