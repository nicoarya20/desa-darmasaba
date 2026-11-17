-- Lomba Website Desa 2027, juknis 2.5 (kanal PPID): desa punya banyak PDF dasar hukum (peraturan desa/perbekel, SK, SOP)
-- yang harus bisa dilihat dan diunduh. "DasarHukumPPID" hanya satu baris (singleton), jadi satu kolom fileId di sana
-- tidak cukup; tabel baru ini menyimpan satu dokumen per baris, daftar FLAT tanpa folder (keputusan user). Folder bisa
-- ditambah kemudian lewat kolom nullable tanpa mengubah baris yang ada.
-- Aditif dan idempoten: hanya tabel baru + indeks + FK; tidak ada tabel lama yang disentuh. FK ke "FileStorage" memakai
-- ON DELETE CASCADE (pola "DokumenAPBDes") karena /api/fileStorage/delete menghapus berkas permanen dan RESTRICT
-- akan membuatnya gagal.

CREATE TABLE IF NOT EXISTS "DokumenDasarHukumPPID" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DokumenDasarHukumPPID_pkey" PRIMARY KEY ("id")
);

-- Daftar publik: hanya yang aktif, urut `urutan`.
CREATE INDEX IF NOT EXISTS "DokumenDasarHukumPPID_isActive_urutan_idx" ON "DokumenDasarHukumPPID"("isActive", "urutan");

-- Pemeriksaan rujukan berkas saat penghapusan (lihat fileReferences.ts).
CREATE INDEX IF NOT EXISTS "DokumenDasarHukumPPID_fileId_idx" ON "DokumenDasarHukumPPID"("fileId");

-- FK dijaga pg_constraint karena ADD CONSTRAINT tidak punya IF NOT EXISTS.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DokumenDasarHukumPPID_fileId_fkey') THEN
        ALTER TABLE "DokumenDasarHukumPPID" ADD CONSTRAINT "DokumenDasarHukumPPID_fileId_fkey"
            FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
