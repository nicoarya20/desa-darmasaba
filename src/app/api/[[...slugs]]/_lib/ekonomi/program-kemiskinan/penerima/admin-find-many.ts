import prisma from "@/lib/prisma";
import { jumlahPerTahun } from "@/lib/program-kemiskinan/penerima-rekap";
import type { Context } from "elysia";
import { badRequest, guardAdminPenerima } from "./penerima.body";
import {
  bacaHalaman,
  bacaSearch,
  bacaTahun,
  LIMIT_ADMIN_MAKS,
  metaHalaman,
  URUTAN_PENERIMA,
  wherePenerima,
} from "./penerima.query";

/**
 * GET /penerima/admin?programId=&tahun=&page=&limit=&search= — daftar penerima (termasuk nonaktif)
 * berpaginasi untuk admin, plus jumlah per tahun (semua status) untuk pilihan tahun.
 */
export default async function penerimaAdminFindMany(context: Context) {
  const ditolak = await guardAdminPenerima(context.set);
  if (ditolak) return ditolak;

  const query = (context.query ?? {}) as Record<string, unknown>;
  const programId = String(query.programId ?? "").trim();
  if (!programId) return badRequest(context.set, "programId wajib diisi");

  const halaman = bacaHalaman(query, LIMIT_ADMIN_MAKS);
  const where = wherePenerima({
    programId,
    tahun: bacaTahun(query.tahun),
    search: bacaSearch(query.search),
    hanyaAktif: false,
  });
  const [data, total, grupTahun] = await Promise.all([
    prisma.penerimaProgramKemiskinan.findMany({
      where,
      select: { id: true, nama: true, alamat: true, tahun: true, isActive: true, urutan: true },
      orderBy: URUTAN_PENERIMA,
      skip: halaman.skip,
      take: halaman.limit,
    }),
    prisma.penerimaProgramKemiskinan.count({ where }),
    prisma.penerimaProgramKemiskinan.groupBy({ by: ["tahun"], where: { programId }, _count: { _all: true } }),
  ]);
  return { success: true as const, data, ...metaHalaman(halaman, total), tahun: jumlahPerTahun(grupTahun) };
}
