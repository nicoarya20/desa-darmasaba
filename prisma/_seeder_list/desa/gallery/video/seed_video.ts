import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../../load-json";

const galleryVideo = loadJsonData("desa/gallery/video/video.json");

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
        id: v.id,
        name: v.judul,
        deskripsi: v.deskripsi,
        linkVideo: v.linkVideo,
      },
    });
  }

  console.log("gallery video success ...");
}
