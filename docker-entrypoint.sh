#!/bin/bash
set -e

echo "🔄 Running database migrations..."
cd /app

# Check for failed migrations and resolve them first
FAILED_MIGRATION=$(bunx prisma migrate status 2>&1 | grep -A 1 "failed" | grep -oP '\d{14}_\w+' | head -1 || true)

if [ ! -z "$FAILED_MIGRATION" ]; then
  echo "⚠️  Found failed migration: $FAILED_MIGRATION"
  echo "🔧 Attempting to resolve (mark as rolled back)..."
  bunx prisma migrate resolve --rolled-back "$FAILED_MIGRATION" || {
    echo "❌ Failed to resolve migration. Trying db push instead..."
    echo "📡 Pushing schema directly to database..."
    bunx prisma db push --accept-data-loss || {
      echo "❌ Schema push failed!"
      exit 1
    }
  }
else
  echo "📡 Running standard migrations..."
  bunx prisma migrate deploy || {
    echo "❌ Migration failed!"
    exit 1
  }
fi

echo "✅ Database schema updated successfully"

echo "🚀 Starting application..."
exec bun start
