import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { LAPORAN_SELECT, PESAN_DUPLIKAT, adaLaporanAktif, gagal, guardMutasi } from "./laporan-bulanan.http";
import { parseLaporanInput } from "./laporan-bulanan.rules";

/** POST /create (admin): tambah laporan bulanan satu banjar; duplikat aktif banjar+tahun+bulan ditolak 409. */
export default async function laporanBulananCreate(context: Context) {
  const ditolak = await guardMutasi(context.set);
  if (ditolak) return ditolak;

  const parsed = parseLaporanInput((context.body ?? {}) as Record<string, unknown>);
  if (!parsed.ok) return gagal(context.set, 400, parsed.message);

  try {
    if (await adaLaporanAktif(parsed.data)) return gagal(context.set, 409, PESAN_DUPLIKAT);

    const data = await prisma.laporanPendudukBulanan.create({ data: parsed.data, select: LAPORAN_SELECT });
    return { success: true as const, message: "Laporan bulanan berhasil ditambahkan", data };
  } catch (e) {
    console.error("Error di laporanBulananCreate:", e);
    return gagal(context.set, 500, "Gagal menambahkan laporan bulanan");
  }
}
