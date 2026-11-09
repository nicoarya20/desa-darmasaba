import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const keamananLingkunganJson = loadJsonData("keamanan/keamanan-lingkungan/keamanan-lingkungan.json");

export async function seedKeamananLingkungan() {
console.log("🔄 Seeding Keamanan Lingkungan...");

  for (const p of keamananLingkunganJson) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for keamanan lingkungan "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.keamananLingkungan.upsert({
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

    console.log(`✅ Keamanan lingkungan seeded: ${p.name}`);
  }

  console.log("🎉 Keamanan lingkungan seed selesai");
}