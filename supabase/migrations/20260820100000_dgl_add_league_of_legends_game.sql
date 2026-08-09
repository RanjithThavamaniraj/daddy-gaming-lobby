-- Add League of Legends to the DGL games catalog.
--
-- Catalog-only: public.games insert. No tournaments, series, registrations,
-- fixtures, placements, points, or community_activity rows.
--
-- Mirrors existing 5v5 team titles (Valorant / CS2):
--   team_size = 5, max_roster_size = 7, participation_mode = team
-- Metadata carries short_name / platform / format for future admin UX.
--
-- accent/glow match src/config/dglGamesConfig.js for offline parity.

begin;

insert into public.games (
  slug,
  name,
  category,
  accent_color,
  glow_color,
  team_size,
  max_roster_size,
  default_participation_mode,
  sort_order,
  featured,
  status,
  metadata
)
values (
  'league-of-legends',
  'League of Legends',
  'MOBA',
  '#c89b3c',
  'rgba(200, 155, 60, 0.45)',
  5,
  7,
  'team',
  95,
  false,
  'available',
  jsonb_build_object(
    'short_name', 'LoL',
    'platform', 'PC',
    'format', '5v5'
  )
)
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  accent_color = excluded.accent_color,
  glow_color = excluded.glow_color,
  team_size = excluded.team_size,
  max_roster_size = excluded.max_roster_size,
  default_participation_mode = excluded.default_participation_mode,
  sort_order = excluded.sort_order,
  status = excluded.status,
  metadata = excluded.metadata,
  updated_at = timezone('utc', now())
where public.games.name is distinct from excluded.name
   or public.games.category is distinct from excluded.category
   or public.games.accent_color is distinct from excluded.accent_color
   or public.games.glow_color is distinct from excluded.glow_color
   or public.games.team_size is distinct from excluded.team_size
   or public.games.max_roster_size is distinct from excluded.max_roster_size
   or public.games.default_participation_mode is distinct from excluded.default_participation_mode
   or public.games.sort_order is distinct from excluded.sort_order
   or public.games.status is distinct from excluded.status
   or public.games.metadata is distinct from excluded.metadata;

commit;
