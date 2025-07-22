-- CreateTable
CREATE TABLE "PejabatDesa" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "position" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PejabatDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramInovasi" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "imageId" TEXT,
    "link" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProgramInovasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaSosial" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "iconUrl" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MediaSosial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PejabatDesa_name_key" ON "PejabatDesa"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramInovasi_name_key" ON "ProgramInovasi"("name");

-- AddForeignKey
ALTER TABLE "PejabatDesa" ADD CONSTRAINT "PejabatDesa_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInovasi" ADD CONSTRAINT "ProgramInovasi_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaSosial" ADD CONSTRAINT "MediaSosial_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
