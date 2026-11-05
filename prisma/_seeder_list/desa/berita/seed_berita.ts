import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const kategoriBerita = loadJsonData("desa/berita/kategori-berita.json");
const beritaJson = loadJsonData("desa/berita/berita.json");

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

  // Build a map of valid kategori IDs
  const validKategoriIds = new Set<string>();
  const kategoriList = await prisma.kategoriBerita.findMany({
    select: { id: true, name: true },
  });
  kategoriList.forEach((k) => validKategoriIds.add(k.id));

  console.log(`📋 Found ${validKategoriIds.size} valid kategori IDs in database`);

  for (const b of beritaJson) {
    // Validate kategoriBeritaId exists
    if (!b.kategoriBeritaId || !validKategoriIds.has(b.kategoriBeritaId)) {
      console.warn(
        `⚠️ Skipping berita "${b.judul}": Invalid kategoriBeritaId "${b.kategoriBeritaId}"`,
      );
      continue;
    }

    let imageId: string | null = null;

    if (b.imageName && b.imageLink) {
      // Gambar berita terbaru disajikan dari public/ (tanpa MinIO): link menunjuk path statis.
      const image = await prisma.fileStorage.upsert({
        where: { name: b.imageName },
        update: { link: b.imageLink, isActive: true },
        create: {
          name: b.imageName,
          realName: b.imageName,
          path: "public",
          mimeType: "image/webp",
          category: "image",
          link: b.imageLink,
          isActive: true,
        },
        select: { id: true },
      });
      imageId = image.id;
    } else if (b.imageName) {
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

    try {
      await prisma.berita.upsert({
        where: { id: b.id },
        update: {
          judul: b.judul,
          deskripsi: b.deskripsi,
          content: b.content,
          kategoriBeritaId: b.kategoriBeritaId,
          imageId,
          ...(b.tanggal && { createdAt: new Date(b.tanggal) }),
        },
        create: {
          id: b.id,
          judul: b.judul,
          deskripsi: b.deskripsi,
          content: b.content,
          kategoriBeritaId: b.kategoriBeritaId,
          imageId,
          // createdAt = tanggal terbit asli; urutan "terbaru" di halaman publik memakai kolom ini.
          ...(b.tanggal && { createdAt: new Date(b.tanggal) }),
        },
      });

      console.log(`✅ Berita seeded: ${b.judul}`);
    } catch (error: any) {
      console.error(
        `❌ Failed to seed berita "${b.judul}": ${error.message}`,
      );
    }
  }

  console.log("🎉 Berita seed selesai");
}

