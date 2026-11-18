import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { gagal, guardMutasi } from "./laporan-bulanan.http";

/** DELETE /del/:id (admin): soft delete (isActive=false + deletedAt); baris tetap ada di DB. */
export default async function laporanBulananDelete(context: Context) {
  const ditolak = await guardMutasi(context.set);
  if (ditolak) return ditolak;

  const { id } = context.params as { id: string };
  try {
    const { count } = await prisma.laporanPendudukBulanan.updateMany({
      where: { id, isActive: true },
      data: { isActive: false, deletedAt: new Date() },
    });
    if (count === 0) return gagal(context.set, 404, "Laporan bulanan tidak ditemukan");
    return { success: true as const, message: "Laporan bulanan berhasil dihapus" };
  } catch (e) {
    console.error("Error di laporanBulananDelete:", e);
    return gagal(context.set, 500, "Gagal menghapus laporan bulanan");
  }
}
