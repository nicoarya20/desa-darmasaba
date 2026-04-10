import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const layananJson = loadJsonData("core/layanan.json");
const potensiJson = loadJsonData("core/potensi.json");
const landingPageLayananJson = loadJsonData("core/landingpage-layanan.json");

export async function seedLayananCore() {
  console.log("🔄 Seeding Layanan...");

  for (const item of layananJson) {
    await prisma.layanan.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
      },
      create: {
        id: item.id,
        name: item.name,
      },
    });

    console.log(`✅ Layanan seeded: ${item.name}`);
  }

  console.log("🎉 Layanan seed selesai");
}

export async function seedPotensiCore() {
  console.log("🔄 Seeding Potensi...");

  for (const item of potensiJson) {
    await prisma.potensi.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
      },
      create: {
        id: item.id,
        name: item.name,
      },
    });

    console.log(`✅ Potensi seeded: ${item.name}`);
  }

  console.log("🎉 Potensi seed selesai");
}

export async function seedLandingPageLayanan() {
  console.log("🔄 Seeding LandingPage_Layanan...");

  for (const item of landingPageLayananJson) {
    await prisma.landingPage_Layanan.upsert({
      where: { id: item.id },
      update: {
        deksripsi: item.deksripsi,
      },
      create: {
        id: item.id,
        deksripsi: item.deksripsi,
      },
    });

    console.log(`✅ LandingPage_Layanan seeded: ${item.id}`);
  }

  console.log("🎉 LandingPage_Layanan seed selesai");
}
