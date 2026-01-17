import prisma from "@/lib/prisma";

export default async function safeImageId(
  imageId?: string | null,
  skipValidation = false // ✅ tambah param
) {
  if (!imageId) return null;
  
  if (skipValidation) {
    console.log(`⚠️ Skipping validation for ${imageId} (seed mode)`);
    return imageId; // langsung return tanpa cek DB
  }

  const exists = await prisma.fileStorage.findUnique({
    where: { id: imageId },
  });

  if (!exists) {
    console.warn(`⚠️ imageId ${imageId} not found in FileStorage`);
    return null;
  }

  return imageId;
}