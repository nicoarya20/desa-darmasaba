import prisma from "@/lib/prisma";
import {
  KATEGORI_PEMBANGUNAN_ID,
  STATUS_PEMBANGUNAN,
  isStatusPembangunan,
  type StatusPembangunan,
} from "@/lib/kegiatan-pembangunan";
import { Context } from "elysia";

const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 50;

export type MonevSummary = {
  totalKegiatan: number;
  perStatus: Record<StatusPembangunan, number> & { belumDiisi: number };
  totalAnggaran: number;
  rataRataProgres: number;
};

type StatusGroupRow = { statusPembangunan: string | null; _count: { _all: number } };

/** Susun ringkasan Monev dari hasil groupBy status + aggregate anggaran/progres. */
export function buildMonevSummary(
  groups: StatusGroupRow[],
  agg: { _sum: { anggaran: number | null }; _avg: { progres: number | null } },
): MonevSummary {
  const perStatus = { rencana: 0, berjalan: 0, selesai: 0, belumDiisi: 0 };
  let totalKegiatan = 0;

  for (const row of groups) {
    const count = row._count._all;
    totalKegiatan += count;
    if (isStatusPembangunan(row.statusPembangunan)) perStatus[row.statusPembangunan] += count;
    else perStatus.belumDiisi += count;
  }

  return {
    totalKegiatan,
    perStatus,
    totalAnggaran: agg._sum.anggaran ?? 0,
    rataRataProgres: Math.round((agg._avg.progres ?? 0) * 10) / 10,
  };
}

/** Ringkasan Monev publik: daftar kegiatan Pembangunan (terpaginasi) + agregat. */
async function kegiatanDesaMonev(context: Context) {
  const page = Math.max(1, Math.floor(Number(context.query.page)) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(Number(context.query.limit)) || DEFAULT_LIMIT));
  const status = (context.query.status as string) || "";

  if (status && !isStatusPembangunan(status)) {
    context.set.status = 400;
    return {
      success: false,
      message: `Status harus salah satu dari: ${STATUS_PEMBANGUNAN.join(", ")}`,
    };
  }

  // Agregat selalu atas seluruh kegiatan Pembangunan; filter status hanya untuk daftar.
  const baseWhere = { isActive: true, kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID };
  const listWhere = status ? { ...baseWhere, statusPembangunan: status } : baseWhere;

  try {
    const [data, total, groups, agg] = await Promise.all([
      prisma.kegiatanDesa.findMany({
        where: listWhere,
        select: {
          id: true,
          judul: true,
          deskripsiSingkat: true,
          tanggal: true,
          lokasi: true,
          anggaran: true,
          progres: true,
          statusPembangunan: true,
          sumberDana: true,
          image: { select: { link: true } },
          kategoriKegiatan: { select: { id: true, nama: true } },
        },
        orderBy: { tanggal: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.kegiatanDesa.count({ where: listWhere }),
      prisma.kegiatanDesa.groupBy({
        by: ["statusPembangunan"],
        where: baseWhere,
        _count: { _all: true },
      }),
      prisma.kegiatanDesa.aggregate({
        where: baseWhere,
        _sum: { anggaran: true },
        _avg: { progres: true },
      }),
    ]);

    return {
      success: true,
      message: "Berhasil ambil ringkasan monev pembangunan",
      data,
      summary: buildMonevSummary(groups, agg),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (e) {
    console.error("Error di kegiatanDesaMonev:", e);
    return { success: false, message: "Gagal mengambil ringkasan monev pembangunan" };
  }
}

export default kegiatanDesaMonev;
