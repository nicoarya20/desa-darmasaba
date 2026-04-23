import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const grafikKepuasanJson = loadJsonData("kesehatan/grafik-kepuasan/grafik-kepuasan.json");

export async function seedGrafikKepuasan() {
  console.log("Seeding Grafik Kepuasan...");

  for (const item of grafikKepuasanJson) {
    await prisma.grafikKepuasan.upsert({
      where: { id: item.id },
      update: {
        nama: item.nama,
        tanggal: new Date(item.tanggal),
        jenisKelamin: item.jenisKelamin,
        alamat: item.alamat,
        penyakit: item.penyakit,
      },
      create: {
        id: item.id,
        nama: item.nama,
        tanggal: new Date(item.tanggal),
        jenisKelamin: item.jenisKelamin,
        alamat: item.alamat,
        penyakit: item.penyakit,
      },
    });
    console.log(`  Grafik Kepuasan: ${item.nama}`);
  }

  console.log("Grafik Kepuasan seed selesai");
}
