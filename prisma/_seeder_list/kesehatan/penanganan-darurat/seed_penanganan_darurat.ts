import prisma from "@/lib/prisma";
import penangananDaruratJson from "../../../data/kesehatan/penanganan-darurat/penganan-darurat.json";

export async function seedPenangananDarurat() {
  console.log("🔄 Seeding Penanganan Darurat...");

  for (const p of penangananDaruratJson) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for penanganan darurat "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.penangananDarurat.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
        imageId,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
        imageId,
      },
    });

    console.log(`✅ Penanganan darurat seeded: ${p.name}`);
  }

  console.log("🎉 Penanganan darurat seed selesai");
}
