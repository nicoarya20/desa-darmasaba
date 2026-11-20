import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { parseLembagaKomunitasInput } from "@/lib/lembaga-komunitas";
import { PESAN_ADMIN_LEMBAGA_KOMUNITAS, PESAN_LEMBAGA_KOMUNITAS_TIDAK_ADA } from "./lembaga-komunitas.guard";
import { rejectInvalidFoto } from "./lembaga-komunitas.foto";
import { LEMBAGA_KOMUNITAS_AKTIF, LEMBAGA_KOMUNITAS_SELECT } from "./find-many";

/**
 * PUT (admin) ubah lembaga. `fotoId` tidak dikirim = foto tetap; `null` = lepas foto; id baru = ganti foto.
 * Foto lama dihapus permanen SESUDAH baris diperbarui (aman dari FK) dan hanya bila tidak dirujuk data lain.
 */
export default async function lembagaKomunitasUpdate(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_LEMBAGA_KOMUNITAS);
  if (denied) return denied;

  const { id } = context.params as { id: string };
  const parsed = parseLembagaKomunitasInput(context.body as Record<string, unknown>);
  if (!parsed.ok) {
    context.set.status = 400;
    return { success: false, message: parsed.message };
  }
  const { fields, fotoId } = parsed.data;

  const existing = await prisma.lembagaKomunitas.findFirst({
    where: { id, ...LEMBAGA_KOMUNITAS_AKTIF },
    select: { id: true, fotoId: true },
  });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: PESAN_LEMBAGA_KOMUNITAS_TIDAK_ADA };
  }
  const invalidFoto = await rejectInvalidFoto(context.set, fotoId);
  if (invalidFoto) return invalidFoto;

  let data;
  try {
    data = await prisma.lembagaKomunitas.update({
      where: { id },
      data: fotoId === undefined ? fields : { ...fields, fotoId },
      select: LEMBAGA_KOMUNITAS_SELECT,
    });
  } catch (error) {
    throw new Error(`Gagal menyimpan lembaga atau komunitas ${id}: ${(error as Error).message}`, { cause: error });
  }
  if (fotoId !== undefined && existing.fotoId && existing.fotoId !== fotoId) {
    await removeStoredFile({ id: existing.fotoId }, "LembagaKomunitas");
  }
  return { success: true, message: "Lembaga atau komunitas berhasil diubah", data };
}
