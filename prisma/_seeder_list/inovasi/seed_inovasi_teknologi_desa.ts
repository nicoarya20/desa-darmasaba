import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";
import { isInovasiKategori } from "@/lib/inovasi-teknologi/kategori";

const inovasiTeknologiDesa = loadJsonData("inovasi/inovasi-teknologi-desa/inovasi-teknologi-desa.json");

/** Seed Inovasi Teknologi Desa (gabungan Desa Digital + Info Teknologi Tepat Guna, dibedakan `kategori`). */
export async function seedInovasiTeknologiDesa() {
  console.log("🔄 Seeding Inovasi Teknologi Desa...");
  for (const d of inovasiTeknologiDesa) {
    if (!isInovasiKategori(d.kategori)) {
      throw new Error(`Seed inovasi teknologi desa "${d.id}": kategori "${d.kategori}" tidak dikenal`);
    }

    let imageId: string | null = null;
    if (d.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: d.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(`⚠️ Image not found for inovasi teknologi desa "${d.name}": ${d.imageName}`);
      } else {
        imageId = image.id;
      }
    }

    const data = { name: d.name, deskripsi: d.deskripsi, kategori: d.kategori, imageId };
    await prisma.inovasiTeknologiDesa.upsert({
      where: { id: d.id },
      update: data,
      create: { id: d.id, ...data },
    });
  }
  console.log("✅ Inovasi Teknologi Desa seeded successfully");
}
