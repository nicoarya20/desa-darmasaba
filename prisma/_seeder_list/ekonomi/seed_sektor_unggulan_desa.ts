import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const sektorUnggulanDesa = loadJsonData("ekonomi/sektor-unggulan/sektor-unggulan.json");

export async function seedSektorUnggulanDesa() {
   console.log("🔄 Seeding Sektor Unggulan Desa...");
    for (const k of sektorUnggulanDesa) {
      await prisma.sektorUnggulanDesa.upsert({
        where: {
          id: k.id,
        },
        update: {
          name: k.name,
          description: k.description,
          value: k.value,
        },
        create: {
          id: k.id,
          name: k.name,
          description: k.description,
          value: k.value,
        },
      });
    }
    console.log("✅ Sektor Unggulan Desa seeded successfully");
}