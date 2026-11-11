import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const ajukanIde = loadJsonData("inovasi/ajukan-ide/ajukan-ide.json");

export async function seedAjukan() {
  console.log("🔄 Seeding Ajukan Ide Inovatif...");
  for (const d of ajukanIde) {
    await prisma.ajukanIdeInovatif.upsert({
      where: {
        id: d.id,
      },
      update: {
        name: d.name,
        alamat: d.alamat,
        namaIde: d.namaIde,
        deskripsi: d.deskripsi,
        masalah: d.masalah,
        benefit: d.benefit,
      },
      create: {
        id: d.id,
        name: d.name,
        alamat: d.alamat,
        namaIde: d.namaIde,
        deskripsi: d.deskripsi,
        masalah: d.masalah,
        benefit: d.benefit,
      },
    });
  }
  console.log("✅ Ajukan Ide Inovatif seeded successfully");
}
