import prisma from "@/lib/prisma";
import programInovasi from "../../../data/landing-page/profile/programInovasi.json";

export async function seedProgramInovasi() {
    console.log("🔄 Seeding Program Inovasi...");
    
      for (const b of programInovasi) {
        let imageId: string | null = null;
    
        if (b.imageName) {
          const image = await prisma.fileStorage.findUnique({
            where: { name: b.imageName },
            select: { id: true },
          });
    
          if (!image) {
            console.warn(
              `⚠️ Image not found for program inovasi "${b.name}": ${b.imageName}`,
            );
          } else {
            imageId = image.id;
          }
        }
    
        await prisma.programInovasi.upsert({
          where: { id: b.id },
          update: {
            name: b.name,
            description: b.description,
            link: b.link,
            imageId,
          },
          create: {
            id: b.id,
            name: b.name,
            description: b.description,
            link: b.link,
            imageId,
          },
        });
    
        console.log(`✅ Program Inovasi seeded: ${b.name}`);
      }
}