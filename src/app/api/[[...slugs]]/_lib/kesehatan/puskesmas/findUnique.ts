import prisma from "@/lib/prisma";
import { Context } from "elysia";
import { fail } from "../../_struktur-organisasi/http";
import { PUSTU_DETAIL_SELECT, keDetail } from "./pustu.data";

/** GET (publik): detail PUSTU beserta jam, kontak, layanan, tarif, bagan, pengurus, dan galeri. */
export default async function findUniquePuskesmas(context: Context) {
  const id = (context.params as { id?: string })?.id;
  if (!id) return fail(context, 400, "ID tidak boleh kosong");

  try {
    const data = await prisma.puskesmas.findUnique({ where: { id }, select: PUSTU_DETAIL_SELECT });
    if (!data) return fail(context, 404, "Data tidak ditemukan");
    return { success: true, message: "Berhasil mengambil detail PUSTU", data: keDetail(data) };
  } catch (error) {
    console.error(`[pustu] Gagal mengambil detail ${id}:`, error);
    return fail(context, 500, "Gagal mengambil detail PUSTU");
  }
}
