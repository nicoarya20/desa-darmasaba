import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const laporanPublik = loadJsonData("keamanan/laporan-publik/laporan-publik.json");
const penangananLaporan = loadJsonData("keamanan/laporan-publik/penanganan-laporan.json");

export async function seedLaporanPublik() {
  console.log("🔄 Seeding Laporan Publik...");
  for (const l of laporanPublik) {
    await prisma.laporanPublik.upsert({
      where: {
        id: l.id,
      },
      update: {
        judul: l.judul,
        lokasi: l.lokasi,
        tanggalWaktu: l.tanggalWaktu,
        kronologi: l.kronologi,
      },
      create: {
        id: l.id,
        judul: l.judul,
        lokasi: l.lokasi,
        tanggalWaktu: l.tanggalWaktu,
        kronologi: l.kronologi,
      },
    });
  }

  console.log("laporan publik success ...");

  console.log("🔄 Seeding Penanganan Laporan...");
  for (const l of penangananLaporan) {
    await prisma.penangananLaporanPublik.upsert({
      where: {
        id: l.id,
      },
      update: {
        deskripsi: l.deskripsi,
        laporanId: l.laporanId,
      },
      create: {
        id: l.id,
        deskripsi: l.deskripsi,
        laporanId: l.laporanId,
      },
    });
  }

  console.log("penanganan laporan success ...");
}