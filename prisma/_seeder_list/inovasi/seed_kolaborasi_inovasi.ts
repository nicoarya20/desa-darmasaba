import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const kolaborasiInovasi = loadJsonData("inovasi/kolaborasi-inovasi/kolaborasi-inovasi.json");
const mitraKolaborasi = loadJsonData("inovasi/kolaborasi-inovasi/mitra-kolaborasi.json");

export async function seedKolaborasiInovasi() {
  console.log("🔄 Seeding Kolaborasi Inovasi...");
  for (const p of kolaborasiInovasi) {
    await prisma.kolaborasiInovasi.upsert({
      where: {
        id: p.id,
      },
      update: {
        name: p.name,
        tahun: p.tahun,
        slug: p.slug,
        deskripsi: p.deskripsi,
        kolaborator: p.kolaborator,
      },
      create: {
        id: p.id,
        name: p.name,
        tahun: p.tahun,
        slug: p.slug,
        deskripsi: p.deskripsi,
        kolaborator: p.kolaborator,
      },
    });
  }
  console.log("✅ Kolaborasi Inovasi seeded successfully");

  console.log("🔄 Seeding Mitra Kolaborasi...");
  for (const p of mitraKolaborasi) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for mitra kolaborasi "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.mitraKolaborasi.upsert({
      where: {
        id: p.id,
      },
      update: {
        name: p.name,
        imageId: imageId,
      },
      create: {
        id: p.id,
        name: p.name,
        imageId: imageId,
      },
    });
  }
  console.log("✅ Mitra Kolaborasi seeded successfully");
}