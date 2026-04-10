import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const dataBanjarJson = loadJsonData("kependudukan/data-banjar/data-banjar.json");

export async function seedDataBanjar() {
  console.log("Seeding Data Banjar...");

  for (const item of dataBanjarJson) {
    await prisma.dataBanjar.upsert({
      where: { id: item.id },
      update: {
        nama: item.nama,
        penduduk: item.penduduk,
        kk: item.kk,
        miskin: item.miskin,
        tahun: item.tahun,
      },
      create: {
        id: item.id,
        nama: item.nama,
        penduduk: item.penduduk,
        kk: item.kk,
        miskin: item.miskin,
        tahun: item.tahun,
      },
    });
    console.log(`  Banjar: ${item.nama} (${item.penduduk} penduduk)`);
  }

  console.log("Data Banjar seed selesai");
}
