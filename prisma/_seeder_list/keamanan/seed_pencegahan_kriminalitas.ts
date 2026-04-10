import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const pencegahanKriminalitas = loadJsonData("keamanan/pencegahan-kriminalitas/pencegahan-kriminalitas.json");

export async function seedPencegahanKriminalitas() {
  console.log("🔄 Seeding Pencegahan Kriminalitas...");
  for (const d of pencegahanKriminalitas) {
    await prisma.pencegahanKriminalitas.upsert({
      where: {
        id: d.id,
      },
      update: {
        judul: d.judul,
        deskripsi: d.deskripsi,
        deskripsiSingkat: d.deskripsiSingkat,
        linkVideo: d.linkVideo,
      },
      create: {
        id: d.id,
        judul: d.judul,
        deskripsi: d.deskripsi,
        deskripsiSingkat: d.deskripsiSingkat,
        linkVideo: d.linkVideo,
      },
    });
  }

  console.log("✅ Pencegahan Kriminalitas seeded successfully");
}
