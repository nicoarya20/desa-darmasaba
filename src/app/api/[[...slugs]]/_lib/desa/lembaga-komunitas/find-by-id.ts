import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { PESAN_LEMBAGA_KOMUNITAS_TIDAK_ADA } from "./lembaga-komunitas.guard";
import { LEMBAGA_KOMUNITAS_AKTIF, LEMBAGA_KOMUNITAS_SELECT } from "./find-many";

/** GET publik satu lembaga aktif menurut id; 404 bila tidak ada. */
export default async function lembagaKomunitasFindById(context: Context) {
  const { id } = context.params as { id: string };
  try {
    const data = await prisma.lembagaKomunitas.findFirst({
      where: { id, ...LEMBAGA_KOMUNITAS_AKTIF },
      select: LEMBAGA_KOMUNITAS_SELECT,
    });
    if (!data) {
      context.set.status = 404;
      return { success: false, message: PESAN_LEMBAGA_KOMUNITAS_TIDAK_ADA };
    }
    return { success: true, data };
  } catch (error) {
    console.error(`Gagal mengambil Lembaga & Komunitas ${id}:`, error);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil data Lembaga & Komunitas" };
  }
}
