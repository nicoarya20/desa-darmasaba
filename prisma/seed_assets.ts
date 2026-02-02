/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

import { getAllDownloadUrls } from "./lib/get_images";

export default async function seedAssets() {
  const images = await getAllDownloadUrls();

  for (const img of images) {
    try {
      await prisma.fileStorage.upsert({
        where: {
          id: img.name,
        },
        create: {
          name: img.name,
          category: "image",
          mimeType: "image/webp",
          link: img.downloadUrl,
          path: "images",
          realName: img.name,
          isActive: true,
        },
        update: {},
      });
      console.log(img.name, ": success")
    } catch (err) {
      console.log("gagal seed assets", JSON.stringify(err));
    }
  }

  console.log("🎉 Image seeding completed");
}

// if (import.meta.main) {
//   seedAssets()
//     .then(() => {
//       console.log("seed assets success");
//     })
//     .catch((err) => {
//       console.log("gagal seed assets", JSON.stringify(err));
//     });
// }
