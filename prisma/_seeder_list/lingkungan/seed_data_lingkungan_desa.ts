import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const dataLingkunganDesa = loadJsonData("lingkungan/data-lingkungan-desa/data-lingkungan-desa.json");

export async function seedDataLingkunganDesa() {
  console.log("🔄 Seeding Data Lingkungan Desa...");
  for (const p of dataLingkunganDesa) {
    await prisma.dataLingkunganDesa.upsert({
      where: {
        id: p.id,
      },
      update: {
        name: p.name,
        jumlah: p.jumlah,
        deskripsi: p.deskripsi,
        icon: p.icon,
      },
      create: {
        id: p.id,
        name: p.name,
        jumlah: p.jumlah,
        deskripsi: p.deskripsi,
        icon: p.icon,
      },
    });
  }
  console.log("✅ Data Lingkungan Desa seeded successfully");
}
