import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { PESAN_ADMIN_DOKUMEN, PESAN_DOKUMEN_TIDAK_ADA } from "./dokumen.guard";

/**
 * DELETE (admin) hapus satu dokumen beserta berkas PDF-nya. Baris dihapus DULU, baru berkasnya dihapus permanen
 * (urutan terbalik = bug FK Maskot: berkas yang masih dirujuk baris tidak boleh dihapus lebih dulu).
 */
export default async function dokumenDasarHukumDelete(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_DOKUMEN);
  if (denied) return denied;

  const { id } = context.params as { id: string };
  const existing = await prisma.dokumenDasarHukumPPID.findUnique({ where: { id }, select: { id: true, fileId: true } });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: PESAN_DOKUMEN_TIDAK_ADA };
  }

  await prisma.dokumenDasarHukumPPID.delete({ where: { id } });
  await removeStoredFile({ id: existing.fileId }, "DokumenDasarHukumPPID");
  return { success: true, message: "Dokumen dasar hukum berhasil dihapus" };
}
