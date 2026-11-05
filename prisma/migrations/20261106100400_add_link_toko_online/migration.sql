-- Kenapa: produk UMKM (PasarDesa) hanya bisa dipesan lewat WhatsApp; warga yang ingin
-- membeli lewat Shopee/Tokopedia/TikTok Shop/dll. tidak punya tautan resmi dari katalog.
-- Tabel baru ini menampung maksimal 5 link toko online per produk (divalidasi aplikasi).
-- "platform" berupa TEXT (bukan enum DB) agar penambahan platform tidak butuh migrasi tipe.
-- Murni additive: tidak mengubah tabel PasarDesa; produk lama otomatis tanpa link.
-- onDelete CASCADE: link ikut terhapus bila baris produk dihapus permanen
-- (soft delete produk disaring di sisi aplikasi). Idempoten agar aman dijalankan ulang.

-- CreateTable
CREATE TABLE IF NOT EXISTS "LinkTokoOnline" (
    "id" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LinkTokoOnline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: link selalu dimuat per produk (include di katalog UMKM)
CREATE INDEX IF NOT EXISTS "LinkTokoOnline_produkId_idx" ON "LinkTokoOnline"("produkId");

-- AddForeignKey (PostgreSQL tidak punya IF NOT EXISTS untuk constraint, jadi dicek manual)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LinkTokoOnline_produkId_fkey') THEN
        ALTER TABLE "LinkTokoOnline" ADD CONSTRAINT "LinkTokoOnline_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "PasarDesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
