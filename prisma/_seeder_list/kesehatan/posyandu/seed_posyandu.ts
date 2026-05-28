import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const posyanduJson = loadJsonData("kesehatan/posyandu/posyandu.json");

export async function seedPosyandu() {
  console.log("🔄 Seeding Posyandu...");

  for (const p of posyanduJson) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for posyandu "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.posyandu.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        nomor: p.nomor,
        deskripsi: p.deskripsi,
        jadwalPelayanan: p.jadwalPelayanan,
        imageId,
        banjarId: p.banjarId || null,
      },
      create: {
        id: p.id,
        name: p.name,
        nomor: p.nomor,
        deskripsi: p.deskripsi,
        jadwalPelayanan: p.jadwalPelayanan,
        imageId,
        banjarId: p.banjarId || null,
      },
    });

    console.log(`✅ Posyandu seeded: ${p.name}`);
  }

  console.log("🎉 Posyandu seed selesai");
}