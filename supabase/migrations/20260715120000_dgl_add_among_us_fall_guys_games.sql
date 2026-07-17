-- Adds two missing game catalog entries: Among Us and Fall Guys.
--
-- Catalog-only change to public.games (the roadmap/"Supported Titles" list
-- consumed by the homepage Featured Games section and the Dashboard Active
-- Realms grid). No tournaments, registrations, participants, placements, or
-- leaderboard data are touched — those are entirely separate tables.
--
-- Values mirror the existing non-tournament "planned" titles already in the
-- catalog (Arc Raiders, Delta Force, Rainbow Six Siege, Rocket League, PUBG):
-- status = planned, featured = false (the homepage Featured Games section
-- selects by an explicit slug allow-list in the client, not by this column —
-- see src/lib/homeModel.js HOME_FEATURED_GAME_IDS, which already includes
-- both slugs). participation_mode = solo, since both are individual-entrant
-- party games rather than fixed-roster team games — the only existing
-- catalog rows are all team titles, so this is the first use of the 'solo'
-- enum value the schema already supports.
--
-- accent_color / glow_color match src/config/dglGamesConfig.js exactly so
-- the client fallback and live Supabase data render identically.

begin;

insert into public.games (
  slug, name, category, accent_color, glow_color,
  team_size, max_roster_size, default_participation_mode,
  sort_order, featured, status
)
values
  (
    'among-us', 'Among Us', 'Social Deduction', '#14b8a6', 'rgba(20, 184, 166, 0.4)',
    1, null, 'solo',
    110, false, 'planned'
  ),
  (
    'fall-guys', 'Fall Guys', 'Party Platformer', '#ec4899', 'rgba(236, 72, 153, 0.4)',
    1, null, 'solo',
    120, false, 'planned'
  )
on conflict (slug) do nothing;

commit;
