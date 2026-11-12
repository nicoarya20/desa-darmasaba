-- Kenapa: halaman publik "Struktur Perangkat Desa" selama ini menumpang tabel Struktur PPID, sehingga
-- data perangkat desa dan pejabat PPID tercampur (mengubah satu = mengubah yang lain). Perangkat desa
-- kini punya tabel sendiri. Hanya nama + jabatan yang wajib; foto, gelar, kontak, alamat, dan tanggal
-- masuk boleh kosong supaya nama bisa dicatat dulu. Atasan jabatan (parentId) bisa diatur dari admin.
-- Murni additive: tabel PPID dan BUMDes tidak disentuh.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS, duplicate_object, ON CONFLICT DO NOTHING).

-- CreateTable
CREATE TABLE IF NOT EXISTS "PosisiPerangkatDesa" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "hierarki" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosisiPerangkatDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PerangkatDesa" (
    "id" TEXT NOT NULL,
    "namaLengkap" VARCHAR(255) NOT NULL,
    "gelarAkademik" VARCHAR(100),
    "imageId" TEXT,
    "tanggalMasuk" DATE,
    "email" VARCHAR(255),
    "telepon" VARCHAR(20),
    "alamat" TEXT,
    "posisiId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerangkatDesa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PosisiPerangkatDesa_parentId_idx" ON "PosisiPerangkatDesa"("parentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PerangkatDesa_posisiId_idx" ON "PerangkatDesa"("posisiId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PerangkatDesa_imageId_idx" ON "PerangkatDesa"("imageId");

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "PosisiPerangkatDesa" ADD CONSTRAINT "PosisiPerangkatDesa_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "PosisiPerangkatDesa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "PerangkatDesa" ADD CONSTRAINT "PerangkatDesa_imageId_fkey"
    FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "PerangkatDesa" ADD CONSTRAINT "PerangkatDesa_posisiId_fkey"
    FOREIGN KEY ("posisiId") REFERENCES "PosisiPerangkatDesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Kenapa: daftar jabatan awal diisi dari bagan resmi "Struktur Organisasi Pemerintahan Desa Darmasaba"
-- (Peraturan Bupati Badung No. 44 Tahun 2016). Ditaruh di migrasi, bukan seeder, karena deploy hanya
-- menjalankan `prisma migrate deploy`. Nama pegawai tidak di-seed (diisi admin). ON CONFLICT DO NOTHING
-- supaya perubahan admin atas jabatan ini tidak ditimpa bila migrasi dijalankan ulang.
-- Urutan baris: induk dulu, karena parentId adalah FK.
INSERT INTO "PosisiPerangkatDesa" ("id", "nama", "hierarki", "urutan", "parentId", "updatedAt") VALUES
    ('pd-perbekel',               'Perbekel',                                1, 0,  NULL,            CURRENT_TIMESTAMP),
    ('pd-sekretaris-desa',        'Sekretaris Desa',                         2, 0,  'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kasi-pemerintahan',      'Kepala Seksi Pemerintahan',               2, 1,  'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kasi-kesejahteraan',     'Kepala Seksi Kesejahteraan',              2, 2,  'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kasi-pelayanan',         'Kepala Seksi Pelayanan',                  2, 3,  'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kaur-tata-usaha-umum',   'Kepala Urusan Tata Usaha & Umum',         3, 1,  'pd-sekretaris-desa', CURRENT_TIMESTAMP),
    ('pd-kaur-keuangan',          'Kepala Urusan Keuangan',                  3, 2,  'pd-sekretaris-desa', CURRENT_TIMESTAMP),
    ('pd-kaur-perencanaan',       'Kepala Urusan Perencanaan',               3, 3,  'pd-sekretaris-desa', CURRENT_TIMESTAMP),
    ('pd-kelian-cabe',            'Kelian Banjar Dinas Cabe',                3, 11, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-menesa',          'Kelian Banjar Dinas Menesa',              3, 12, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-darmasaba',       'Kelian Banjar Dinas Darmasaba',           3, 13, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-penenjoan',       'Kelian Banjar Dinas Penenjoan',           3, 14, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-baler-pasar',     'Kelian Banjar Dinas Baler Pasar',         3, 15, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-bucu',            'Kelian Banjar Dinas Bucu',                3, 16, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-tengah',          'Kelian Banjar Dinas Tengah',              3, 17, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-gulingan',        'Kelian Banjar Dinas Gulingan',            3, 18, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-telanga',         'Kelian Banjar Dinas Telanga',             3, 19, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-taman',           'Kelian Banjar Dinas Taman',               3, 20, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-umahanyar',       'Kelian Banjar Dinas Umahanyar',           3, 21, 'pd-perbekel',   CURRENT_TIMESTAMP),
    ('pd-kelian-bersih',          'Kelian Banjar Dinas Bersih',              3, 22, 'pd-perbekel',   CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
