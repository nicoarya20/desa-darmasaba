import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const distribusiAgamaJson = loadJsonData("kependudukan/distribusi-agama/distribusi-agama.json");

export async function seedDistribusiAgama() {
  console.log("Seeding Distribusi Agama...");

  for (const item of distribusiAgamaJson) {
    await prisma.distribusiAgama.upsert({
      where: { id: item.id },
      update: {
        agama: item.agama,
        jumlah: item.jumlah,
        tahun: item.tahun,
      },
      create: {
        id: item.id,
        agama: item.agama,
        jumlah: item.jumlah,
        tahun: item.tahun,
      },
    });
    console.log(`  ${item.agama}: ${item.jumlah} penganut`);
  }

  console.log("Distribusi Agama seed selesai");
}
