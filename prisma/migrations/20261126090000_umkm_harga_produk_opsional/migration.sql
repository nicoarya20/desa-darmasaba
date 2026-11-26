-- Kenapa: sebagian produk UMKM desa harganya tidak tetap (naik-turun), jadi admin perlu bisa mengosongkan harga.
-- Sebelumnya form memaksa harga kosong tersimpan sebagai 0 sehingga publik menampilkan "Rp0"; harga 0 dianggap
-- "belum ada harga" (keputusan user 2026-11-26) dan dikosongkan. Riwayat transaksi (PenjualanProduk.hargaSatuan)
-- tidak disentuh. Idempoten: DROP NOT NULL dan UPDATE ... WHERE harga = 0 aman dijalankan ulang.

-- AlterTable
ALTER TABLE "PasarDesa" ALTER COLUMN "harga" DROP NOT NULL;

-- Backfill: harga 0 = belum ada harga.
UPDATE "PasarDesa" SET "harga" = NULL WHERE "harga" = 0;
