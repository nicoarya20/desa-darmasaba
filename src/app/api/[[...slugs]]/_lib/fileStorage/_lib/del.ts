import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { isKnownSampahMenuId } from "@/lib/sampah/sampah-kelompok";
import { moveFileToSampah } from "./removeStoredFile";

/**
 * DELETE (admin): pindahkan berkas ke Sampah (bukan hapus permanen). Query opsional `from` = ID menu sidebar
 * asal (mis. "ekonomi.bumdes"); kosong/tidak dikenal → kelompok "Lainnya". Berkas yang masih dipakai data
 * lain ditolak 409 dan tetap aktif.
 */
const fileStorageDelete = async (context: Context) => {
  const id = (context.params as { id: string })?.id;

  if (!id) return { status: 400, body: "ID file tidak ditemukan" };

  const file = await prisma.fileStorage.findUnique({ where: { id }, select: { id: true, deletedAt: true } });

  if (!file || file.deletedAt) return { status: 404, body: "File tidak ditemukan di database" };

  const from = (context.query as { from?: string } | undefined)?.from;
  const result = await moveFileToSampah(id, from && isKnownSampahMenuId(from) ? from : null);

  if (result === "referenced") {
    context.set.status = 409;
    return { success: false, message: "File masih dipakai data lain sehingga tidak dipindahkan ke Sampah" };
  }
  if (result === "missing") return { status: 404, body: "File tidak ditemukan di database" };

  return { message: "File dipindahkan ke Sampah", deletedId: id };
};

export default fileStorageDelete;
