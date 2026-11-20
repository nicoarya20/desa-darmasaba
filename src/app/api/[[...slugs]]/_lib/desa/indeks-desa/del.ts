import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { PESAN_ADMIN_INDEKS_DESA, PESAN_INDEKS_DESA_TIDAK_ADA } from "./indeks-desa.guard";

/** DELETE (admin) hapus permanen data IDM satu tahun (tidak ada berkas terkait). */
export default async function indeksDesaDelete(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_INDEKS_DESA);
  if (denied) return denied;

  const { id } = context.params as { id: string };
  const existing = await prisma.indeksDesa.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    context.set.status = 404;
    return { success: false, message: PESAN_INDEKS_DESA_TIDAK_ADA };
  }

  await prisma.indeksDesa.delete({ where: { id } });
  return { success: true, message: "Data Indeks Desa berhasil dihapus" };
}
