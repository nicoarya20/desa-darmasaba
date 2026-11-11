import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const infoTeknologi = loadJsonData("inovasi/info-teknologi/info-teknologi.json");

export async function seedInfoTeknologi() {
  console.log("🔄 Seeding Info Teknologi...");
  for (const p of infoTeknologi) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for berita "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.infoTekno.upsert({
      where: {
        id: p.id,
      },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
        imageId: imageId,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
        imageId: imageId,
      },
    });
  }
  console.log("✅ Info Teknologi seeded successfully");
}
