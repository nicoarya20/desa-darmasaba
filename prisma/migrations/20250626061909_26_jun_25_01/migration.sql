/*
  Warnings:

  - The primary key for the `ArtikelKesehatan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DoctorSign` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FirstAid` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Introduction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MythVsFact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Prevention` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Symptom` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `deskripsiJadwalKegiatanId` to the `JadwalKegiatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dokumenJadwalKegiatanId` to the `JadwalKegiatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `informasiJadwalKegiatanId` to the `JadwalKegiatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `layananJadwalKegiatanId` to the `JadwalKegiatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pendaftaranJadwalKegiatanId` to the `JadwalKegiatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `syaratKetentuanJadwalKegiatanId` to the `JadwalKegiatan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArtikelKesehatan" DROP CONSTRAINT "ArtikelKesehatan_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ArtikelKesehatan_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ArtikelKesehatan_id_seq";

-- AlterTable
ALTER TABLE "DoctorSign" DROP CONSTRAINT "DoctorSign_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "DoctorSign_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DoctorSign_id_seq";

-- AlterTable
ALTER TABLE "FirstAid" DROP CONSTRAINT "FirstAid_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "FirstAid_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FirstAid_id_seq";

-- AlterTable
ALTER TABLE "Introduction" DROP CONSTRAINT "Introduction_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Introduction_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Introduction_id_seq";

-- AlterTable
ALTER TABLE "JadwalKegiatan" ADD COLUMN     "deskripsiJadwalKegiatanId" TEXT NOT NULL,
ADD COLUMN     "dokumenJadwalKegiatanId" TEXT NOT NULL,
ADD COLUMN     "informasiJadwalKegiatanId" TEXT NOT NULL,
ADD COLUMN     "layananJadwalKegiatanId" TEXT NOT NULL,
ADD COLUMN     "pendaftaranJadwalKegiatanId" TEXT NOT NULL,
ADD COLUMN     "syaratKetentuanJadwalKegiatanId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MythVsFact" DROP CONSTRAINT "MythVsFact_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "MythVsFact_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MythVsFact_id_seq";

-- AlterTable
ALTER TABLE "Prevention" DROP CONSTRAINT "Prevention_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Prevention_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Prevention_id_seq";

-- AlterTable
ALTER TABLE "Symptom" DROP CONSTRAINT "Symptom_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Symptom_id_seq";

-- AddForeignKey
ALTER TABLE "JadwalKegiatan" ADD CONSTRAINT "JadwalKegiatan_informasiJadwalKegiatanId_fkey" FOREIGN KEY ("informasiJadwalKegiatanId") REFERENCES "InformasiJadwalKegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKegiatan" ADD CONSTRAINT "JadwalKegiatan_deskripsiJadwalKegiatanId_fkey" FOREIGN KEY ("deskripsiJadwalKegiatanId") REFERENCES "DeskripsiJadwalKegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKegiatan" ADD CONSTRAINT "JadwalKegiatan_layananJadwalKegiatanId_fkey" FOREIGN KEY ("layananJadwalKegiatanId") REFERENCES "LayananJadwalKegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKegiatan" ADD CONSTRAINT "JadwalKegiatan_syaratKetentuanJadwalKegiatanId_fkey" FOREIGN KEY ("syaratKetentuanJadwalKegiatanId") REFERENCES "SyaratKetentuanJadwalKegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKegiatan" ADD CONSTRAINT "JadwalKegiatan_dokumenJadwalKegiatanId_fkey" FOREIGN KEY ("dokumenJadwalKegiatanId") REFERENCES "DokumenJadwalKegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKegiatan" ADD CONSTRAINT "JadwalKegiatan_pendaftaranJadwalKegiatanId_fkey" FOREIGN KEY ("pendaftaranJadwalKegiatanId") REFERENCES "PendaftaranJadwalKegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
