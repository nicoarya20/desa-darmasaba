import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const demografiPekerjaan = loadJsonData("ekonomi/demografi-pekerjaan/demografi-pekerjaan.json");

export async function seedDemografiPekerjaan() {
  console.log("🔄 Seeding Demografi Pekerjaan...");
  for (const k of demografiPekerjaan) {
    await prisma.dataDemografiPekerjaan.upsert({
      where: {
        id: k.id,
      },
      update: {
        pekerjaan: k.pekerjaan,
        lakiLaki: k.lakiLaki,
        perempuan: k.perempuan,
      },
      create: {
        id: k.id,
        pekerjaan: k.pekerjaan,
        lakiLaki: k.lakiLaki,
        perempuan: k.perempuan,
      },
    });
  }
  console.log("✅ Demografi Pekerjaan seeded successfully");
}
