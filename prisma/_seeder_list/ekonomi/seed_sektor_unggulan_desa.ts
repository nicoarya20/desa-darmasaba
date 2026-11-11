import prisma from "../../seed-prisma";
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
          // Satuan/periode hanya ditimpa bila ada di JSON, agar isian admin untuk sektor lain tidak hilang.
          ...(k.satuan !== undefined && { satuan: k.satuan }),
          ...(k.periode !== undefined && { periode: k.periode }),
        },
        create: {
          id: k.id,
          name: k.name,
          description: k.description,
          value: k.value,
          satuan: k.satuan ?? null,
          periode: k.periode ?? null,
        },
      });
    }
    console.log("✅ Sektor Unggulan Desa seeded successfully");
}