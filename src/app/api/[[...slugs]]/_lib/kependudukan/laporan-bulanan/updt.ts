import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { LAPORAN_SELECT, PESAN_DUPLIKAT, adaLaporanAktif, gagal, guardMutasi } from "./laporan-bulanan.http";
import { parseLaporanInput } from "./laporan-bulanan.rules";

/** PUT /:id (admin): ubah laporan aktif; periode baru yang bentrok dengan laporan aktif lain ditolak 409. */
export default async function laporanBulananUpdate(context: Context) {
  const ditolak = await guardMutasi(context.set);
  if (ditolak) return ditolak;

  const { id } = context.params as { id: string };
  const parsed = parseLaporanInput((context.body ?? {}) as Record<string, unknown>);
  if (!parsed.ok) return gagal(context.set, 400, parsed.message);

  try {
    const ada = await prisma.laporanPendudukBulanan.findFirst({ where: { id, isActive: true }, select: { id: true } });
    if (!ada) return gagal(context.set, 404, "Laporan bulanan tidak ditemukan");
    if (await adaLaporanAktif(parsed.data, id)) return gagal(context.set, 409, PESAN_DUPLIKAT);

    const data = await prisma.laporanPendudukBulanan.update({ where: { id }, data: parsed.data, select: LAPORAN_SELECT });
    return { success: true as const, message: "Laporan bulanan berhasil diubah", data };
  } catch (e) {
    console.error("Error di laporanBulananUpdate:", e);
    return gagal(context.set, 500, "Gagal mengubah laporan bulanan");
  }
}
