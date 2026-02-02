import prisma from "@/lib/prisma";
import desaDigital from "../../data/inovasi/desa-digital/desa-digital.json";

export async function seedDesaDigital() {
  console.log("🔄 Seeding Desa Digital...");
  for (const d of desaDigital) {
    await prisma.desaDigital.upsert({
      where: {
        id: d.id,
      },
      update: {
        name: d.name,
        deskripsi: d.deskripsi,
        imageId: d.imageId,
      },
      create: {
        id: d.id,
        name: d.name,
        deskripsi: d.deskripsi,
        imageId: d.imageId,
      },
    });
  }
  console.log("✅ Desa Digital seeded successfully");
}
