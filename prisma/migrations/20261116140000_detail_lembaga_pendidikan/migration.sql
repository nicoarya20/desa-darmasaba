-- Kenapa: halaman detail sekolah publik (Info Sekolah) butuh deskripsi, alamat, kontak, media sosial,
-- titik lokasi + link Google Maps, foto sekolah, foto bagan struktur, daftar pengurus (opsional; desa
-- mengisi untuk TK), dan galeri foto kegiatan. Sebelumnya `Lembaga` hanya nama + jenjang.
-- Murni additive: kolom baru nullable, tabel baru; kolom & relasi lama (siswa, pengajar) tidak disentuh.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS + cek pg_constraint).

-- AlterTable
ALTER TABLE "Lembaga" ADD COLUMN IF NOT EXISTS "deskripsi" TEXT;
ALTER TABLE "Lembaga" ADD COLUMN IF NOT EXISTS "alamat" TEXT;
ALTER TABLE "Lembaga" ADD COLUMN IF NOT EXISTS "kontak" TEXT;
-- Kenapa JSONB (bukan tabel): daftar { platform, url } kecil, selalu dibaca utuh bersama barisnya;
-- bentuknya dijaga skema bersama di API (src/lib/konten-bersama/media-sosial.validation.ts).
ALTER TABLE "Lembaga" ADD COLUMN IF NOT EXISTS "mediaSosial" JSONB;
-- Kenapa koordinat nullable: data desa sering hanya memberi link pendek maps.app.goo.gl tanpa titik.
ALTER TABLE "Lembaga" ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION;
ALTER TABLE "Lembaga" ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION;
ALTER TABLE "Lembaga" ADD COLUMN IF NOT EXISTS "linkGoogleMaps" TEXT;
ALTER TABLE "Lembaga" ADD COLUMN IF NOT EXISTS "fotoSekolahId" TEXT;
ALTER TABLE "Lembaga" ADD COLUMN IF NOT EXISTS "fotoBaganStrukturId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "PengurusLembaga" (
    "id" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "imageId" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengurusLembaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FotoKegiatanLembaga" (
    "id" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "keterangan" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FotoKegiatanLembaga_pkey" PRIMARY KEY ("id")
);

-- Kenapa: pengurus & foto selalu dibaca per lembaga, urut `urutan`.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "PengurusLembaga_lembagaId_urutan_idx" ON "PengurusLembaga"("lembagaId", "urutan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FotoKegiatanLembaga_lembagaId_urutan_idx" ON "FotoKegiatanLembaga"("lembagaId", "urutan");

-- Kenapa SET NULL: foto sekolah & bagan opsional; berkas yang terhapus cukup mengosongkan rujukan.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Lembaga_fotoSekolahId_fkey') THEN
    ALTER TABLE "Lembaga" ADD CONSTRAINT "Lembaga_fotoSekolahId_fkey"
      FOREIGN KEY ("fotoSekolahId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Lembaga_fotoBaganStrukturId_fkey') THEN
    ALTER TABLE "Lembaga" ADD CONSTRAINT "Lembaga_fotoBaganStrukturId_fkey"
      FOREIGN KEY ("fotoBaganStrukturId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: pengurus/foto tidak bermakna tanpa lembaganya (lembaga sendiri soft delete,
-- jadi cascade hanya terjadi bila baris lembaga benar-benar dihapus).
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PengurusLembaga_lembagaId_fkey') THEN
    ALTER TABLE "PengurusLembaga" ADD CONSTRAINT "PengurusLembaga_lembagaId_fkey"
      FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa SET NULL: foto pengurus opsional; pengurus tetap tampil (inisial) bila berkasnya hilang.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PengurusLembaga_imageId_fkey') THEN
    ALTER TABLE "PengurusLembaga" ADD CONSTRAINT "PengurusLembaga_imageId_fkey"
      FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FotoKegiatanLembaga_lembagaId_fkey') THEN
    ALTER TABLE "FotoKegiatanLembaga" ADD CONSTRAINT "FotoKegiatanLembaga_lembagaId_fkey"
      FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: foto galeri tanpa berkasnya tidak bisa ditampilkan (pola sama FotoKegiatanBankSampah).
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FotoKegiatanLembaga_imageId_fkey') THEN
    ALTER TABLE "FotoKegiatanLembaga" ADD CONSTRAINT "FotoKegiatanLembaga_imageId_fkey"
      FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
