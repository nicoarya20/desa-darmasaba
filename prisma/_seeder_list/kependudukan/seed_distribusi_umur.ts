import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const distribusiUmurJson = loadJsonData("kependudukan/distribusi-umur/distribusi-umur.json");

export async function seedDistribusiUmur() {
  console.log("Seeding Distribusi Umur...");

  for (const item of distribusiUmurJson) {
    await prisma.distribusiUmur.upsert({
      where: { id: item.id },
      update: {
        rentangUmur: item.rentangUmur,
        jumlah: item.jumlah,
        tahun: item.tahun,
      },
      create: {
        id: item.id,
        rentangUmur: item.rentangUmur,
        jumlah: item.jumlah,
        tahun: item.tahun,
      },
    });
    console.log(`  Rentang ${item.rentangUmur}: ${item.jumlah} jiwa`);
  }

  console.log("Distribusi Umur seed selesai");
}
