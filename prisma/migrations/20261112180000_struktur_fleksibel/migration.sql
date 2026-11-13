-- Kenapa: Struktur PPID, BUMDes, dan Perangkat Desa disamakan jadi satu aturan yang fleksibel
-- (permintaan desa 2026-11-12): pegawai cukup Nama* (sudah termasuk gelar), Foto, Email,
-- Telepon, Jabatan*; deskripsi jabatan opsional; urutan jabatan selevel bisa diatur.
-- Idempoten: aman dijalankan ulang (IF [NOT] EXISTS, UPDATE yang hanya mengenai baris belum diproses).
-- Kolom gelarAkademik/tanggalMasuk/alamat SENGAJA tidak dihapus (rollback aman; data lama tetap ada).

-- 1) Urutan jabatan selevel untuk PPID & BUMDes (Perangkat Desa sudah punya).
ALTER TABLE "PosisiOrganisasiPPID" ADD COLUMN IF NOT EXISTS "urutan" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PosisiOrganisasiBumDes" ADD COLUMN IF NOT EXISTS "urutan" INTEGER NOT NULL DEFAULT 0;

-- 2) Email opsional: string kosong → NULL, lalu lepas unique (email kosong ke-2 sebelumnya
--    gagal "Email sudah digunakan"). Sesudah ini email tidak lagi unik di PPID & BUMDes.
UPDATE "PegawaiPPID"   SET "email" = NULL WHERE "email" IS NOT NULL AND TRIM("email") = '';
UPDATE "PegawaiBumDes" SET "email" = NULL WHERE "email" IS NOT NULL AND TRIM("email") = '';
UPDATE "PerangkatDesa" SET "email" = NULL WHERE "email" IS NOT NULL AND TRIM("email") = '';
DROP INDEX IF EXISTS "PegawaiPPID_email_key";
DROP INDEX IF EXISTS "PegawaiBumDes_email_key";

-- 3) Gelar digabung ke nama ("I Made Ari" + "S.Kom" → "I Made Ari, S.Kom") karena form tidak
--    lagi punya field gelar. Dilewati bila nama SUDAH memuat gelarnya (data lama ada yang begitu;
--    dibandingkan tanpa spasi & huruf besar/kecil) supaya gelar tidak dobel. Hanya baris yang
--    gelarnya masih terisi → dijalankan ulang tidak menggandakan. LEFT(…, 255) menjaga VarChar(255).
UPDATE "PegawaiPPID"
  SET "namaLengkap" = LEFT(TRIM("namaLengkap") || ', ' || TRIM("gelarAkademik"), 255), "gelarAkademik" = NULL
  WHERE "gelarAkademik" IS NOT NULL AND TRIM("gelarAkademik") <> ''
    AND POSITION(REPLACE(LOWER(TRIM("gelarAkademik")), ' ', '') IN REPLACE(LOWER("namaLengkap"), ' ', '')) = 0;
UPDATE "PegawaiBumDes"
  SET "namaLengkap" = LEFT(TRIM("namaLengkap") || ', ' || TRIM("gelarAkademik"), 255), "gelarAkademik" = NULL
  WHERE "gelarAkademik" IS NOT NULL AND TRIM("gelarAkademik") <> ''
    AND POSITION(REPLACE(LOWER(TRIM("gelarAkademik")), ' ', '') IN REPLACE(LOWER("namaLengkap"), ' ', '')) = 0;
UPDATE "PerangkatDesa"
  SET "namaLengkap" = LEFT(TRIM("namaLengkap") || ', ' || TRIM("gelarAkademik"), 255), "gelarAkademik" = NULL
  WHERE "gelarAkademik" IS NOT NULL AND TRIM("gelarAkademik") <> ''
    AND POSITION(REPLACE(LOWER(TRIM("gelarAkademik")), ' ', '') IN REPLACE(LOWER("namaLengkap"), ' ', '')) = 0;
-- Gelar kosong ('') dirapikan jadi NULL juga.
UPDATE "PegawaiPPID"   SET "gelarAkademik" = NULL WHERE "gelarAkademik" IS NOT NULL;
UPDATE "PegawaiBumDes" SET "gelarAkademik" = NULL WHERE "gelarAkademik" IS NOT NULL;
UPDATE "PerangkatDesa" SET "gelarAkademik" = NULL WHERE "gelarAkademik" IS NOT NULL;
