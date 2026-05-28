-- CreateTable
CREATE TABLE "Banjar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banjar_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Posyandu" ADD COLUMN "banjarId" TEXT;

-- AddForeignKey
ALTER TABLE "Posyandu" ADD CONSTRAINT "Posyandu_banjarId_fkey" FOREIGN KEY ("banjarId") REFERENCES "Banjar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
