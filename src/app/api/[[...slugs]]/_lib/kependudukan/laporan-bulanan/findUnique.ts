import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { LAPORAN_SELECT, gagal } from "./laporan-bulanan.http";

/** GET /:id (publik): satu laporan aktif; hanya agregat per banjar per bulan, tanpa data pribadi. */
export default async function laporanBulananFindUnique(context: Context) {
  const { id } = context.params as { id: string };
  try {
    const data = await prisma.laporanPendudukBulanan.findFirst({
      where: { id, isActive: true },
      select: LAPORAN_SELECT,
    });
    if (!data) return gagal(context.set, 404, "Laporan bulanan tidak ditemukan");
    return { success: true as const, message: "Berhasil ambil laporan bulanan", data };
  } catch (e) {
    console.error("Error di laporanBulananFindUnique:", e);
    return gagal(context.set, 500, "Gagal mengambil laporan bulanan");
  }
}
