import prisma from "../../../seed-prisma";
import { loadJsonData } from "../../../load-json";
import { safeSeedUnique } from "../../../safeseedUnique";

const kategoriPengumuman = loadJsonData("desa/pengumuman/kategori-pengumuman.json");
const pengumuman = loadJsonData("desa/pengumuman/pengumuman.json");

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
        // id wajib di-set agar cocok dengan `where` di run berikutnya —
        // tanpa ini Prisma bikin cuid baru & upsert tak pernah match,
        // sehingga data ter-create ulang / numpuk tiap seed.
        id: p.id,
        judul: p.judul,
        deskripsi: p.deskripsi,
        content: p.content,
        categoryPengumumanId: p.categoryPengumumanId,
      },
    });
  }

  console.log("pengumuman success ...");
}