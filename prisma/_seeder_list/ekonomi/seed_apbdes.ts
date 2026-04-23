import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const apbdesJson = loadJsonData("ekonomi/apbdes/apbdes.json");

export async function seedAPBDes() {
  console.log("Seeding APBDes...");

  for (const item of apbdesJson) {
    let imageId: string | null = null;
    let fileId: string | null = null;

    if (item.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: item.imageName },
        select: { id: true },
      });
      if (image) imageId = image.id;
    }

    await prisma.aPBDes.upsert({
      where: { id: item.id },
      update: {
        tahun: item.tahun,
        name: item.name,
        deskripsi: item.deskripsi,
        jumlah: item.jumlah,
        imageId,
        fileId,
      },
      create: {
        id: item.id,
        tahun: item.tahun,
        name: item.name,
        deskripsi: item.deskripsi,
        jumlah: item.jumlah,
        imageId,
        fileId,
      },
    });
    console.log(`  APBDes: ${item.name}`);
  }

  console.log("APBDes seed selesai");
}
