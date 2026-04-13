import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const kategoriPotensi = loadJsonData("desa/potensi/kategori-potensi.json");
const potensiDesa = loadJsonData("desa/potensi/potensi-desa.json");

export async function seedPotensi() {
  console.log("🔄Seeding Kategori Potensi Desa ...");
  for (const c of kategoriPotensi) {
    await prisma.kategoriPotensi.upsert({
      where: {
        id: c.id,
      },
      update: {
        nama: c.nama,
      },
      create: {
        id: c.id,
        nama: c.nama,
      },
    });
  }

  console.log("kategori Potensi success ...");

  console.log("🔄 Seeding Potensi Desa...");
  for (const m of potensiDesa) {
    let imageId: string | null = null;

    if (m.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: m.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for potensi desa "${m.name}": ${m.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.potensiDesa.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        deskripsi: m.deskripsi,
        content: m.content,
        kategoriId: m.kategoriId,
        imageId,
      },
      create: {
        id: m.id,
        name: m.name,
        deskripsi: m.deskripsi,
        content: m.content,
        kategoriId: m.kategoriId,
        imageId,
      },
    });
  }

  console.log("potensi desa success ...");
}
