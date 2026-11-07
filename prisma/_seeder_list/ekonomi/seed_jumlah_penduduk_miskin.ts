import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const jumlahPendudukMiskin = loadJsonData("ekonomi/jumlah-penduduk-miskin/jumlah-penduduk-miskin.json");

export async function seedJumlahPendudukMiskin() {
  console.log("🔄 Seeding Jumlah Penduduk Miskin...");
  for (const k of jumlahPendudukMiskin) {
    await prisma.grafikJumlahPendudukMiskin.upsert({
      where: {
        id: k.id,
      },
      update: {
        year: k.year,
        totalPoorPopulation: k.totalPoorPopulation,
      },
      create: {
        id: k.id,
        year: k.year,
        totalPoorPopulation: k.totalPoorPopulation,
      },
    });
  }
  console.log("✅ Jumlah Penduduk Miskin seeded successfully");
}
