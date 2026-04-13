import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const prestasiDesa = loadJsonData("landing-page/prestasi-desa/prestasi-desa.json");
const kategoriPrestasiDesa = loadJsonData("landing-page/prestasi-desa/kategori-prestasi.json");

export async function seedPrestasiDesa() {

  console.log("🔄 Seeding Kategori Prestasi Desa...");
for (const c of kategoriPrestasiDesa) {
    await prisma.kategoriPrestasiDesa.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
      },
      create: {
        id: c.id,
        name: c.name,
      },
    });
  }
  console.log("kategori prestasi desa success ...");

  console.log("🔄 Seeding Prestasi Desa...");
  for (const m of prestasiDesa) {
    let imageId: string | null = null;

    if (m.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: m.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for prestasi desa "${m.name}": ${m.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.prestasiDesa.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        deskripsi: m.deskripsi,
        kategoriId: m.kategoriId,
        imageId,
      },
      create: {
        id: m.id,
        name: m.name,
        deskripsi: m.deskripsi,
        kategoriId: m.kategoriId,
        imageId,
      },
    });
  }

  console.log("prestasi desa success ...");
}
  