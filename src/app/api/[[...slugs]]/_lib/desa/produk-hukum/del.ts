import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { PESAN_ADMIN_PRODUK_HUKUM, PESAN_PRODUK_HUKUM_TIDAK_ADA } from "./produk-hukum.guard";

/**
 * DELETE (admin) hapus satu produk hukum beserta berkas PDF-nya (bila ada). Baris dihapus DULU, baru berkasnya dihapus
 * permanen (urutan terbalik = bug FK Maskot: berkas yang masih dirujuk baris tidak boleh dihapus lebih dulu).
 */
export default async function produkHukumDelete(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_PRODUK_HUKUM);
  if (denied) return denied;

  const { id } = context.params as { id: string };
  const existing = await prisma.produkHukum.findUnique({ where: { id }, select: { id: true, fileId: true } });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: PESAN_PRODUK_HUKUM_TIDAK_ADA };
  }

  await prisma.produkHukum.delete({ where: { id } });
  if (existing.fileId) await removeStoredFile({ id: existing.fileId }, "ProdukHukum");
  return { success: true, message: "Produk hukum berhasil dihapus" };
}
