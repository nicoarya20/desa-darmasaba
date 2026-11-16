// Bagian query bersama daftar penerima Program Kemiskinan (publik & admin): paginasi, filter, urutan.
import type { Prisma } from "@prisma/client";
import { rapikanTeks, validasiTahun } from "@/lib/program-kemiskinan/penerima.rules";

/** Batas baris per halaman daftar penerima publik. */
export const LIMIT_PUBLIK_MAKS = 50;
/** Batas baris per halaman daftar penerima admin. */
export const LIMIT_ADMIN_MAKS = 100;
const LIMIT_DEFAULT = 20;
const SEARCH_MAKS = 100;

/** Halaman yang sudah dibatasi: page ≥ 1, 1 ≤ limit ≤ `maks`. */
export type Halaman = { page: number; limit: number; skip: number };

/** Baca `page`/`limit` dari query string; nilai rusak → default, limit dipotong ke `maks`. */
export function bacaHalaman(query: Record<string, unknown>, maks: number): Halaman {
  const p = Math.floor(Number(query.page));
  const l = Math.floor(Number(query.limit));
  const page = Number.isFinite(p) && p >= 1 ? p : 1;
  const limit = Number.isFinite(l) && l >= 1 ? Math.min(l, maks) : Math.min(LIMIT_DEFAULT, maks);
  return { page, limit, skip: (page - 1) * limit };
}

/** Kata kunci pencarian yang dirapikan dan dibatasi panjangnya ("" = tanpa pencarian). */
export function bacaSearch(raw: unknown): string {
  return rapikanTeks(raw).slice(0, SEARCH_MAKS);
}

/** Tahun dari query string; tidak ada/tidak valid → null. */
export function bacaTahun(raw: unknown): number | null {
  const v = validasiTahun(raw);
  return v.ok ? v.value : null;
}

/** Filter penerima satu program (opsional per tahun & pencarian nama/alamat; publik: hanya aktif). */
export function wherePenerima(opts: {
  programId: string;
  tahun: number | null;
  search: string;
  hanyaAktif: boolean;
}): Prisma.PenerimaProgramKemiskinanWhereInput {
  return {
    programId: opts.programId,
    ...(opts.tahun !== null ? { tahun: opts.tahun } : {}),
    ...(opts.hanyaAktif ? { isActive: true } : {}),
    ...(opts.search
      ? {
          OR: [
            { nama: { contains: opts.search, mode: "insensitive" } },
            { alamat: { contains: opts.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

/** Urutan tampil: urutan impor/manual, lalu waktu dibuat (stabil untuk paginasi). */
export const URUTAN_PENERIMA: Prisma.PenerimaProgramKemiskinanOrderByWithRelationInput[] = [
  { urutan: "asc" },
  { createdAt: "asc" },
  { id: "asc" },
];

/** Bentuk metadata paginasi seragam untuk respons daftar. */
export function metaHalaman(h: Halaman, total: number) {
  return { page: h.page, limit: h.limit, total, totalPages: Math.max(1, Math.ceil(total / h.limit)) };
}
