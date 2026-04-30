import prisma from "@/lib/prisma";

const SINGLETON_ID = "ringkasan_kesehatan_desa_001";

export async function seedRingkasanKesehatan() {
  console.log("🔄 Seeding Ringkasan Kesehatan Desa...");

  await prisma.ringkasanKesehatanDesa.upsert({
    where: { id: SINGLETON_ID },
    update: {
      ibuHamilAkh: 87,
      balitaTerdaftar: 342,
      alertStunting: 12,
    },
    create: {
      id: SINGLETON_ID,
      ibuHamilAkh: 87,
      balitaTerdaftar: 342,
      alertStunting: 12,
    },
  });

  console.log("✅ Ringkasan Kesehatan Desa seeded");
}
