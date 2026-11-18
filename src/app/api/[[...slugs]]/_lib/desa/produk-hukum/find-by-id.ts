import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { PESAN_PRODUK_HUKUM_TIDAK_ADA } from "./produk-hukum.guard";
import { PRODUK_HUKUM_AKTIF, PRODUK_HUKUM_SELECT } from "./find-many";

/** GET publik satu produk hukum aktif menurut id; 404 bila tidak ada. */
export default async function produkHukumFindById(context: Context) {
  const { id } = context.params as { id: string };
  try {
    const data = await prisma.produkHukum.findFirst({ where: { id, ...PRODUK_HUKUM_AKTIF }, select: PRODUK_HUKUM_SELECT });
    if (!data) {
      context.set.status = 404;
      return { success: false, message: PESAN_PRODUK_HUKUM_TIDAK_ADA };
    }
    return { success: true, data };
  } catch (error) {
    console.error(`Gagal mengambil produk hukum ${id}:`, error);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil produk hukum" };
  }
}
