import prisma from "@/lib/prisma";
import infoWabahPenyakitJson from "../../../data/kesehatan/infowabahpenyakit/infowabahpenyakit.json";

export async function seedInfoWabahPenyakit() {
console.log("🔄 Seeding Info Wabah Penyakit...");

  for (const p of infoWabahPenyakitJson) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for info wabah penyakit "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.infoWabahPenyakit.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsiSingkat: p.deskripsiSingkat,
        deskripsiLengkap: p.deskripsiLengkap,
        imageId,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsiSingkat: p.deskripsiSingkat,
        deskripsiLengkap: p.deskripsiLengkap,
        imageId,
      },
    });

    console.log(`✅ Info wabah penyakit seeded: ${p.name}`);
  }

  console.log("🎉 Info wabah penyakit seed selesai");
}