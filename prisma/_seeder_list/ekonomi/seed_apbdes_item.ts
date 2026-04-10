import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const itemsJson = loadJsonData("ekonomi/apbdes/apbdes-items.json");
const realisasiJson = loadJsonData("ekonomi/apbdes/realisasi-items.json");

export async function seedAPBDesItem() {
  console.log("Seeding APBDes Items...");

  // Seed items first (sorted by level to ensure parents exist)
  const sortedItems = [...itemsJson].sort((a, b) => a.level - b.level);

  for (const item of sortedItems) {
    await prisma.aPBDesItem.upsert({
      where: { id: item.id },
      update: {
        kode: item.kode,
        uraian: item.uraian,
        anggaran: item.anggaran,
        tipe: item.tipe,
        level: item.level,
        parentId: item.parentId,
        apbdesId: item.apbdesId,
      },
      create: {
        id: item.id,
        kode: item.kode,
        uraian: item.uraian,
        anggaran: item.anggaran,
        tipe: item.tipe,
        level: item.level,
        parentId: item.parentId,
        apbdesId: item.apbdesId,
      },
    });
    console.log(`  APBDes Item: ${item.kode} - ${item.uraian}`);
  }

  console.log("Seeding Realisasi Items...");
  for (const item of realisasiJson) {
    await prisma.realisasiItem.upsert({
      where: { id: item.id },
      update: {
        kode: item.kode,
        apbdesItemId: item.apbdesItemId,
        jumlah: item.jumlah,
        tanggal: new Date(item.tanggal),
        keterangan: item.keterangan,
      },
      create: {
        id: item.id,
        kode: item.kode,
        apbdesItemId: item.apbdesItemId,
        jumlah: item.jumlah,
        tanggal: new Date(item.tanggal),
        keterangan: item.keterangan,
      },
    });
    console.log(`  Realisasi: ${item.kode} - Rp ${item.jumlah.toLocaleString("id-ID")}`);
  }

  console.log("APBDes Item & Realisasi seed selesai");
}
