import prisma from "@/lib/prisma";
import { safeSeedUnique } from "../../../safeseedUnique";
import kategoriPengumuman from "../../../data/desa/pengumuman/kategori-pengumuman.json";
import pengumuman from "../../../data/desa/pengumuman/pengumuman.json";

export async function seedPengumuman() {
  console.log("🔄 Seeding Kategori Pengumuman...");
  for (const c of kategoriPengumuman) {
    await safeSeedUnique(
      "categoryPengumuman",
      { name: c.name }, // ✅ where clause
      {
        id: c.id,
        name: c.name,
      },
    );
  }

  console.log("kategori pengumuman success ...");

  console.log("🔄 Seeding Pengumuman...");
  for (const p of pengumuman) {
    await prisma.pengumuman.upsert({
      where: {
        id: p.id,
      },
      update: {
        judul: p.judul,
        deskripsi: p.deskripsi,
        content: p.content,
        categoryPengumumanId: p.categoryPengumumanId,
      },
      create: {
        judul: p.judul,
        deskripsi: p.deskripsi,
        content: p.content,
        categoryPengumumanId: p.categoryPengumumanId,
      },
    });
  }

  console.log("pengumuman success ...");
}