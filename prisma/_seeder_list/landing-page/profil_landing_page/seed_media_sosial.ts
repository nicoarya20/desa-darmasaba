import prisma from "../../../seed-prisma";
import { loadJsonData } from "../../../load-json";

const mediaSosial = loadJsonData("landing-page/profile/mediaSosial.json");

export async function seedMediaSosial() {
  console.log("🔄 Seeding Media Sosial...");
  for (const m of mediaSosial) {
    let imageId: string | null = null;

    if (m.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: m.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for berita "${m.name}": ${m.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.mediaSosial.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        iconUrl: m.iconUrl,
        imageId,
      },
      create: {
        id: m.id,
        name: m.name,
        iconUrl: m.iconUrl,
        imageId,
      },
    });
  }

  console.log("media sosial success ...");
}


  