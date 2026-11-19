import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/admin-guard";
import {
  PESAN_ADMIN_PRODUK_HUKUM,
  PESAN_URUTAN_PRODUK_HUKUM_TIDAK_VALID,
} from "./produk-hukum.guard";
import { PRODUK_HUKUM_AKTIF } from "./find-many";

/**
 * PUT (admin) atur ulang `urutan` (pemutus seri untuk tahun yang sama): `ids` berurutan menjadi `urutan` 0..n-1 dalam
 * satu transaksi. Hanya id aktif yang dikenal dan tidak berulang; id yang tidak disebut tidak diubah.
 */
export default async function produkHukumReorder(context: Context) {
  const denied = await guardAdmin(context.set, PESAN_ADMIN_PRODUK_HUKUM);
  if (denied) return denied;

  const { ids } = context.body as { ids: string[] };
  const known = await prisma.produkHukum.findMany({ where: PRODUK_HUKUM_AKTIF, select: { id: true } });
  const knownIds = new Set(known.map((row) => row.id));
  if (new Set(ids).size !== ids.length || ids.some((id) => !knownIds.has(id))) {
    context.set.status = 400;
    return { success: false, message: PESAN_URUTAN_PRODUK_HUKUM_TIDAK_VALID };
  }

  await prisma.$transaction(ids.map((id, urutan) => prisma.produkHukum.update({ where: { id }, data: { urutan } })));
  return { success: true, message: "Urutan produk hukum berhasil disimpan" };
}
