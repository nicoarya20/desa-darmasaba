-- Lomba Website Desa 2027: butir 8.3 (tim pengelola/redaksi website) dan butir 3.4 (jam layanan pada kontak desa).
-- Murni aditif dan idempoten (IF NOT EXISTS / guard pg_constraint): tidak mengubah, menghapus, atau mengisi data lama,
-- dan sengaja TANPA INSERT; admin yang mengisi lewat CMS.

-- Kenapa: footer dan halaman PPID perlu menampilkan jam layanan kantor, tetapi desa belum memberi datanya. Kolom NULLABLE
-- tanpa default: NULL = belum diisi (tidak ditampilkan), jadi baris singleton yang sudah ada tidak berubah.
ALTER TABLE "KontakDesa" ADD COLUMN IF NOT EXISTS "jamLayanan" TEXT;

-- Kenapa: footer menampilkan nomor SK Tim Pengelola Website beserta tautan PDF-nya, bukan lagi konstanta di kode.
-- Satu baris singleton (id tetap "tim-pengelola-website", di-upsert admin), sehingga tidak ada kolom isActive/deletedAt.
-- "tanggalSk" bertipe DATE karena SK hanya mencatat tanggal, tanpa jam/zona waktu. "skFileId" nullable: nomor boleh
-- dicatat sebelum PDF-nya ada.
CREATE TABLE IF NOT EXISTS "TimPengelolaWebsite" (
    "id" TEXT NOT NULL,
    "nomorSk" TEXT NOT NULL,
    "tanggalSk" DATE,
    "skFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimPengelolaWebsite_pkey" PRIMARY KEY ("id")
);

-- Kenapa: jabatan teks bebas karena SK memuat banyak peran (Penanggung Jawab, Pembina, Ketua, dst.). "urutan" menjaga
-- susunan seperti di SK; API mengganti seluruh daftar dalam satu transaksi sehingga urutannya selalu rapat 0..n-1.
CREATE TABLE IF NOT EXISTS "AnggotaTimPengelola" (
    "id" TEXT NOT NULL,
    "timId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnggotaTimPengelola_pkey" PRIMARY KEY ("id")
);

-- Pemeriksaan rujukan berkas saat penghapusan (lihat fileReferences.ts) dan pembacaan daftar anggota berurutan.
CREATE INDEX IF NOT EXISTS "TimPengelolaWebsite_skFileId_idx" ON "TimPengelolaWebsite"("skFileId");
CREATE INDEX IF NOT EXISTS "AnggotaTimPengelola_timId_urutan_idx" ON "AnggotaTimPengelola"("timId", "urutan");

-- FK dijaga pg_constraint karena ADD CONSTRAINT tidak punya IF NOT EXISTS.
-- SET NULL pada berkas SK: menghapus berkas lewat /api/fileStorage/delete tidak boleh gagal ataupun ikut menghapus data tim.
-- CASCADE pada anggota: anggota tidak bermakna tanpa timnya.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimPengelolaWebsite_skFileId_fkey') THEN
        ALTER TABLE "TimPengelolaWebsite" ADD CONSTRAINT "TimPengelolaWebsite_skFileId_fkey"
            FOREIGN KEY ("skFileId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AnggotaTimPengelola_timId_fkey') THEN
        ALTER TABLE "AnggotaTimPengelola" ADD CONSTRAINT "AnggotaTimPengelola_timId_fkey"
            FOREIGN KEY ("timId") REFERENCES "TimPengelolaWebsite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
