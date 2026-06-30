-- Seed role USER + bootstrap admin Google. Idempotent — entrypoint produksi hanya
-- menjalankan `prisma migrate deploy` tanpa `prisma db seed`, jadi data dari seed
-- (roles.json / users.json) tidak otomatis ada di STG/prod. Tanpa migration ini:
--   1. Role id "5" absen → create user Google (roleId "5") kena FK violation → oauth_failed.
--   2. Email Nico kosong → login Google tidak match by email → jadi user role 5, bukan admin.

-- Role USER (id "5") untuk user publik hasil login Google. permissions nullable.
INSERT INTO "roles" ("id", "name", "description", "isActive", "createdAt", "updatedAt")
VALUES ('5', 'USER', 'User Publik (Login Google)', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Bootstrap admin via Google: set email pada SuperAdmin-Nico (identitas stabil = nomor)
-- agar login Google ter-match by email & role 0 dipertahankan (resolveOrCreateUser).
-- Hanya isi bila masih kosong — tidak menimpa email yang sudah benar. Bila row tidak ada: no-op.
UPDATE "users"
SET "email" = 'nicoarya20@gmail.com'
WHERE "nomor" = '6289647037426' AND "email" IS NULL;
