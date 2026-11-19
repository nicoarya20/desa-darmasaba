import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { PESAN_INDEKS_DESA_TIDAK_ADA } from "./indeks-desa.guard";
import { INDEKS_DESA_AKTIF, INDEKS_DESA_SELECT } from "./find-many";

/** GET publik satu baris Indeks Desa aktif menurut id; 404 bila tidak ada. */
export default async function indeksDesaFindById(context: Context) {
  const { id } = context.params as { id: string };
  try {
    const data = await prisma.indeksDesa.findFirst({ where: { id, ...INDEKS_DESA_AKTIF }, select: INDEKS_DESA_SELECT });
    if (!data) {
      context.set.status = 404;
      return { success: false, message: PESAN_INDEKS_DESA_TIDAK_ADA };
    }
    return { success: true, data };
  } catch (error) {
    console.error(`Gagal mengambil Indeks Desa ${id}:`, error);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil data Indeks Desa" };
  }
}
