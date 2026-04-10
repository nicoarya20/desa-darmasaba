import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const perbekelDariMasaKeMasa = loadJsonData("desa/profile/profile-perbekel-lalu.json");

export async function seedProfilePerbekel() {
   console.log("🔄 Seeding Perbekel Dari Masa Ke Masa...");
for (const p of perbekelDariMasaKeMasa) {
  let imageId: string | null = null;

  if (p.imageName) {
    const image = await prisma.fileStorage.findUnique({
      where: { name: p.imageName },
      select: { id: true },
    });

    if (!image) {
      console.warn(
        `⚠️ Image not found for Perbekel Dari Masa Ke Masa  "${p.nama}": ${p.imageName}`,
      );
    } else {
      imageId = image.id;
    }
  }

  await prisma.perbekelDariMasaKeMasa.upsert({
    where: { id: p.id },
    update: {
      nama: p.nama,
      periode: p.periode,
      daerah: p.daerah,
      imageId,
    },
    create: {
      id: p.id,
      nama: p.nama,
      periode: p.periode,
      daerah: p.daerah,
      imageId,
    },
  });
}
console.log("✅ Pejabat Desa seeding completed");
}