-- CreateTable
CREATE TABLE "ApbDesa" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "pendapatanId" TEXT NOT NULL,
    "belanjaId" TEXT NOT NULL,
    "pembiayaanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApbDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendapatan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "Pendapatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Belanja" (
    "id" TEXT NOT NULL,
    "penyelenggaraan" INTEGER NOT NULL,
    "pelaksanaanPembangunan" INTEGER NOT NULL,
    "pembinaanMasyarakat" INTEGER NOT NULL,
    "pemberdayaanMasyarakat" INTEGER NOT NULL,
    "penanggulanganBencana" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,

    CONSTRAINT "Belanja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pembiayaan" (
    "id" TEXT NOT NULL,
    "silpa" INTEGER NOT NULL,

    CONSTRAINT "Pembiayaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KlasifikasiBelanja" (
    "id" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "persen" DOUBLE PRECISION NOT NULL,
    "total" INTEGER NOT NULL,
    "apbDesaId" TEXT NOT NULL,

    CONSTRAINT "KlasifikasiBelanja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RincianBelanja" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "klasifikasiBelanjaId" TEXT NOT NULL,

    CONSTRAINT "RincianBelanja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KegiatanSubak" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "apbDesaId" TEXT NOT NULL,

    CONSTRAINT "KegiatanSubak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApbDesaToKegiatanSubak" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ApbDesaToKegiatanSubak_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BelanjaToKlasifikasiBelanja" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BelanjaToKlasifikasiBelanja_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_KlasifikasiBelanjaToRincianBelanja" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_KlasifikasiBelanjaToRincianBelanja_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ApbDesaToKegiatanSubak_B_index" ON "_ApbDesaToKegiatanSubak"("B");

-- CreateIndex
CREATE INDEX "_BelanjaToKlasifikasiBelanja_B_index" ON "_BelanjaToKlasifikasiBelanja"("B");

-- CreateIndex
CREATE INDEX "_KlasifikasiBelanjaToRincianBelanja_B_index" ON "_KlasifikasiBelanjaToRincianBelanja"("B");

-- AddForeignKey
ALTER TABLE "ApbDesa" ADD CONSTRAINT "ApbDesa_pendapatanId_fkey" FOREIGN KEY ("pendapatanId") REFERENCES "Pendapatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApbDesa" ADD CONSTRAINT "ApbDesa_belanjaId_fkey" FOREIGN KEY ("belanjaId") REFERENCES "Belanja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApbDesa" ADD CONSTRAINT "ApbDesa_pembiayaanId_fkey" FOREIGN KEY ("pembiayaanId") REFERENCES "Pembiayaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApbDesaToKegiatanSubak" ADD CONSTRAINT "_ApbDesaToKegiatanSubak_A_fkey" FOREIGN KEY ("A") REFERENCES "ApbDesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApbDesaToKegiatanSubak" ADD CONSTRAINT "_ApbDesaToKegiatanSubak_B_fkey" FOREIGN KEY ("B") REFERENCES "KegiatanSubak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BelanjaToKlasifikasiBelanja" ADD CONSTRAINT "_BelanjaToKlasifikasiBelanja_A_fkey" FOREIGN KEY ("A") REFERENCES "Belanja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BelanjaToKlasifikasiBelanja" ADD CONSTRAINT "_BelanjaToKlasifikasiBelanja_B_fkey" FOREIGN KEY ("B") REFERENCES "KlasifikasiBelanja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KlasifikasiBelanjaToRincianBelanja" ADD CONSTRAINT "_KlasifikasiBelanjaToRincianBelanja_A_fkey" FOREIGN KEY ("A") REFERENCES "KlasifikasiBelanja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KlasifikasiBelanjaToRincianBelanja" ADD CONSTRAINT "_KlasifikasiBelanjaToRincianBelanja_B_fkey" FOREIGN KEY ("B") REFERENCES "RincianBelanja"("id") ON DELETE CASCADE ON UPDATE CASCADE;
