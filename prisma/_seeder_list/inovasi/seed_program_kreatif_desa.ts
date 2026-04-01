import prisma from "@/lib/prisma";
import programKreatif from "../../data/inovasi/program-kreatif-desa/program-kreatif-desa.json";

export async function seedProgramKreatifDesa() {
  console.log("🔄 Seeding Program Kreatif...");
  for (const p of programKreatif) {
    await prisma.programKreatif.upsert({
      where: {
        id: p.id,
      },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
        icon: p.icon,
        slug: p.slug,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
        icon: p.icon,
        slug: p.slug,
      },
    });
  }
  console.log("✅ Program Kreatif seeded successfully");
}