/*
  Warnings:

  - You are about to drop the `_DokterdanTenagaMedisToFasilitasKesehatan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FasilitasKesehatanToFasilitasPendukung` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FasilitasKesehatanToInformasiUmum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FasilitasKesehatanToLayananUnggulan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FasilitasKesehatanToProsedurPendaftaran` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FasilitasKesehatanToTarifDanLayanan` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dokterdanTenagaMedisId` to the `FasilitasKesehatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fasilitasPendukungId` to the `FasilitasKesehatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `informasiUmumId` to the `FasilitasKesehatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `layananUnggulanId` to the `FasilitasKesehatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prosedurPendaftaranId` to the `FasilitasKesehatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tarifDanLayananId` to the `FasilitasKesehatan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_DokterdanTenagaMedisToFasilitasKesehatan" DROP CONSTRAINT "_DokterdanTenagaMedisToFasilitasKesehatan_A_fkey";

-- DropForeignKey
ALTER TABLE "_DokterdanTenagaMedisToFasilitasKesehatan" DROP CONSTRAINT "_DokterdanTenagaMedisToFasilitasKesehatan_B_fkey";

-- DropForeignKey
ALTER TABLE "_FasilitasKesehatanToFasilitasPendukung" DROP CONSTRAINT "_FasilitasKesehatanToFasilitasPendukung_A_fkey";

-- DropForeignKey
ALTER TABLE "_FasilitasKesehatanToFasilitasPendukung" DROP CONSTRAINT "_FasilitasKesehatanToFasilitasPendukung_B_fkey";

-- DropForeignKey
ALTER TABLE "_FasilitasKesehatanToInformasiUmum" DROP CONSTRAINT "_FasilitasKesehatanToInformasiUmum_A_fkey";

-- DropForeignKey
ALTER TABLE "_FasilitasKesehatanToInformasiUmum" DROP CONSTRAINT "_FasilitasKesehatanToInformasiUmum_B_fkey";

-- DropForeignKey
ALTER TABLE "_FasilitasKesehatanToLayananUnggulan" DROP CONSTRAINT "_FasilitasKesehatanToLayananUnggulan_A_fkey";

-- DropForeignKey
ALTER TABLE "_FasilitasKesehatanToLayananUnggulan" DROP CONSTRAINT "_FasilitasKesehatanToLayananUnggulan_B_fkey";

-- DropForeignKey
ALTER TABLE "_FasilitasKesehatanToProsedurPendaftaran" DROP CONSTRAINT "_FasilitasKesehatanToProsedurPendaftaran_A_fkey";

-- DropForeignKey
ALTER TABLE "_FasilitasKesehatanToProsedurPendaftaran" DROP CONSTRAINT "_FasilitasKesehatanToProsedurPendaftaran_B_fkey";

-- DropForeignKey
ALTER TABLE "_FasilitasKesehatanToTarifDanLayanan" DROP CONSTRAINT "_FasilitasKesehatanToTarifDanLayanan_A_fkey";

-- DropForeignKey
ALTER TABLE "_FasilitasKesehatanToTarifDanLayanan" DROP CONSTRAINT "_FasilitasKesehatanToTarifDanLayanan_B_fkey";

-- AlterTable
ALTER TABLE "FasilitasKesehatan" ADD COLUMN     "dokterdanTenagaMedisId" TEXT NOT NULL,
ADD COLUMN     "fasilitasPendukungId" TEXT NOT NULL,
ADD COLUMN     "informasiUmumId" TEXT NOT NULL,
ADD COLUMN     "layananUnggulanId" TEXT NOT NULL,
ADD COLUMN     "prosedurPendaftaranId" TEXT NOT NULL,
ADD COLUMN     "tarifDanLayananId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_DokterdanTenagaMedisToFasilitasKesehatan";

-- DropTable
DROP TABLE "_FasilitasKesehatanToFasilitasPendukung";

-- DropTable
DROP TABLE "_FasilitasKesehatanToInformasiUmum";

-- DropTable
DROP TABLE "_FasilitasKesehatanToLayananUnggulan";

-- DropTable
DROP TABLE "_FasilitasKesehatanToProsedurPendaftaran";

-- DropTable
DROP TABLE "_FasilitasKesehatanToTarifDanLayanan";

-- AddForeignKey
ALTER TABLE "FasilitasKesehatan" ADD CONSTRAINT "FasilitasKesehatan_informasiUmumId_fkey" FOREIGN KEY ("informasiUmumId") REFERENCES "InformasiUmum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FasilitasKesehatan" ADD CONSTRAINT "FasilitasKesehatan_layananUnggulanId_fkey" FOREIGN KEY ("layananUnggulanId") REFERENCES "LayananUnggulan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FasilitasKesehatan" ADD CONSTRAINT "FasilitasKesehatan_dokterdanTenagaMedisId_fkey" FOREIGN KEY ("dokterdanTenagaMedisId") REFERENCES "DokterdanTenagaMedis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FasilitasKesehatan" ADD CONSTRAINT "FasilitasKesehatan_fasilitasPendukungId_fkey" FOREIGN KEY ("fasilitasPendukungId") REFERENCES "FasilitasPendukung"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FasilitasKesehatan" ADD CONSTRAINT "FasilitasKesehatan_prosedurPendaftaranId_fkey" FOREIGN KEY ("prosedurPendaftaranId") REFERENCES "ProsedurPendaftaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FasilitasKesehatan" ADD CONSTRAINT "FasilitasKesehatan_tarifDanLayananId_fkey" FOREIGN KEY ("tarifDanLayananId") REFERENCES "TarifDanLayanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
