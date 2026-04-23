import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const profilePejabatDesa = loadJsonData("landing-page/profile/profile.json");

export async function seedProfileLP() {
  console.log("🔄 Seeding Pejabat Desa...");
  for (const p of profilePejabatDesa) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for profile  "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.pejabatDesa.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        position: p.position,
        imageId,
      },
      create: {
        id: p.id,
        name: p.name,
        position: p.position,
        imageId,
      },
    });
  }
  console.log("✅ Pejabat Desa seeding completed");
}
