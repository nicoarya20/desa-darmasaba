import { Context } from "elysia";
import prisma from "@/lib/prisma";
import type { PengaduanRekap } from "@/lib/pengaduan-rekap";
import { PENGADUAN_STATUS, resolvePengaduanStatus, type PengaduanStatus } from "@/lib/pengaduan-status";

/** Jumlah maksimum tanggapan terbaru di rekap publik. */
export const REKAP_TANGGAPAN_LIMIT = 20;

type StatusGroup = { status: string | null; _count: { _all: number } };
type JenisGroup = { jenisPengaduanId: string; _count: { _all: number } };

function countPerStatus(groups: StatusGroup[]): Record<PengaduanStatus, number> {
  const perStatus = Object.fromEntries(PENGADUAN_STATUS.map((s) => [s, 0])) as Record<PengaduanStatus, number>;
  // null (data lama & kiriman baru) dan nilai tak dikenal dibaca BARU lewat satu helper.
  for (const g of groups) perStatus[resolvePengaduanStatus(g.status)] += g._count._all;
  return perStatus;
}

function countPerJenis(groups: JenisGroup[], names: Map<string, string>): PengaduanRekap["perJenis"] {
  return groups
    .map((g) => ({ jenis: names.get(g.jenisPengaduanId) ?? "Lainnya", jumlah: g._count._all }))
    .sort((a, b) => b.jumlah - a.jumlah || a.jenis.localeCompare(b.jenis, "id"));
}

/**
 * GET publik (tanpa login): rekap tindak lanjut pengaduan. Hanya agregat + tanggapan admin; tidak pernah memuat
 * nama, email, telepon, NIK, judul, lokasi, deskripsi, gambar, atau id pengaduan. Keputusan: lomba Juknis 3.3.
 */
export default async function pengaduanMasyarakatRekap(context: Context) {
  try {
    const where = { isActive: true };
    const [statusGroups, jenisGroups, terbaru] = await Promise.all([
      prisma.pengaduanMasyarakat.groupBy({ by: ["status"], where, _count: { _all: true } }),
      prisma.pengaduanMasyarakat.groupBy({ by: ["jenisPengaduanId"], where, _count: { _all: true } }),
      prisma.pengaduanMasyarakat.findMany({
        where: { ...where, tanggapan: { not: null } },
        orderBy: { tanggapanAt: "desc" },
        take: REKAP_TANGGAPAN_LIMIT,
        select: { status: true, tanggapan: true, tanggapanAt: true, jenisPengaduan: { select: { nama: true } } },
      }),
    ]);

    const jenisList = await prisma.jenisPengaduan.findMany({
      where: { id: { in: jenisGroups.map((g) => g.jenisPengaduanId) } },
      select: { id: true, nama: true },
    });
    const names = new Map(jenisList.map((j) => [j.id, j.nama]));

    const perStatus = countPerStatus(statusGroups);
    const data: PengaduanRekap = {
      total: PENGADUAN_STATUS.reduce((sum, s) => sum + perStatus[s], 0),
      perStatus,
      perJenis: countPerJenis(jenisGroups, names),
      tanggapanTerbaru: terbaru
        .filter((p): p is typeof p & { tanggapan: string } => Boolean(p.tanggapan))
        .map((p) => ({
          jenis: p.jenisPengaduan.nama,
          status: resolvePengaduanStatus(p.status),
          tanggapan: p.tanggapan,
          tanggapanAt: p.tanggapanAt ? p.tanggapanAt.toISOString() : null,
        })),
    };
    return { success: true, message: "Berhasil mengambil rekap tindak lanjut pengaduan", data };
  } catch (error) {
    console.error("Gagal mengambil rekap pengaduan:", error instanceof Error ? error.message : error);
    context.set.status = 500;
    return { success: false, message: "Gagal mengambil rekap tindak lanjut pengaduan" };
  }
}
