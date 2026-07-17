-- CreateTable
CREATE TABLE "KesejahteraanMasyarakat" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT,
    "content" TEXT NOT NULL,
    "linkVideo" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KesejahteraanMasyarakat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_KesejahteraanImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_KesejahteraanImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_KesejahteraanImages_B_index" ON "_KesejahteraanImages"("B");

-- AddForeignKey
ALTER TABLE "KesejahteraanMasyarakat" ADD CONSTRAINT "KesejahteraanMasyarakat_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KesejahteraanImages" ADD CONSTRAINT "_KesejahteraanImages_A_fkey" FOREIGN KEY ("A") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KesejahteraanImages" ADD CONSTRAINT "_KesejahteraanImages_B_fkey" FOREIGN KEY ("B") REFERENCES "KesejahteraanMasyarakat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
