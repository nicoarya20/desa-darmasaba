import prisma from "@/lib/prisma";
import { rekapPerAlamat } from "@/lib/program-kemiskinan/penerima-rekap";
import type { Context } from "elysia";
import {
  bacaHalaman,
  bacaSearch,
  bacaTahun,
  LIMIT_PUBLIK_MAKS,
  metaHalaman,
  URUTAN_PENERIMA,
  wherePenerima,
} from "../penerima/penerima.query";
import { cariProgramPublik, programTidakAda } from "./program-publik";

/** Kolom yang boleh keluar ke publik — hanya nama, alamat, tahun (tanpa id maupun kolom lain). */
export const PENERIMA_PUBLIK_SELECT = { nama: true, alamat: true, tahun: true } as const;

function tahunWajib(set: Context["set"]) {
  set.status = 400;
  return { success: false as const, message: "Parameter tahun wajib diisi dengan tahun yang valid" };
}

/** GET /publik/:key/penerima?tahun=&page=&limit=&search= — daftar penerima aktif berpaginasi. */
export async function penerimaPublikFindMany(context: Context) {
  const query = (context.query ?? {}) as Record<string, unknown>;
  const tahun = bacaTahun(query.tahun);
  if (tahun === null) return tahunWajib(context.set);
  const program = await cariProgramPublik(String(context.params?.key ?? ""));
  if (!program) return programTidakAda(context.set);

  const halaman = bacaHalaman(query, LIMIT_PUBLIK_MAKS);
  const where = wherePenerima({ programId: program.id, tahun, search: bacaSearch(query.search), hanyaAktif: true });
  const [data, total] = await Promise.all([
    prisma.penerimaProgramKemiskinan.findMany({
      where,
      select: PENERIMA_PUBLIK_SELECT,
      orderBy: URUTAN_PENERIMA,
      skip: halaman.skip,
      take: halaman.limit,
    }),
    prisma.penerimaProgramKemiskinan.count({ where }),
  ]);
  return { success: true as const, data, ...metaHalaman(halaman, total) };
}

/** GET /publik/:key/rekap?tahun= — jumlah penerima aktif per alamat/banjar pada satu tahun. */
export async function penerimaPublikRekap(context: Context) {
  const query = (context.query ?? {}) as Record<string, unknown>;
  const tahun = bacaTahun(query.tahun);
  if (tahun === null) return tahunWajib(context.set);
  const program = await cariProgramPublik(String(context.params?.key ?? ""));
  if (!program) return programTidakAda(context.set);

  const grup = await prisma.penerimaProgramKemiskinan.groupBy({
    by: ["alamat"],
    where: { programId: program.id, tahun, isActive: true },
    _count: { _all: true },
  });
  return { success: true as const, tahun, ...rekapPerAlamat(grup) };
}
