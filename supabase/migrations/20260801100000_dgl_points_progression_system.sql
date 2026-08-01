-- Introduces the DGL Points tournament-progression standard, replacing the
-- old flat champion/runner-up-only reward model.
--
-- New standard (documented here for reference by future results migrations
-- and any future admin tooling — see the "publish_tournament_results" design
-- discussed for the admin panel): points are cumulative across every stage
-- a player reaches in a tournament.
--
--   Group Stage Participation  +50
--   Quarter Finalist           +50
--   Semi Finalist              +100
--   Runner-Up                  +150
--   Champion                   +200
--
-- As with every prior results migration, the actual points awarded to a
-- player are always the explicit points_awarded value on their
-- tournament_placements row (see dgl_sync_points_for_player_placement,
-- 20260628100004) — dgl_points_rules has never driven that computation, it
-- is reference data. This migration keeps it accurate and extends it with
-- the new tiers so the standard is discoverable at the schema level, not
-- just in migration comments.

begin;

alter table public.dgl_points_rules
  add column if not exists group_stage_points integer,
  add column if not exists quarterfinal_points integer,
  add column if not exists semifinal_points integer;

update public.dgl_points_rules
set champion_points = 200,
    runner_up_points = 150,
    group_stage_points = 50,
    quarterfinal_points = 50,
    semifinal_points = 100
where is_active = true;

commit;
