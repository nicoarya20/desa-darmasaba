import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const eventBudayaJson = loadJsonData("desa/event-budaya/event-budaya.json");

export async function seedEventBudaya() {
  console.log("🔄 Seeding Event Budaya...");

  for (const item of eventBudayaJson) {
    await prisma.eventBudaya.upsert({
      where: { id: item.id },
      update: {
        nama: item.nama,
        tanggal: new Date(item.tanggal),
        lokasi: item.lokasi,
        deskripsi: item.deskripsi,
      },
      create: {
        id: item.id,
        nama: item.nama,
        tanggal: new Date(item.tanggal),
        lokasi: item.lokasi,
        deskripsi: item.deskripsi,
      },
    });
    console.log(`  ✅ Event: ${item.nama}`);
  }

  console.log("🎉 Event Budaya seed selesai");
}
