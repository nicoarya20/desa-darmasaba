import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const dinamikaPendudukJson = loadJsonData("kependudukan/dinamika-penduduk/dinamika-penduduk.json");

export async function seedDinamikaPenduduk() {
  console.log("Seeding Dinamika Penduduk...");

  for (const item of dinamikaPendudukJson) {
    await prisma.dinamikaPenduduk.upsert({
      where: { id: item.id },
      update: {
        tahun: item.tahun,
        kelahiran: item.kelahiran,
        kematian: item.kematian,
        masuk: item.masuk,
        keluar: item.keluar,
      },
      create: {
        id: item.id,
        tahun: item.tahun,
        kelahiran: item.kelahiran,
        kematian: item.kematian,
        masuk: item.masuk,
        keluar: item.keluar,
      },
    });
    console.log(`  Tahun ${item.tahun}: ${item.kelahiran} kelahiran, ${item.kematian} kematian`);
  }

  console.log("Dinamika Penduduk seed selesai");
}
