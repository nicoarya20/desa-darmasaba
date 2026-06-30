-- Login Google OAuth: user dari Google tidak punya nomor HP, identitas pakai email/googleId.
-- nomor dibuat nullable; email/googleId/avatarUrl ditambahkan. Idempotent agar aman di-redeploy.

-- nomor jadi opsional (user Google tidak punya nomor HP)
ALTER TABLE "users" ALTER COLUMN "nomor" DROP NOT NULL;

-- kolom baru untuk identitas Google
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "googleId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

-- unique index (Postgres: banyak NULL diizinkan, jadi user lama tanpa email/googleId tetap aman)
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_googleId_key" ON "users"("googleId");
