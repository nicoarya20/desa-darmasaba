-- Kenapa: Super Admin/Developer perlu menampilkan/menyembunyikan submenu website publik
-- tanpa deploy ulang. Default visibilitas tetap di config kode (src/con/navbar-list-menu.ts,
-- field `hidden`); tabel ini hanya menyimpan OVERRIDE per submenu. Tanpa row = default,
-- jadi tabel kosong setelah migrasi = perilaku lama persis (tidak butuh backfill).
-- menuKey = href submenu (mis. "/darmasaba/kesehatan/puskesmas") karena lebih stabil
-- daripada id urut "3.3" yang bergeser bila menu disusun ulang.
-- updatedById ON DELETE SET NULL: jejak siapa yang mengubah boleh hilang bila user dihapus,
-- tapi pengaturannya sendiri tidak boleh ikut terhapus.
-- Murni additive & idempoten agar aman dijalankan ulang.

-- CreateTable
CREATE TABLE IF NOT EXISTS "MenuVisibility" (
    "id" TEXT NOT NULL,
    "menuKey" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: satu override per submenu (upsert berdasarkan menuKey)
CREATE UNIQUE INDEX IF NOT EXISTS "MenuVisibility_menuKey_key" ON "MenuVisibility"("menuKey");

-- AddForeignKey (PostgreSQL tidak punya IF NOT EXISTS untuk constraint, jadi dicek manual)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MenuVisibility_updatedById_fkey') THEN
        ALTER TABLE "MenuVisibility" ADD CONSTRAINT "MenuVisibility_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
