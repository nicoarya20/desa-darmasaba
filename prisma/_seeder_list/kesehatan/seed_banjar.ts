import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const banjarJson = loadJsonData("kesehatan/banjar/banjar.json");

export async function seedBanjar() {
  console.log("🔄 Seeding Banjar...");

  for (const b of banjarJson) {
    await prisma.banjar.upsert({
      where: { id: b.id },
      update: { name: b.name },
      create: { id: b.id, name: b.name },
    });
    console.log(`✅ Banjar seeded: ${b.name}`);
  }

  console.log("🎉 Banjar seed selesai");
}
