import prisma from "@/lib/prisma";
import type { Context } from "elysia";
import { guardAdmin } from "../../landing_page/desa-anti-korupsi/admin-guard";

export const PESAN_BUKAN_ADMIN = "Hanya admin yang boleh mengubah laporan penduduk bulanan";
export const PESAN_DUPLIKAT = "Laporan untuk banjar, tahun, dan bulan ini sudah ada; ubah laporan yang ada atau pilih periode lain";

/** Kolom yang dikembalikan API: agregat per banjar per bulan, tanpa data pribadi. */
export const LAPORAN_SELECT = {
  id: true,
  banjar: true,
  tahun: true,
  bulan: true,
  lakiLaki: true,
  perempuan: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Set status HTTP dan bentuk galat seragam `{ success: false, message }`. */
export function gagal(set: Context["set"], status: number, message: string) {
  set.status = status;
  return { success: false as const, message };
}

/** Guard mutasi: sesi wajib dan role admin 0-4; galat 401/403 atau null bila lolos. */
export const guardMutasi = (set: Context["set"]) => guardAdmin(set, PESAN_BUKAN_ADMIN);

/**
 * True bila sudah ada laporan AKTIF untuk banjar+tahun+bulan (banjar tak peka huruf besar/kecil).
 * `kecualiId` mengecualikan baris yang sedang diubah. Dicek di aplikasi, bukan unique index, karena soft delete.
 */
export async function adaLaporanAktif(
  f: { banjar: string; tahun: number; bulan: number },
  kecualiId?: string,
): Promise<boolean> {
  const row = await prisma.laporanPendudukBulanan.findFirst({
    where: {
      banjar: { equals: f.banjar, mode: "insensitive" },
      tahun: f.tahun,
      bulan: f.bulan,
      isActive: true,
      ...(kecualiId ? { NOT: { id: kecualiId } } : {}),
    },
    select: { id: true },
  });
  return row !== null;
}
