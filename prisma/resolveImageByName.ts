import prisma from "@/lib/prisma";

// Ganti nama fungsi dan logikanya
export default async function resolveImageById(
  imageId?: string | null
): Promise<string | null> {
  if (!imageId) return null;

  const image = await prisma.fileStorage.findFirst({
    where: {
      id: imageId,  // ← cari berdasarkan ID
      category: "image",
      isActive: true,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!image) {
    console.warn(`⚠️ Image with ID ${imageId} not found`);
    return null;
  }

  return image.id;
}