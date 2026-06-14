#!/usr/bin/env bash
set -euo pipefail

# Initialize DB using Supabase CLI or SQL editor.
# Usage: ./db/init_db.sh

if command -v supabase >/dev/null 2>&1; then
  echo "Running schema.sql and rls.sql through supabase CLI..."
  supabase db query < ./db/schema.sql
  supabase db query < ./db/rls.sql
  echo "Done."
else
  echo "Supabase CLI not found. Please install it or run the SQL files via Supabase SQL editor." >&2
  echo "Upload the contents of db/schema.sql and db/rls.sql to Supabase SQL editor and run them."
  exit 1
fi
