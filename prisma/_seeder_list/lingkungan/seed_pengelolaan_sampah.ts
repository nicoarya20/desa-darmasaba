import prisma from "@/lib/prisma";
import pengelolaanSampah from "../../data/lingkungan/pengelolaan-sampah/pengelolaan-sampah.json";
import keteranganBankSampah from "../../data/lingkungan/pengelolaan-sampah/keterangan-bank-sampah.json";

export async function seedPengelolaanSampah() {
  console.log("🔄 Seeding Pengelolaan Sampah...");
  for (const p of pengelolaanSampah) {
    await prisma.pengelolaanSampah.upsert({
      where: {
        id: p.id,
      },
      update: {
        name: p.name,
        icon: p.icon,
      },
      create: {
        id: p.id,
        name: p.name,
        icon: p.icon,
      },
    });
  }
  console.log("✅ Pengelolaan Sampah seeded successfully");

  console.log("🔄 Seeding Keterangan Bank Sampah...");
  for (const p of keteranganBankSampah) {
    await prisma.keteranganBankSampahTerdekat.upsert({
      where: {
        id: p.id,
      },
      update: {
        name: p.name,
        alamat: p.alamat,
        namaTempatMaps: p.namaTempatMaps,
        linkPetunjukArah: p.linkPetunjukArah,
        lat: p.lat,
        lng: p.lng,
      },
      create: {
        id: p.id,
        name: p.name,
        alamat: p.alamat,
        namaTempatMaps: p.namaTempatMaps,
        linkPetunjukArah: p.linkPetunjukArah,
        lat: p.lat,
        lng: p.lng,
      },
    });
  }
  console.log("✅ Keterangan Bank Sampah seeded successfully");
}
