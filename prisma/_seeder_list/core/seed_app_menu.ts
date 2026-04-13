import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const appMenuJson = loadJsonData("core/app-menu.json");
const appMenuChildJson = loadJsonData("core/app-menu-child.json");

export async function seedAppMenu() {
  console.log("🔄 Seeding AppMenu...");

  for (const item of appMenuJson) {
    await prisma.appMenu.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        link: item.link,
        isActive: item.isActive,
      },
      create: {
        id: item.id,
        name: item.name,
        link: item.link,
        isActive: item.isActive,
      },
    });

    console.log(`✅ AppMenu seeded: ${item.name}`);
  }

  console.log("🎉 AppMenu seed selesai");
}

export async function seedAppMenuChild() {
  console.log("🔄 Seeding AppMenuChild...");

  for (const item of appMenuChildJson) {
    await prisma.appMenuChild.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        link: item.link,
        isActive: item.isActive,
        appMenuId: item.appMenuId,
      },
      create: {
        id: item.id,
        name: item.name,
        link: item.link,
        isActive: item.isActive,
        appMenuId: item.appMenuId,
      },
    });

    console.log(`✅ AppMenuChild seeded: ${item.name}`);
  }

  console.log("🎉 AppMenuChild seed selesai");
}
