-- CreateTable
CREATE TABLE "GrafikMenganggurBerdasarkanUsia" (
    "id" TEXT NOT NULL,
    "usia18_25" TEXT NOT NULL,
    "usia26_35" TEXT NOT NULL,
    "usia36_45" TEXT NOT NULL,
    "usia46_keatas" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GrafikMenganggurBerdasarkanUsia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrafikMenganggurBerdasarkanPendidikan" (
    "id" TEXT NOT NULL,
    "SD" TEXT NOT NULL,
    "SMP" TEXT NOT NULL,
    "SMA" TEXT NOT NULL,
    "D3" TEXT NOT NULL,
    "S1" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GrafikMenganggurBerdasarkanPendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrafikJumlahPendudukMiskin" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "totalPoorPopulation" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GrafikJumlahPendudukMiskin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SektorUnggulanDesa" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SektorUnggulanDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataDemografiPekerjaan" (
    "id" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "lakiLaki" INTEGER NOT NULL,
    "perempuan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DataDemografiPekerjaan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrafikJumlahPendudukMiskin_year_key" ON "GrafikJumlahPendudukMiskin"("year");

-- CreateIndex
CREATE UNIQUE INDEX "SektorUnggulanDesa_name_key" ON "SektorUnggulanDesa"("name");
