#!/usr/bin/env bash
# Concatenates DGL migrations for manual apply in Supabase SQL Editor.
# Prefer: supabase link && supabase db push

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/supabase/dgl_all_migrations.sql"

{
  echo "-- DGL combined migrations — apply in order via Supabase SQL Editor"
  echo "-- Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo
  for f in "$ROOT"/supabase/migrations/*.sql; do
    echo "-- >>> $(basename "$f")"
    cat "$f"
    echo
  done
} > "$OUT"

echo "Wrote $OUT"
