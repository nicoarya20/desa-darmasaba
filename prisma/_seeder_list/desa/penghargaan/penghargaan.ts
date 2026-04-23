import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const penghargaan = loadJsonData("desa/penghargaan/penghargaan.json");

export async function seedPenghargaan() {
  console.log("🔄 Seeding Penghargaan...");
  for (const m of penghargaan) {
    let imageId: string | null = null;

    if (m.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: m.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for penghargaan "${m.name}": ${m.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.penghargaan.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        juara: m.juara,
        deskripsi: m.deskripsi,
        imageId,
      },
      create: {
        id: m.id,
        name: m.name,
        juara: m.juara,
        deskripsi: m.deskripsi,
        imageId,
      },
    });
  }

  console.log("penghargaan success ...");
}
  