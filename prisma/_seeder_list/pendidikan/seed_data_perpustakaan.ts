import prisma from "@/lib/prisma";
import dataPerpustakaan from "../../data/pendidikan/perpustakaan-digital/perpustakaan-digital.json";
import kategoriBuku from "../../data/pendidikan/perpustakaan-digital/kategori-buku.json";

export async function seedDataPerpustakaan() {
  console.log("🔄 Seeding Kategori Buku...");
  for (const k of kategoriBuku) {
    await prisma.kategoriBuku.upsert({
      where: {
        id: k.id,
      },
      update: {
        name: k.name,
      },
      create: {
        id: k.id,
        name: k.name,
      },
    });
  }
  console.log("✅ Kategori Buku seeded successfully");

  console.log("🔄 Seeding Data perpustakaan...");
  for (const k of dataPerpustakaan) {
  let imageId: string | null = null;

  if (k.imageName) {
    const image = await prisma.fileStorage.findUnique({
      where: { name: k.imageName },
      select: { id: true },
    });

    if (!image) {
      console.warn(
        `⚠️ Image not found for perpustakaan "${k.judul}": ${k.imageName}`,
      );
    } else {
      imageId = image.id;
    }
  }

    await prisma.dataPerpustakaan.upsert({
      where: {
        id: k.id,
      },
      update: {
        judul: k.judul,
        deskripsi: k.deskripsi,
        kategoriId: k.kategoriId,
        imageId: imageId
      },
      create: {
        id: k.id,
        judul: k.judul,
        deskripsi: k.deskripsi,
        kategoriId: k.kategoriId,
        imageId: imageId
      },
    });
  }
  console.log("✅ Data perpustakaan seeded successfully");
}
