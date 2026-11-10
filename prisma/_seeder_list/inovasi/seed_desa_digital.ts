import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const desaDigital = loadJsonData("inovasi/desa-digital/desa-digital.json");

export async function seedDesaDigital() {
  console.log("🔄 Seeding Desa Digital...");
  for (const d of desaDigital) {
    let imageId: string | null = null;

    if (d.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: d.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for desa digital "${d.name}": ${d.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.desaDigital.upsert({
      where: {
        id: d.id,
      },
      update: {
        name: d.name,
        deskripsi: d.deskripsi,
        imageId: imageId,
      },
      create: {
        id: d.id,
        name: d.name,
        deskripsi: d.deskripsi,
        imageId: imageId,
      },
    });
  }
  console.log("✅ Desa Digital seeded successfully");
}
