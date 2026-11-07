import { KATEGORI_EVENT_DEFAULT } from "@/lib/agenda-desa";
import prisma from "../../../seed-prisma";
import { loadJsonData } from "../../../load-json";

// Data event-budaya.json:
// - event-budaya-1..34: agenda budaya 2025-2026 (kategori BUDAYA).
// - event-budaya-35..38: dari riset publik 5 Nov 2026; verifikasi dengan desa
//   (lokasi 35-37 sengaja generik "Desa Darmasaba" karena venue belum diketahui).
const eventBudayaJson = loadJsonData("desa/event-budaya/event-budaya.json");

export async function seedEventBudaya() {
  console.log("🔄 Seeding Event Budaya...");

  for (const item of eventBudayaJson) {
    const fields = {
      nama: item.nama,
      tanggal: new Date(item.tanggal),
      tanggalSelesai: item.tanggalSelesai ? new Date(item.tanggalSelesai) : null,
      kategori: item.kategori ?? KATEGORI_EVENT_DEFAULT,
      lokasi: item.lokasi,
      deskripsi: item.deskripsi,
    };
    await prisma.eventBudaya.upsert({
      where: { id: item.id },
      update: fields,
      create: { id: item.id, ...fields },
    });
    console.log(`  ✅ Event: ${item.nama}`);
  }

  console.log("🎉 Event Budaya seed selesai");
}
