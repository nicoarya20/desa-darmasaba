import prisma from "@/lib/prisma";

const SINGLETON_ID = "beasiswa_config_desa_001";

export async function seedBeasiswaConfig() {
  console.log("🔄 Seeding Beasiswa Config...");

  await prisma.beasiswaConfig.upsert({
    where: { id: SINGLETON_ID },
    update: {
      tahunAjaran: "2025/2026",
      danaTersalurkan: BigInt(1200000000),
    },
    create: {
      id: SINGLETON_ID,
      tahunAjaran: "2025/2026",
      danaTersalurkan: BigInt(1200000000),
    },
  });

  console.log("✅ Beasiswa Config seeded");
}
