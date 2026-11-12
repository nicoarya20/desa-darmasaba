-- Kenapa: pengelola ingin menu admin yang terbuka untuk SEMUA admin sekaligus ("Publik"),
-- tanpa mengatur satu per satu di Menu Access per user. Menu ini ditambahkan di atas
-- akses per user/role, jadi tabel ini tidak pernah mengurangi akses siapa pun.
-- Murni menambah tabel kosong; idempoten (IF NOT EXISTS).

-- CreateTable
CREATE TABLE IF NOT EXISTS "PublicMenuAccess" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicMenuAccess_pkey" PRIMARY KEY ("id")
);

-- Kenapa unik: satu menu cukup dicatat sekali; simpan = ganti seluruh daftar.
-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PublicMenuAccess_menuId_key" ON "PublicMenuAccess"("menuId");
