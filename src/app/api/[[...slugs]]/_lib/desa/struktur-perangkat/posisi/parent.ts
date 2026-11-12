import prisma from "@/lib/prisma";
import { validateParent, type ParentValidation } from "@/lib/struktur-organisasi";

/**
 * Validasi atasan jabatan terhadap seluruh bagan. Memuat hanya `id` + `parentId` semua
 * jabatan (tabel kecil, ~20 baris) agar deteksi siklus cukup satu query.
 */
export async function checkPosisiParent(
  id: string | undefined,
  parentId: string | null | undefined
): Promise<ParentValidation> {
  if (!parentId) return { ok: true };
  const nodes = await prisma.posisiPerangkatDesa.findMany({ select: { id: true, parentId: true } });
  return validateParent({ id, parentId, nodes });
}
