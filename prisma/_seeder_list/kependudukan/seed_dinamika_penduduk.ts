import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const dinamikaPendudukJson = loadJsonData("kependudukan/dinamika-penduduk/dinamika-penduduk.json");

export async function seedDinamikaPenduduk() {
  console.log("Seeding Dinamika Penduduk...");

  for (const item of dinamikaPendudukJson) {
    // Kunci upsert = tahun (unik), bukan id: baris tahun yang sama bisa sudah dibuat admin dengan id lain,
    // dan create-by-id akan gagal unique constraint.
    await prisma.dinamikaPenduduk.upsert({
      where: { tahun: item.tahun },
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
