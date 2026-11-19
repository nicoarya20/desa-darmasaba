-- Lomba Website Desa 2027, temuan T11: situs belum menampilkan Indeks Desa Membangun (IDM, Kemendesa PDTT). Satu baris
-- per tahun, jadi butuh tabel baru; "Indeks Kepuasan Masyarakat" (menu PPID) adalah hal lain dan tidak disentuh.
-- Murni aditif dan idempoten: hanya membuat tabel baru + indeks unik + CHECK; tidak menyentuh tabel/kolom lain.
-- Sengaja TANPA INSERT: angka IDM datang dari dokumen Kemendesa lewat pihak desa dan diisi admin melalui CMS.
-- "status" berupa TEXT (nilai dijaga API: 5 status resmi IDM), bukan enum Postgres, supaya perubahan istilah resmi tidak
-- memerlukan migrasi. Skor 0-1 dijaga API dan diperkuat CHECK di sini sebagai sabuk pengaman bila ada tulisan di luar API.

CREATE TABLE IF NOT EXISTS "IndeksDesa" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "skorIdm" DOUBLE PRECISION NOT NULL,
    "skorIks" DOUBLE PRECISION NOT NULL,
    "skorIke" DOUBLE PRECISION NOT NULL,
    "skorIkl" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "IndeksDesa_pkey" PRIMARY KEY ("id")
);

-- Satu baris per tahun. Hapus lewat CMS = hapus permanen (seperti Produk Hukum), jadi unik penuh sudah cukup dan
-- cocok dengan @unique di schema.prisma (Prisma tidak bisa menulis indeks unik parsial).
CREATE UNIQUE INDEX IF NOT EXISTS "IndeksDesa_tahun_key" ON "IndeksDesa"("tahun");

-- ADD CONSTRAINT tidak punya IF NOT EXISTS, jadi tiap CHECK dibungkus pengecualian duplicate_object agar migrasi aman
-- dijalankan ulang. Skor IDM/IKS/IKE/IKL selalu pada rentang 0 sampai 1.
DO $$
BEGIN
    ALTER TABLE "IndeksDesa" ADD CONSTRAINT "IndeksDesa_skorIdm_range_chk" CHECK ("skorIdm" >= 0 AND "skorIdm" <= 1);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "IndeksDesa" ADD CONSTRAINT "IndeksDesa_skorIks_range_chk" CHECK ("skorIks" >= 0 AND "skorIks" <= 1);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "IndeksDesa" ADD CONSTRAINT "IndeksDesa_skorIke_range_chk" CHECK ("skorIke" >= 0 AND "skorIke" <= 1);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "IndeksDesa" ADD CONSTRAINT "IndeksDesa_skorIkl_range_chk" CHECK ("skorIkl" >= 0 AND "skorIkl" <= 1);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
