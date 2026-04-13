import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const kategoriGotongRoyong = loadJsonData("lingkungan/gotong-royong/kategori-gotong-royong.json");
const gotongRoyong = loadJsonData("lingkungan/gotong-royong/gotong-royong.json");

export async function seedDataGotongRoyong() {
  console.log("🔄 Seeding Kategori Gotong Royong...");

  for (const k of kategoriGotongRoyong) {
    await prisma.kategoriKegiatan.upsert({
      where: {
        id: k.id,
      },
      update: {
        nama: k.nama,
      },
      create: {
        id: k.id,
        nama: k.nama,
      },
    });
  }
  console.log("✅ Kategori Gotong Royong seeded successfully");

  console.log("🔄 Seeding Gotong Royong...");
  for (const k of gotongRoyong) {
    let imageId: string | null = null;

    if (k.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: k.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for gotong royong "${k.judul}": ${k.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.kegiatanDesa.upsert({
      where: {
        id: k.id,
      },
      update: {
        judul: k.judul,
        deskripsiSingkat: k.deskripsiSingkat,
        deskripsiLengkap: k.deskripsiLengkap,
        tanggal: k.tanggal,
        lokasi: k.lokasi,
        partisipan: k.partisipan,
        imageId: imageId,
        kategoriKegiatanId: k.kategoriKegiatanId,
      },
      create: {
        id: k.id,
        judul: k.judul,
        deskripsiSingkat: k.deskripsiSingkat,
        deskripsiLengkap: k.deskripsiLengkap,
        tanggal: k.tanggal,
        lokasi: k.lokasi,
        partisipan: k.partisipan,
        imageId: imageId,
        kategoriKegiatanId: k.kategoriKegiatanId,
      },
    });
  }
  console.log("✅ Gotong Royong seeded successfully");
}