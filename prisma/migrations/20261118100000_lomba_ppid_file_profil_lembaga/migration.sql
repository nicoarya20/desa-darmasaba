-- Lomba Website Desa 2027, juknis 2.5 (kanal PPID): informasi publik harus bisa diunduh sebagai berkas, dan halaman
-- profil PPID perlu profil lembaga (bukan hanya profil pimpinan). Seluruhnya aditif dan idempoten: kolom baru nullable
-- tanpa backfill (baris lama tetap valid), tabel baru terpisah dari "ProfilePPID" yang tidak disentuh, dan setiap FK
-- ke "FileStorage" memakai ON DELETE SET NULL supaya penghapusan berkas tidak pernah gagal atau menghapus baris PPID.

-- Dasar Hukum PPID: berkas PDF peraturan (opsional).
ALTER TABLE "DasarHukumPPID" ADD COLUMN IF NOT EXISTS "fileId" TEXT;

-- Daftar Informasi Publik: berkas PDF per baris informasi (opsional).
ALTER TABLE "DaftarInformasiPublik" ADD COLUMN IF NOT EXISTS "fileId" TEXT;

-- Profil lembaga PPID: satu baris aktif (deskripsi, tujuan, tugas & fungsi, gambar alur).
CREATE TABLE IF NOT EXISTS "ProfilLembagaPPID" (
    "id" TEXT NOT NULL,
    "deskripsi" TEXT,
    "tujuan" TEXT,
    "tugasFungsi" TEXT,
    "gambarAlurId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProfilLembagaPPID_pkey" PRIMARY KEY ("id")
);

-- FK dijaga pg_constraint karena ADD CONSTRAINT tidak punya IF NOT EXISTS.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DasarHukumPPID_fileId_fkey') THEN
        ALTER TABLE "DasarHukumPPID" ADD CONSTRAINT "DasarHukumPPID_fileId_fkey"
            FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DaftarInformasiPublik_fileId_fkey') THEN
        ALTER TABLE "DaftarInformasiPublik" ADD CONSTRAINT "DaftarInformasiPublik_fileId_fkey"
            FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProfilLembagaPPID_gambarAlurId_fkey') THEN
        ALTER TABLE "ProfilLembagaPPID" ADD CONSTRAINT "ProfilLembagaPPID_gambarAlurId_fkey"
            FOREIGN KEY ("gambarAlurId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
