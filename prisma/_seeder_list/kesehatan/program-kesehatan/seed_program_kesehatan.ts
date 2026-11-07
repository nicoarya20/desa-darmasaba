import prisma from "../../../seed-prisma";
import { loadJsonData } from "../../../load-json";

const programKesehatanJson = loadJsonData("kesehatan/program-kesehatan/program-kesehatan.json");

export async function seedProgramKesehatan() {
  for (const p of programKesehatanJson) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for program kesehatan "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.programKesehatan.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsiSingkat: p.deskripsiSingkat,
        deskripsi: p.deskripsi,
        persentase: p.persentase ?? 0,
        imageId,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsiSingkat: p.deskripsiSingkat,
        deskripsi: p.deskripsi,
        persentase: p.persentase ?? 0,
        imageId,
      },
    });

    console.log(`✅ Program kesehatan seeded: ${p.name}`);
  }
}