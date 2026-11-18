import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";
import { LAPORAN_SELECT, gagal } from "./laporan-bulanan.http";
import { cekBulan, cekTahun } from "./laporan-bulanan.rules";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** Angka query string utuh (mis. "2026"); NaN bila kosong atau bukan angka — supaya filter tak diam-diam diabaikan. */
const angkaQuery = (v: unknown): number => (typeof v === "string" && v.trim() !== "" ? Number(v) : Number.NaN);

/** GET /find-many (publik): laporan aktif terpaginasi, filter `tahun`/`bulan`/`banjar`; tanpa data pribadi. */
export default async function laporanBulananFindMany(context: Context) {
  const q = context.query as Record<string, unknown>;
  const page = Math.max(1, Math.floor(Number(q.page)) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(Number(q.limit)) || DEFAULT_LIMIT));
  const banjar = typeof q.banjar === "string" ? q.banjar.trim() : "";

  const where: Prisma.LaporanPendudukBulananWhereInput = { isActive: true };
  if (q.tahun !== undefined && q.tahun !== "") {
    const tahun = angkaQuery(q.tahun);
    const galat = cekTahun(tahun);
    if (galat) return gagal(context.set, 400, galat);
    where.tahun = tahun;
  }
  if (q.bulan !== undefined && q.bulan !== "") {
    const bulan = angkaQuery(q.bulan);
    const galat = cekBulan(bulan);
    if (galat) return gagal(context.set, 400, galat);
    where.bulan = bulan;
  }
  if (banjar) where.banjar = { contains: banjar, mode: "insensitive" };

  try {
    const [data, total] = await Promise.all([
      prisma.laporanPendudukBulanan.findMany({
        where,
        select: LAPORAN_SELECT,
        orderBy: [{ tahun: "desc" }, { bulan: "desc" }, { banjar: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.laporanPendudukBulanan.count({ where }),
    ]);
    return {
      success: true as const,
      message: "Berhasil ambil laporan bulanan",
      data,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  } catch (e) {
    console.error("Error di laporanBulananFindMany:", e);
    return gagal(context.set, 500, "Gagal mengambil laporan bulanan");
  }
}
