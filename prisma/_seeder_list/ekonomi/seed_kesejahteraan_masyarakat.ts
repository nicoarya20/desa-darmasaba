import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";

const kesejahteraanJson = loadJsonData(
  "ekonomi/kesejahteraan-masyarakat/kesejahteraan-masyarakat.json",
);

export async function seedKesejahteraanMasyarakat() {
  console.log("🔄 Seeding Kesejahteraan Masyarakat...");

  for (const k of kesejahteraanJson) {
    try {
      await prisma.kesejahteraanMasyarakat.upsert({
        where: { id: k.id },
        update: {
          judul: k.judul,
          deskripsi: k.deskripsi,
          content: k.content,
        },
        create: {
          id: k.id,
          judul: k.judul,
          deskripsi: k.deskripsi,
          content: k.content,
        },
      });

      console.log(`✅ Kesejahteraan Masyarakat seeded: ${k.judul}`);
    } catch (error: any) {
      console.error(
        `❌ Failed to seed kesejahteraan masyarakat "${k.judul}": ${error.message}`,
      );
    }
  }

  console.log("🎉 Kesejahteraan Masyarakat seed selesai");
}
