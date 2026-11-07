import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";
import { loadRetiredSeed, retireSeedRows } from "../../retire-seed-rows";

const kategoriKegiatanJson = loadJsonData("desa/kegiatan-desa/kategori-kegiatan.json");
const kegiatanDesaJson = loadJsonData("desa/kegiatan-desa/kegiatan-desa.json");
const kategoriPensiun = loadRetiredSeed<{ id: string; nama: string; replacedBy: string }>(
  "desa/kegiatan-desa/kategori-kegiatan.retired.json",
);

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

  // Di sini, bukan di seeder gotong royong: kategori pengganti baru pasti ada setelah loop di atas.
  // Kegiatan yang memakai kategori lama (termasuk buatan admin) dipindah dulu agar kategori lama bisa dihapus.
  for (const k of kategoriPensiun) {
    await prisma.kegiatanDesa.updateMany({
      where: { kategoriKegiatanId: k.id },
      data: { kategoriKegiatanId: k.replacedBy },
    });
  }
  await retireSeedRows("Kategori Kegiatan", kategoriPensiun, (k) =>
    prisma.kategoriKegiatan.deleteMany({ where: { id: k.id, nama: k.nama } }),
  );

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
        anggaran: item.anggaran ?? null,
        progres: item.progres ?? null,
        statusPembangunan: item.statusPembangunan ?? null,
        sumberDana: item.sumberDana ?? null,
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
        anggaran: item.anggaran ?? null,
        progres: item.progres ?? null,
        statusPembangunan: item.statusPembangunan ?? null,
        sumberDana: item.sumberDana ?? null,
      },
    });
    console.log(`  ✅ Kegiatan: ${item.judul}`);
  }

  console.log("🎉 Kegiatan Desa seed selesai");
}
