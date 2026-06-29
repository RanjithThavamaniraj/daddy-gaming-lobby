/**
 * Verify live Supabase data sources used by the DGL app.
 * Run: node scripts/verify-supabase-data.mjs
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;

    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.VITE_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function check(label, fn) {
  try {
    const result = await fn();
    const count = Array.isArray(result.data)
      ? result.data.length
      : result.data
        ? 1
        : 0;
    console.log(`✓ ${label} (${count} row${count === 1 ? "" : "s"})`);
    if (result.error) throw result.error;
    return true;
  } catch (error) {
    console.error(`✗ ${label}:`, error.message ?? error);
    return false;
  }
}

let passed = 0;
let total = 0;

async function run(name, fn) {
  total += 1;
  if (await check(name, fn)) passed += 1;
}

await run("v_tournaments_enriched", () =>
  supabase.from("v_tournaments_enriched").select("external_id, status").limit(10)
);

await run("v_tournament_results", () =>
  supabase.from("v_tournament_results").select("slug, champion_players").limit(10)
);

await run("v_hall_of_champions", () =>
  supabase.from("v_hall_of_champions").select("tournament_id, player_name").limit(20)
);

await run("v_player_leaderboard", () =>
  supabase.from("v_player_leaderboard").select("rank, display_name, points").limit(10)
);

await run("get_platform_stats", () => supabase.rpc("get_platform_stats"));

await run("get_home_community_proof", () =>
  supabase.rpc("get_home_community_proof")
);

await run("community_activity", () =>
  supabase
    .from("community_activity")
    .select("id, title")
    .eq("is_public", true)
    .limit(10)
);

console.log(`\n${passed}/${total} checks passed`);

if (passed !== total) {
  process.exit(1);
}
