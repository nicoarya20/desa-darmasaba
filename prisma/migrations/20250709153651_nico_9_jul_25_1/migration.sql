-- CreateTable
CREATE TABLE "DetailDataPengangguran" (
    "id" UUID NOT NULL,
    "month" VARCHAR(20) NOT NULL,
    "year" INTEGER NOT NULL,
    "totalUnemployment" INTEGER NOT NULL,
    "educatedUnemployment" INTEGER NOT NULL,
    "uneducatedUnemployment" INTEGER NOT NULL,
    "percentageChange" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DetailDataPengangguran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DetailDataPengangguran_month_year_key" ON "DetailDataPengangguran"("month", "year");
