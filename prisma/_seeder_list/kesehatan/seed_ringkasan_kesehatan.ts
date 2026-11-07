import prisma from "../../seed-prisma";

const SINGLETON_ID = "ringkasan_kesehatan_desa_001";

export async function seedRingkasanKesehatan() {
  console.log("🔄 Seeding Ringkasan Kesehatan Desa...");

  await prisma.ringkasanKesehatanDesa.upsert({
    where: { id: SINGLETON_ID },
    update: { targetStuntingPct: 10 },
    create: { id: SINGLETON_ID, targetStuntingPct: 10 },
  });

  console.log("✅ Ringkasan Kesehatan Desa seeded");
}
