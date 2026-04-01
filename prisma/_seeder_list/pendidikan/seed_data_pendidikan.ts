import prisma from "@/lib/prisma";
import dataPendidikan from "../../data/pendidikan/data-pendidikan/data-pendidikan.json";

export async function seedDataPendidikan() {
 console.log("🔄 Seeding Data pendidikan...");
  for (const k of dataPendidikan) {
    await prisma.dataPendidikan.upsert({
      where: {
        id: k.id,
      },
      update: {
        name: k.name,
        jumlah: k.jumlah,
      },
      create: {
        id: k.id,
        name: k.name,
        jumlah: k.jumlah,
      },
    });
  }
  console.log("✅ Data pendidikan seeded successfully");
}