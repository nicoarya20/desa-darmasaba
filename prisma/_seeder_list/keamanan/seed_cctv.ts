import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const cctvData = loadJsonData("keamanan/cctv/cctv.json");

export async function seedCctv() {
  console.log("🔄 Seeding CCTV Keamanan...");

  for (const c of cctvData) {
    await prisma.cctvKeamanan.upsert({
      where: { id: c.id },
      update: {
        kode: c.kode,
        nama: c.nama,
        lokasi: c.lokasi,
        latitude: c.latitude ?? null,
        longitude: c.longitude ?? null,
        status: c.status,
        lastActive: new Date(c.lastActive),
      },
      create: {
        id: c.id,
        kode: c.kode,
        nama: c.nama,
        lokasi: c.lokasi,
        latitude: c.latitude ?? null,
        longitude: c.longitude ?? null,
        status: c.status,
        lastActive: new Date(c.lastActive),
      },
    });
  }

  console.log(`✅ CCTV Keamanan seeded: ${cctvData.length} data`);
}
