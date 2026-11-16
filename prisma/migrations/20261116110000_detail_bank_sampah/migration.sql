-- Kenapa: modal detail Bank Sampah publik (tab Profil / Struktur / Dokumentasi) butuh deskripsi,
-- kontak, media sosial, foto bagan struktur, daftar pengurus, galeri foto kegiatan, dan tautan ke
-- Program Inovasi yang dijalankan TPS (mis. TPS3R). Murni additive: kolom baru nullable, tabel baru,
-- kolom lama (name, alamat, namaTempatMaps, linkPetunjukArah, lat, lng) tidak disentuh.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS + cek pg_constraint).

-- AlterTable
ALTER TABLE "KeteranganBankSampahTerdekat" ADD COLUMN IF NOT EXISTS "deskripsi" TEXT;
ALTER TABLE "KeteranganBankSampahTerdekat" ADD COLUMN IF NOT EXISTS "kontak" TEXT;
-- Kenapa JSONB (bukan tabel): daftar { platform, url } kecil, selalu dibaca utuh bersama barisnya;
-- bentuknya dijaga skema bersama di API (src/lib/konten-bersama/media-sosial.validation.ts).
ALTER TABLE "KeteranganBankSampahTerdekat" ADD COLUMN IF NOT EXISTS "mediaSosial" JSONB;
ALTER TABLE "KeteranganBankSampahTerdekat" ADD COLUMN IF NOT EXISTS "fotoBaganStrukturId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "PengurusBankSampah" (
    "id" TEXT NOT NULL,
    "bankSampahId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "imageId" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PengurusBankSampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FotoKegiatanBankSampah" (
    "id" TEXT NOT NULL,
    "bankSampahId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "keterangan" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FotoKegiatanBankSampah_pkey" PRIMARY KEY ("id")
);

-- Relasi implicit many-to-many Prisma `BankSampahProgramInovasi`
-- (A = KeteranganBankSampahTerdekat.id, B = ProgramInovasi.id, urutan alfabetis nama model).
-- CreateTable
CREATE TABLE IF NOT EXISTS "_BankSampahProgramInovasi" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BankSampahProgramInovasi_AB_pkey" PRIMARY KEY ("A","B")
);

-- Kenapa: pengurus & foto selalu dibaca per bank sampah, urut `urutan`.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "PengurusBankSampah_bankSampahId_urutan_idx" ON "PengurusBankSampah"("bankSampahId", "urutan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FotoKegiatanBankSampah_bankSampahId_urutan_idx" ON "FotoKegiatanBankSampah"("bankSampahId", "urutan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_BankSampahProgramInovasi_B_index" ON "_BankSampahProgramInovasi"("B");

-- Kenapa SET NULL: bagan opsional; berkas yang terhapus cukup mengosongkan rujukan, bank sampah tetap ada.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'KeteranganBankSampahTerdekat_fotoBaganStrukturId_fkey') THEN
    ALTER TABLE "KeteranganBankSampahTerdekat" ADD CONSTRAINT "KeteranganBankSampahTerdekat_fotoBaganStrukturId_fkey"
      FOREIGN KEY ("fotoBaganStrukturId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: pengurus/foto tidak bermakna tanpa bank sampahnya.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PengurusBankSampah_bankSampahId_fkey') THEN
    ALTER TABLE "PengurusBankSampah" ADD CONSTRAINT "PengurusBankSampah_bankSampahId_fkey"
      FOREIGN KEY ("bankSampahId") REFERENCES "KeteranganBankSampahTerdekat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa SET NULL: foto pengurus opsional; pengurus tetap tampil (inisial) bila berkasnya hilang.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PengurusBankSampah_imageId_fkey') THEN
    ALTER TABLE "PengurusBankSampah" ADD CONSTRAINT "PengurusBankSampah_imageId_fkey"
      FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FotoKegiatanBankSampah_bankSampahId_fkey') THEN
    ALTER TABLE "FotoKegiatanBankSampah" ADD CONSTRAINT "FotoKegiatanBankSampah_bankSampahId_fkey"
      FOREIGN KEY ("bankSampahId") REFERENCES "KeteranganBankSampahTerdekat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: foto galeri tanpa berkasnya tidak bisa ditampilkan (pola sama FotoProfilBumDes).
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FotoKegiatanBankSampah_imageId_fkey') THEN
    ALTER TABLE "FotoKegiatanBankSampah" ADD CONSTRAINT "FotoKegiatanBankSampah_imageId_fkey"
      FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: baris penghubung tidak bermakna bila bank sampah atau programnya terhapus permanen.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_BankSampahProgramInovasi_A_fkey') THEN
    ALTER TABLE "_BankSampahProgramInovasi" ADD CONSTRAINT "_BankSampahProgramInovasi_A_fkey"
      FOREIGN KEY ("A") REFERENCES "KeteranganBankSampahTerdekat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_BankSampahProgramInovasi_B_fkey') THEN
    ALTER TABLE "_BankSampahProgramInovasi" ADD CONSTRAINT "_BankSampahProgramInovasi_B_fkey"
      FOREIGN KEY ("B") REFERENCES "ProgramInovasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
