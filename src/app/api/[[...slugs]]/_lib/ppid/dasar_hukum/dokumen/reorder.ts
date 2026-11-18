import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import { PESAN_ADMIN_DOKUMEN } from "./dokumen.guard";
import { DOKUMEN_AKTIF } from "./find-many";

/** Pesan 400 bila daftar id berisi id yang tidak dikenal atau berulang. */
export const PESAN_URUTAN_TIDAK_VALID = "Daftar urutan memuat dokumen yang tidak dikenal atau berulang";

/** PUT (admin) atur ulang urutan: `ids` berurutan menjadi `urutan` 0..n-1 dalam satu transaksi. */
export default async function dokumenDasarHukumReorder(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_DOKUMEN);
  if (denied) return denied;

  const { ids } = context.body as { ids: string[] };
  const known = await prisma.dokumenDasarHukumPPID.findMany({ where: DOKUMEN_AKTIF, select: { id: true } });
  const knownIds = new Set(known.map((row) => row.id));
  if (new Set(ids).size !== ids.length || ids.some((id) => !knownIds.has(id))) {
    context.set.status = 400;
    return { success: false, message: PESAN_URUTAN_TIDAK_VALID };
  }

  await prisma.$transaction(
    ids.map((id, urutan) => prisma.dokumenDasarHukumPPID.update({ where: { id }, data: { urutan } })),
  );
  return { success: true, message: "Urutan dokumen berhasil disimpan" };
}
