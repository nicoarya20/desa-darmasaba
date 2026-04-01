import prisma from "@/lib/prisma";
import kontakDaruratKeamanan from "../../data/keamanan/kontak-darurat-keamanan/kontak-darurat-keamanan.json";
import kontakItem from "../../data/keamanan/kontak-darurat-keamanan/kontakItem.json";
import kontakDaruratToItem from "../../data/keamanan/kontak-darurat-keamanan/kontakDaruratToItem.json";

export async function seedKontakDaruratKeamanan() {
 console.log("🔄 Seeding Kontak Item...");
  for (const e of kontakItem) {
    await prisma.kontakItem.upsert({
      where: {
        id: e.id,
      },
      update: {
        nama: e.nama,
        icon: e.icon,
        nomorTelepon: e.nomorTelepon,
      },
      create: {
        id: e.id, // ✅ WAJIB
        nama: e.nama,
        icon: e.icon,
        nomorTelepon: e.nomorTelepon,
      },
    });
  }
  console.log("✅ Kontak Item seeded successfully");

  console.log("🔄 Seeding Kontak Darurat Keamanan...");
  for (const d of kontakDaruratKeamanan) {
    await prisma.kontakDaruratKeamanan.upsert({
      where: {
        id: d.id,
      },
      update: {
        nama: d.nama,
        icon: d.icon,
        kategoriId: d.kategoriId,
      },
      create: {
        id: d.id,
        nama: d.nama,
        icon: d.icon,
        kategoriId: d.kategoriId,
      },
    });
  }

  console.log("✅ Kontak Darurat Keamanan seeded successfully");

  console.log("🔄 Seeding Kontak Darurat To Item...");
  for (const f of kontakDaruratToItem) {
    // ✅ Validasi foreign keys
    const kontakDaruratExists = await prisma.kontakDaruratKeamanan.findUnique({
      where: { id: f.kontakDaruratId },
    });

    const kontakItemExists = await prisma.kontakItem.findUnique({
      where: { id: f.kontakItemId },
    });

    if (!kontakDaruratExists) {
      console.warn(
        `⚠️ KontakDarurat ${f.kontakDaruratId} not found, skipping...`,
      );
      continue;
    }

    if (!kontakItemExists) {
      console.warn(`⚠️ KontakItem ${f.kontakItemId} not found, skipping...`);
      continue;
    }

    await prisma.kontakDaruratToItem.upsert({
      where: { id: f.id },
      update: {
        kontakDaruratId: f.kontakDaruratId,
        kontakItemId: f.kontakItemId,
      },
      create: {
        id: f.id,
        kontakDaruratId: f.kontakDaruratId,
        kontakItemId: f.kontakItemId,
      },
    });
  }
  console.log("✅ Kontak Darurat To Item seeded successfully");   
}