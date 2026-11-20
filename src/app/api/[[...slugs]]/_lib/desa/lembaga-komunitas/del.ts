import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { PESAN_ADMIN_LEMBAGA_KOMUNITAS, PESAN_LEMBAGA_KOMUNITAS_TIDAK_ADA } from "./lembaga-komunitas.guard";
import { LEMBAGA_KOMUNITAS_AKTIF } from "./find-many";

/** DELETE (admin) hapus lembaga secara soft (`isActive` false + `deletedAt`); foto tetap tersimpan agar baris bisa dipulihkan lewat DB. */
export default async function lembagaKomunitasDelete(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_LEMBAGA_KOMUNITAS);
  if (denied) return denied;

  const { id } = context.params as { id: string };
  const existing = await prisma.lembagaKomunitas.findFirst({ where: { id, ...LEMBAGA_KOMUNITAS_AKTIF }, select: { id: true } });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: PESAN_LEMBAGA_KOMUNITAS_TIDAK_ADA };
  }

  await prisma.lembagaKomunitas.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } });
  return { success: true, message: "Lembaga atau komunitas berhasil dihapus" };
}
