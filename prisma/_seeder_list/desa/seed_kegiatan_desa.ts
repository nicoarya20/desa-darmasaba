import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const kategoriKegiatanJson = loadJsonData("desa/kegiatan-desa/kategori-kegiatan.json");
const kegiatanDesaJson = loadJsonData("desa/kegiatan-desa/kegiatan-desa.json");

export async function seedKegiatanDesa() {
  console.log("🔄 Seeding Kategori Kegiatan Desa...");

  for (const k of kategoriKegiatanJson) {
    await prisma.kategoriKegiatan.upsert({
      where: { id: k.id },
      update: { nama: k.nama },
      create: { id: k.id, nama: k.nama },
    });
    console.log(`  ✅ Kategori: ${k.nama}`);
  }

  console.log("🔄 Seeding Kegiatan Desa...");

  for (const item of kegiatanDesaJson) {
    await prisma.kegiatanDesa.upsert({
      where: { id: item.id },
      update: {
        judul: item.judul,
        deskripsiSingkat: item.deskripsiSingkat,
        deskripsiLengkap: item.deskripsiLengkap,
        tanggal: new Date(item.tanggal),
        lokasi: item.lokasi,
        partisipan: item.partisipan,
        kategoriKegiatanId: item.kategoriKegiatanId,
      },
      create: {
        id: item.id,
        judul: item.judul,
        deskripsiSingkat: item.deskripsiSingkat,
        deskripsiLengkap: item.deskripsiLengkap,
        tanggal: new Date(item.tanggal),
        lokasi: item.lokasi,
        partisipan: item.partisipan,
        kategoriKegiatanId: item.kategoriKegiatanId,
      },
    });
    console.log(`  ✅ Kegiatan: ${item.judul}`);
  }

  console.log("🎉 Kegiatan Desa seed selesai");
}
