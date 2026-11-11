import prisma from "../../../seed-prisma";
import { loadJsonData } from "../../../load-json";

const sdgsDesa = loadJsonData("landing-page/sdgs-desa/sdgs-desa.json");

export async function seedSDGSDesa() {
  console.log("🔄 Seeding SDGS Desa...");
  for (const m of sdgsDesa) {
    let imageId: string | null = null;

    if (m.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: m.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for sdgs desa "${m.name}": ${m.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.sdgsDesa.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        jumlah: m.jumlah,
        imageId,
      },
      create: {
        id: m.id,
        name: m.name,
        jumlah: m.jumlah,
        imageId,
      },
    });
  }

  console.log("sdgs desa success ...");
}
