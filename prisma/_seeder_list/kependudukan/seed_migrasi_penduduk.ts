import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const migrasiPendudukJson = loadJsonData("kependudukan/migrasi-penduduk/migrasi-penduduk.json");

export async function seedMigrasiPenduduk() {
  console.log("Seeding MigrASI PENDUDUK...");

  for (const item of migrasiPendudukJson) {
    await prisma.migrasiPenduduk.upsert({
      where: { id: item.id },
      update: {
        nama: item.nama,
        jenis: item.jenis,
        tanggal: new Date(item.tanggal),
        asal: item.asal,
        tujuan: item.tujuan,
        alasan: item.alasan,
      },
      create: {
        id: item.id,
        nama: item.nama,
        jenis: item.jenis,
        tanggal: new Date(item.tanggal),
        asal: item.asal,
        tujuan: item.tujuan,
        alasan: item.alasan,
      },
    });
    console.log(`  ${item.nama}: ${item.jenis} (${item.alasan})`);
  }

  console.log("Migrasi Penduduk seed selesai");
}
