import safeImageId from "./safeImageId";

export default async function resolveImageIdForSeed(
  existingImageId: string | null | undefined,
  seedImageId: string | null | undefined
) {
  if (existingImageId) return existingImageId;
  
  // ✅ Skip validasi saat seed
  return await safeImageId(seedImageId, true);
}