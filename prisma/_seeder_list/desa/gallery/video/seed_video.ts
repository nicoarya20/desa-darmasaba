import prisma from "@/lib/prisma";
import galleryVideo from "../../../../data/desa/gallery/video/video.json";

export async function seedVideo() {
  console.log("🔄 Seeding Gallery Video...");
  for (const v of galleryVideo) {
    await prisma.galleryVideo.upsert({
      where: {
        id: v.id,
      },
      update: {
        name: v.judul,
        deskripsi: v.deskripsi,
        linkVideo: v.linkVideo,
      },
      create: {
        name: v.judul,
        deskripsi: v.deskripsi,
        linkVideo: v.linkVideo,
      },
    });
  }

  console.log("gallery video success ...");
}
