-- Desa sudah punya perpustakaan digital sendiri (Pustaka Ananta Loka di perpustakaan.co.id), sehingga katalog &
-- form pinjam di website diganti halaman penghubung. Tabel ini menyimpan nama, deskripsi, dan URL yang bisa diubah
-- operator tanpa deploy. Additive: tabel lama DataPerpustakaan/KategoriBuku/PeminjamanBuku tidak disentuh (arsip).

-- CreateTable
CREATE TABLE IF NOT EXISTS "PerpustakaanConfig" (
    "id" TEXT NOT NULL,
    "namaPlatform" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PerpustakaanConfig_pkey" PRIMARY KEY ("id")
);

-- Baris awal supaya halaman publik langsung berisi tautan di setiap lingkungan tanpa menunggu seed/operator.
-- Hanya diisi bila belum ada baris aktif (aman dijalankan ulang).
INSERT INTO "PerpustakaanConfig" ("id", "namaPlatform", "deskripsi", "websiteUrl", "updatedAt")
SELECT
    'perpustakaan-config-awal',
    'Pustaka Ananta Loka',
    'Perpustakaan digital resmi Desa Darmasaba. Baca ebook kapan saja dan di mana saja. Masuk (login) di website perpustakaan untuk membaca koleksi yang tersedia.',
    'https://anantaloka.perpustakaan.co.id',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "PerpustakaanConfig" WHERE "isActive" = true);
