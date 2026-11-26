-- Kenapa: desa sementara tidak mau menampilkan harga produk UMKM di website publik. Saklar global di admin
-- (tab Produk) menyembunyikan harga tanpa menghapus harga yang sudah diisi. Murni additive: tabel baru,
-- tanpa baris = harga tetap tampil seperti sebelumnya.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS).

-- CreateTable
CREATE TABLE IF NOT EXISTS "UmkmConfig" (
    "id" TEXT NOT NULL,
    "sembunyikanHarga" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UmkmConfig_pkey" PRIMARY KEY ("id")
);
