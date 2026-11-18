import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { parseProdukHukumInput } from "@/lib/produk-hukum";
import { rejectUnknownPpidFile } from "../../ppid/ppid-file";
import { PESAN_ADMIN_PRODUK_HUKUM, PESAN_PRODUK_HUKUM_TIDAK_ADA } from "./produk-hukum.guard";
import { PRODUK_HUKUM_AKTIF, PRODUK_HUKUM_SELECT } from "./find-many";

/**
 * PUT (admin) ubah produk hukum. `fileId` tidak dikirim = berkas tetap; `null` = lepas berkas; id baru = ganti berkas.
 * Berkas lama dihapus permanen SESUDAH baris diperbarui (aman dari FK) dan hanya bila tidak dirujuk data lain.
 */
export default async function produkHukumUpdate(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_PRODUK_HUKUM);
  if (denied) return denied;

  const { id } = context.params as { id: string };
  const parsed = parseProdukHukumInput(context.body as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }
  const { fileId, ...fields } = parsed.data;

  const existing = await prisma.produkHukum.findFirst({ where: { id, ...PRODUK_HUKUM_AKTIF }, select: { id: true, fileId: true } });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: PESAN_PRODUK_HUKUM_TIDAK_ADA };
  }
  const unknownFile = await rejectUnknownPpidFile(context.set, fileId);
  if (unknownFile) return unknownFile;

  const data = await prisma.produkHukum.update({
    where: { id },
    data: fileId === undefined ? fields : { ...fields, fileId },
    select: PRODUK_HUKUM_SELECT,
  });
  if (fileId !== undefined && existing.fileId && existing.fileId !== fileId) {
    await removeStoredFile({ id: existing.fileId }, "ProdukHukum");
  }
  return { success: true, message: "Produk hukum berhasil diubah", data };
}
