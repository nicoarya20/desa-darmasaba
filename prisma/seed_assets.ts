/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

import { getAllDownloadUrls } from "./lib/get_images";

export default async function seedAssets() {
  const images = await getAllDownloadUrls();

  for (const img of images) {
    try {
      // Check if the image already exists by name
      const existingImage = await prisma.fileStorage.findUnique({
        where: { name: img.name },
      });

      if (!existingImage) {
        // Only create if it doesn't exist
        await prisma.fileStorage.create({
          data: {
            name: img.name,
            category: "image",
            mimeType: "image/webp",
            link: img.downloadUrl,
            path: "images",
            realName: img.name,
            isActive: true,
          },
        });
        console.log(`✅ Created new image: ${img.name}`);
      } else {
        console.log(`ℹ️ Image already exists, skipping: ${img.name}`);
      }
    } catch (err) {
      console.log(`❌ Failed to seed asset ${img.name}:`, JSON.stringify(err));
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
