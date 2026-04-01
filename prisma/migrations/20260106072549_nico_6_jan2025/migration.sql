/*
  Warnings:

  - You are about to drop the column `dokterdanTenagaMedisId` on the `FasilitasKesehatan` table. All the data in the column will be lost.
  - You are about to drop the column `tarifDanLayananId` on the `FasilitasKesehatan` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FasilitasKesehatan" DROP CONSTRAINT "FasilitasKesehatan_dokterdanTenagaMedisId_fkey";

-- DropForeignKey
ALTER TABLE "FasilitasKesehatan" DROP CONSTRAINT "FasilitasKesehatan_tarifDanLayananId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserSession" DROP CONSTRAINT "UserSession_userId_fkey";

-- AlterTable
ALTER TABLE "DokterdanTenagaMedis" ADD COLUMN     "jadwalLibur" TEXT,
ADD COLUMN     "jamBukaLibur" TEXT,
ADD COLUMN     "jamBukaOperasional" TEXT,
ADD COLUMN     "jamTutupLibur" TEXT,
ADD COLUMN     "jamTutupOperasional" TEXT;

-- AlterTable
ALTER TABLE "FasilitasKesehatan" DROP COLUMN "dokterdanTenagaMedisId",
DROP COLUMN "tarifDanLayananId";

-- AlterTable
ALTER TABLE "MediaSosial" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "permissions" DROP NOT NULL;

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserSession";

-- DropTable
DROP TABLE "permissions";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "roleId" TEXT NOT NULL DEFAULT '2',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "sessionInvalid" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "permissions" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMenuAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMenuAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Tarif" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Tarif_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Dokter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Dokter_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nomor_key" ON "users"("nomor");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_token_idx" ON "user_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserMenuAccess_userId_menuId_key" ON "UserMenuAccess"("userId", "menuId");

-- CreateIndex
CREATE INDEX "_Tarif_B_index" ON "_Tarif"("B");

-- CreateIndex
CREATE INDEX "_Dokter_B_index" ON "_Dokter"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMenuAccess" ADD CONSTRAINT "UserMenuAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tarif" ADD CONSTRAINT "_Tarif_A_fkey" FOREIGN KEY ("A") REFERENCES "FasilitasKesehatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Tarif" ADD CONSTRAINT "_Tarif_B_fkey" FOREIGN KEY ("B") REFERENCES "TarifDanLayanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Dokter" ADD CONSTRAINT "_Dokter_A_fkey" FOREIGN KEY ("A") REFERENCES "DokterdanTenagaMedis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Dokter" ADD CONSTRAINT "_Dokter_B_fkey" FOREIGN KEY ("B") REFERENCES "FasilitasKesehatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
