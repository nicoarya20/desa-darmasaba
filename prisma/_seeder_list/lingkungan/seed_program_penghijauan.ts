import prisma from "@/lib/prisma";
import programPenghijauan from "../../data/lingkungan/program-penghijauan/program-penghijauan.json";

export async function seedProgramPenghijauan() {
  console.log("🔄 Seeding Program Penghijauan...");
  for (const p of programPenghijauan) {
    await prisma.programPenghijauan.upsert({
      where: {
        id: p.id,
      },
      update: {
        name: p.name,
        judul: p.judul,
        deskripsi: p.deskripsi,
        icon: p.icon,
      },
      create: {
        id: p.id,
        name: p.name,
        judul: p.judul,
        deskripsi: p.deskripsi,
        icon: p.icon,
      },
    });
  }
  console.log("✅ Program Penghijauan seeded successfully");
}