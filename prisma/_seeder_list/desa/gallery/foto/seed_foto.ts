import prisma from "@/lib/prisma";
import foto from "../../../../data/desa/gallery/foto/foto.json";

export async function seedFoto() {
  console.log("🔄 Seeding Foto...");
  for (const f of foto) {
    let imagesId: string | null = null;

    if (f.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: f.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for foto  "${f.name}": ${f.imageName}`,
        );
      } else {
        imagesId = image.id;
      }
    }

    await prisma.galleryFoto.upsert({
      where: { id: f.id },
      update: {
        name: f.name,
        deskripsi: f.deskripsi,
        imagesId,
      },
      create: {
        id: f.id,
        name: f.name,
        deskripsi: f.deskripsi,
        imagesId,
      },
    });
  }
  console.log("✅ Foto seeding completed");
}