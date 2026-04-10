import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const distribusiUmurJson = loadJsonData("kependudukan/distribusi-umur/distribusi-umur.json");

export async function seedDistribusiUmur() {
  console.log("Seeding Distribusi Umur...");

  for (const item of distribusiUmurJson) {
    await prisma.distribusiUmur.upsert({
      where: { id: item.id },
      update: {
        kelompok: item.kelompok,
        jumlah: item.jumlah,
        tahun: item.tahun,
      },
      create: {
        id: item.id,
        kelompok: item.kelompok,
        jumlah: item.jumlah,
        tahun: item.tahun,
      },
    });
    console.log(`  Kelompok ${item.kelompok}: ${item.jumlah} jiwa`);
  }

  console.log("Distribusi Umur seed selesai");
}
