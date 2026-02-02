import prisma from "@/lib/prisma";
import apbdes from "../../data/ekonomi/pendapatan-asli-desa/apbDesa.json";
import pendapatan from "../../data/ekonomi/pendapatan-asli-desa/pendapatanDesa.json";
import belanja from "../../data/ekonomi/pendapatan-asli-desa/belanjaDesa.json";
import pembiayaan from "../../data/ekonomi/pendapatan-asli-desa/pembiayaanDesa.json";

export async function seedPendapatanAsli() {
  console.log("🔄 Seeding Pendapatan Asli...");
  for (const d of apbdes) {
    await prisma.apbDesa.upsert({
      where: {
        id: d.id,
      },
      update: {
        tahun: d.tahun,
      },
      create: {
        id: d.id,
        tahun: d.tahun,
      },
    });
  }
  console.log("✅ Pendapatan Asli seeded successfully");

  console.log("🔄 Seeding Pendapatan...");
  for (const d of pendapatan) {
    await prisma.pendapatan.upsert({
      where: {
        id: d.id,
      },
      update: {
        name: d.name,
        value: d.nilai
      },
      create: {
        id: d.id,
        name: d.name,
        value: d.nilai
      },
    });
  }
  console.log("✅ Pendapatan seeded successfully");

  console.log("🔄 Seeding Belanja...");
  for (const d of belanja) {
    await prisma.belanja.upsert({
      where: {
        id: d.id,
      },
      update: {
        name: d.name,
        value: d.nilai
      },
      create: {
        id: d.id,
        name: d.name,
        value: d.nilai
      },
    });
  }
  console.log("✅ Belanja seeded successfully");

  console.log("🔄 Seeding Pembiayaan...");
  for (const d of pembiayaan) {
    await prisma.pembiayaan.upsert({
      where: {
        id: d.id,
      },
      update: {
        name: d.name,
        value: d.nilai
      },
      create: {
        id: d.id,
        name: d.name,
        value: d.nilai
      },
    });
  }
  console.log("✅ Pembiayaan seeded successfully");
}
