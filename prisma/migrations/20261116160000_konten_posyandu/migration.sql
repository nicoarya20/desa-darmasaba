-- Kenapa: halaman Posyandu kini memuat deskripsi umum (bukan per posyandu), kegiatan per klaster sasaran
-- (Balita, Remaja, Lansia & PROLANIS) dengan jam pelayanannya, serta alamat + galeri foto lokasi/kader untuk
-- tiap posyandu banjar. Murni additive: kolom baru nullable, tabel baru; kolom lama Posyandu tidak disentuh.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS, cek pg_constraint, ON CONFLICT DO NOTHING).

-- AlterTable
-- Kenapa nullable: posyandu lama belum punya alamat; admin melengkapinya lewat form edit.
ALTER TABLE "Posyandu" ADD COLUMN IF NOT EXISTS "alamat" TEXT;

-- CreateTable
-- Kenapa singleton ber-id tetap (pola ProfilBumDes): deskripsi umum hanya satu untuk seluruh desa, upsert
-- dengan id tetap menjamin tidak pernah ada baris kedua.
CREATE TABLE IF NOT EXISTS "ProfilPosyandu" (
    "id" TEXT NOT NULL DEFAULT 'profil-posyandu',
    "deskripsi" TEXT NOT NULL,
    "fungsiKegiatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfilPosyandu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "KlasterPosyandu" (
    "id" TEXT NOT NULL,
    "sasaran" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "jamPelayanan" TEXT,
    "imageId" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KlasterPosyandu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FotoKegiatanPosyandu" (
    "id" TEXT NOT NULL,
    "posyanduId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "keterangan" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FotoKegiatanPosyandu_pkey" PRIMARY KEY ("id")
);

-- Kenapa unik: tiap klaster sasaran tepat satu baris (admin mengubah, bukan menambah klaster).
-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "KlasterPosyandu_sasaran_key" ON "KlasterPosyandu"("sasaran");

-- Kenapa: foto galeri selalu dibaca per posyandu, urut `urutan`.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "FotoKegiatanPosyandu_posyanduId_urutan_idx" ON "FotoKegiatanPosyandu"("posyanduId", "urutan");

-- Kenapa CHECK selain validasi API: sasaran dipakai sebagai kunci tampilan publik; nilai asing dari jalur lain
-- (skrip/SQL manual) ditolak di database. Nilai sama dengan SASARAN_KLASTER di src/lib/posyandu.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'KlasterPosyandu_sasaran_check') THEN
    ALTER TABLE "KlasterPosyandu" ADD CONSTRAINT "KlasterPosyandu_sasaran_check"
      CHECK ("sasaran" IN ('balita', 'remaja', 'lansia'));
  END IF;
END $$;

-- Kenapa SET NULL: gambar klaster opsional; kartu klaster tetap tampil bila berkasnya terhapus.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'KlasterPosyandu_imageId_fkey') THEN
    ALTER TABLE "KlasterPosyandu" ADD CONSTRAINT "KlasterPosyandu_imageId_fkey"
      FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: foto galeri tidak bermakna tanpa posyandunya.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FotoKegiatanPosyandu_posyanduId_fkey') THEN
    ALTER TABLE "FotoKegiatanPosyandu" ADD CONSTRAINT "FotoKegiatanPosyandu_posyanduId_fkey"
      FOREIGN KEY ("posyanduId") REFERENCES "Posyandu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: foto galeri tanpa berkasnya tidak bisa ditampilkan (pola sama FotoKegiatanBankSampah).
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FotoKegiatanPosyandu_imageId_fkey') THEN
    ALTER TABLE "FotoKegiatanPosyandu" ADD CONSTRAINT "FotoKegiatanPosyandu_imageId_fkey"
      FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa diisi di migrasi (bukan hanya seed): halaman publik langsung menampilkan 3 klaster di semua
-- lingkungan tanpa menunggu admin; isi umum dari dokumen Bidang Kesehatan desa (tanpa data pribadi).
-- ON CONFLICT DO NOTHING: klaster yang sudah diubah admin tidak ditimpa saat migrasi dijalankan ulang.
INSERT INTO "KlasterPosyandu" ("id", "sasaran", "judul", "deskripsi", "jamPelayanan", "urutan", "updatedAt")
VALUES
  ('klaster-posyandu-balita', 'balita', 'Posyandu Balita',
   'Pemantauan tumbuh kembang, imunisasi dasar, dan pemberian makanan tambahan (PMT) bergizi.',
   '09.00 WITA', 1, CURRENT_TIMESTAMP),
  ('klaster-posyandu-remaja', 'remaja', 'Posyandu Remaja',
   'Edukasi kesehatan reproduksi, gizi remaja, dan pencegahan anemia.',
   '18.00 WITA', 2, CURRENT_TIMESTAMP),
  ('klaster-posyandu-lansia', 'lansia', 'Posyandu Lansia & PROLANIS',
   'Senam kebugaran bersama, pengecekan berkala (tekanan darah dan gula darah), serta pengelolaan penyakit kronis bersama tim medis.',
   '16.00 WITA', 3, CURRENT_TIMESTAMP)
ON CONFLICT ("sasaran") DO NOTHING;
