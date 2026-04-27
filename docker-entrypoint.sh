#!/bin/bash
set -e

echo "🔄 Running database migrations..."
cd /app

# Resolve any previously failed migrations before re-applying
bunx prisma migrate resolve --rolled-back 20260423072135_add_stok_to_pasar_desa 2>/dev/null || true

bunx prisma migrate deploy || {
  echo "❌ Migration failed!"
  exit 1
}
echo "✅ Migrations completed successfully"

echo "🚀 Starting application..."
exec bun start
