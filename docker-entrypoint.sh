#!/bin/bash
set -e

echo "🔄 Running database migrations..."
cd /app

bunx prisma migrate deploy || {
  echo "❌ Migration failed!"
  exit 1
}
echo "✅ Migrations completed successfully"

echo "🚀 Starting application..."
exec bun start
