// import prisma from "@/lib/prisma";

// // Ganti nama fungsi dan logikanya
// export default async function resolveImageById(
//   imageId?: string | null
// ): Promise<string | null> {
//   if (!imageId) return null;

//   const image = await prisma.fileStorage.findFirst({
//     where: {
//       id: imageId,  // ← cari berdasarkan ID
//       category: "image",
//       isActive: true,
//       deletedAt: null,
//     },
//     select: { id: true },
//   });

//   if (!image) {
//     console.warn(`⚠️ Image with ID ${imageId} not found`);
//     return null;
//   }

//   return image.id;
// }

import prisma from "@/lib/prisma";

/**
 * Resolve image ID by checking multiple possible names
 * @param imageId - The ID from JSON (could be filename or actual ID)
 * @returns The actual database ID or null
 */
export default async function resolveImageById(imageId: string | null): Promise<string | null> {
  if (!imageId) return null;

  try {
    // 1. Coba cari berdasarkan ID langsung
    const byId = await prisma.fileStorage.findUnique({
      where: { id: imageId },
      select: { id: true },
    });
    if (byId) return byId.id;

    // 2. Coba cari berdasarkan name (exact match)
    const byName = await prisma.fileStorage.findUnique({
      where: { name: imageId },
      select: { id: true },
    });
    if (byName) return byName.id;

    // 3. Coba cari berdasarkan realName
    const byRealName = await prisma.fileStorage.findFirst({
      where: { realName: imageId },
      select: { id: true },
    });
    if (byRealName) return byRealName.id;

    // 4. Coba dengan menambahkan ekstensi .webp
    const withWebp = `${imageId.replace(/\.(jpg|jpeg|png)$/i, '')}.webp`;
    const byWebp = await prisma.fileStorage.findFirst({
      where: {
        OR: [
          { name: withWebp },
          { name: { contains: imageId.split('.')[0] } },
        ],
      },
      select: { id: true },
    });
    if (byWebp) return byWebp.id;

    console.warn(`⚠️ Image not found for: ${imageId}`);
    return null;
  } catch (error) {
    console.error(`❌ Error resolving image ${imageId}:`, error);
    return null;
  }
}