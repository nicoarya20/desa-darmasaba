import prisma from "@/lib/prisma";
import kategoriBerita from "../../../data/desa/berita/kategori-berita.json";
import beritaJson from "../../../data/desa/berita/berita.json";

export async function seedBerita() {
  // ================== SUBMENU BERITA ========================
  console.log("🔄 Seeding Kategori Berita...");
  for (const k of kategoriBerita) {
    await prisma.kategoriBerita.upsert({
      where: {
        name: k.name, // ✅ cocok dengan @unique
      },
      update: {
        name: k.name,
        isActive: true,
      },
      create: {
        id: k.id, // ✅ id tetap bisa disimpan
        name: k.name,
        isActive: true,
      },
    });
  }

  console.log("kategori berita success ...");

  console.log("🔄 Seeding Berita...");

  for (const b of beritaJson) {
    let imageId: string | null = null;

    if (b.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: b.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for berita "${b.judul}": ${b.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.berita.upsert({
      where: { id: b.id },
      update: {
        judul: b.judul,
        deskripsi: b.deskripsi,
        content: b.content,
        kategoriBeritaId: b.kategoriBeritaId,
        imageId,
      },
      create: {
        id: b.id,
        judul: b.judul,
        deskripsi: b.deskripsi,
        content: b.content,
        kategoriBeritaId: b.kategoriBeritaId,
        imageId,
      },
    });

    console.log(`✅ Berita seeded: ${b.judul}`);
  }

  console.log("🎉 Berita seed selesai");
}

