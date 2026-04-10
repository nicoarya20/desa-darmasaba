import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const tipsKeamananJson = loadJsonData("keamanan/tips-keamanan/tips-keamanan.json");

export async function seedTipsKeamanan() {
   console.log("🔄 Seeding Tips Keamanan...");

  for (const p of tipsKeamananJson) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for tips keamanan "${p.judul}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.menuTipsKeamanan.upsert({
      where: { id: p.id },
      update: {
        judul: p.judul,
        deskripsi: p.deskripsi,
        imageId,
      },
      create: {
        id: p.id,
        judul: p.judul,
        deskripsi: p.deskripsi,
        imageId,
      },
    });

    console.log(`✅ Tips Keamanan seeded: ${p.judul}`);
  }

  console.log("🎉 Tips Keamanan seed selesai"); 
}