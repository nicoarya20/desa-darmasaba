import { loadJsonData } from "../../../load-json";
import prisma from "@/lib/prisma";

const kontakDaruratJson = loadJsonData("kesehatan/kontak-darurat/kontak-darurat.json");

export async function seedKontakDarurat() {
  console.log("🔄 Seeding Kontak Darurat...");

  for (const p of kontakDaruratJson) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for kontak darurat "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.kontakDarurat.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
        imageId,
        whatsapp: p.whatsapp,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
        imageId,
        whatsapp: p.whatsapp,
      },
    });

    console.log(`✅ Kontak darurat seeded: ${p.name}`);
  }

  console.log("🎉 Kontak darurat seed selesai");
}
