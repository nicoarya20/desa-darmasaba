-- Lomba Website Desa 2027, juknis butir 7.4: situs belum menampilkan wadah partisipasi warga (PPL, STT, PKK, dll).
-- Daftarnya berisi banyak baris dengan foto dan kontak sendiri, jadi butuh tabel baru. Nama "LembagaKomunitas" dipakai
-- karena tabel "Lembaga" yang sudah ada adalah sekolah PAUD (pendidikan) dan tidak boleh disentuh.
-- Murni aditif dan idempoten: hanya membuat tabel baru + indeks + FK ke "FileStorage"; tidak menyentuh tabel/kolom lain.
-- Sengaja TANPA INSERT: isi daftar datang dari pihak desa lewat CMS. Sengaja TANPA data-migration "UserMenuAccess": ID
-- section 'desa' sudah mencakup semua submenu (sama seperti Indeks Desa), jadi menu baru 'desa.lembaga-komunitas' tidak
-- mengunci siapa pun; user dengan ID submenu per-menu dicentang manual di Menu Access.
-- "jenis" berupa TEXT bebas (bukan enum Postgres) supaya jenis baru tidak memerlukan migrasi; panjang & isinya dijaga API.

CREATE TABLE IF NOT EXISTS "LembagaKomunitas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "deskripsi" TEXT,
    "ketua" TEXT,
    "kontak" TEXT,
    "fotoId" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LembagaKomunitas_pkey" PRIMARY KEY ("id")
);

-- Daftar publik selalu memfilter isActive lalu mengurutkan per jenis dan urutan; indeks ini melayani filter + urutan itu.
CREATE INDEX IF NOT EXISTS "LembagaKomunitas_isActive_jenis_urutan_idx" ON "LembagaKomunitas"("isActive", "jenis", "urutan");

-- FK foto dipakai saat berkas diganti/dihapus (cek "masih dirujuk?") dan saat join foto di daftar.
CREATE INDEX IF NOT EXISTS "LembagaKomunitas_fotoId_idx" ON "LembagaKomunitas"("fotoId");

-- ADD CONSTRAINT tidak punya IF NOT EXISTS, jadi dibungkus pengecualian duplicate_object agar migrasi aman dijalankan
-- ulang. SET NULL: berkas foto yang terhapus tidak boleh ikut menghapus data lembaganya.
DO $$
BEGIN
    ALTER TABLE "LembagaKomunitas" ADD CONSTRAINT "LembagaKomunitas_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
