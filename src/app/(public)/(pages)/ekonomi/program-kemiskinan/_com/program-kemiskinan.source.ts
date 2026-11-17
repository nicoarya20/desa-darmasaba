import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toProgramKemiskinan, type ProgramKemiskinan, type ProgramKemiskinanApiItem } from "./program-kemiskinan.logic";
import { PROGRAM_KEMISKINAN_FETCH_LIMIT } from "./program-kemiskinan.meta";
import type { HalamanPenerima, ProgramPublik, RekapPublik } from "./program-kemiskinan.types";

/** Jumlah penerima per halaman di daftar publik. */
export const PENERIMA_PUBLIK_LIMIT = 20;

// ---------- Daftar program ----------

/** Semua program aktif (sekali muat, urut createdAt terbaru); saring kata kunci & paginasi di klien. */
export async function loadProgramKemiskinan(): Promise<ProgramKemiskinan[]> {
  const res = await ApiFetch.api.ekonomi.programkemiskinan["find-many"].get({
    query: { page: 1, limit: PROGRAM_KEMISKINAN_FETCH_LIMIT },
  });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<ProgramKemiskinanApiItem>("program pengentasan kemiskinan", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Program pengentasan kemiskinan: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items.map((item) => toProgramKemiskinan(item));
}

// ---------- Detail program + penerima (endpoint publik/*) ----------

/** Detail program aktif (slug atau id); `null` = tidak ditemukan/nonaktif (404); galat lain → Error berkonteks. */
export async function loadProgramPublik(key: string): Promise<ProgramPublik | null> {
  const res = await ApiFetch.api.ekonomi.programkemiskinan.publik({ key }).get();
  if (res.status === 404) return null;
  if (res.error || !res.data?.success) throw new Error(`Gagal memuat program kemiskinan ${key}: HTTP ${res.status}`);
  return res.data.data;
}

/** Satu halaman penerima program pada `tahun` (opsional cari nama/alamat). */
export async function loadPenerimaPublik(
  key: string,
  opts: { tahun: number; page: number; search: string },
): Promise<HalamanPenerima> {
  const res = await ApiFetch.api.ekonomi.programkemiskinan.publik({ key }).penerima.get({
    query: {
      tahun: String(opts.tahun),
      page: String(opts.page),
      limit: String(PENERIMA_PUBLIK_LIMIT),
      ...(opts.search ? { search: opts.search } : {}),
    },
  });
  if (res.error || !res.data?.success) throw new Error(`Gagal memuat penerima ${key} tahun ${opts.tahun}: HTTP ${res.status}`);
  const { data, page, totalPages, total } = res.data;
  return { data, page, totalPages, total };
}

/** Rekap penerima per alamat program pada `tahun`. */
export async function loadRekapPublik(key: string, tahun: number): Promise<RekapPublik> {
  const res = await ApiFetch.api.ekonomi.programkemiskinan.publik({ key }).rekap.get({ query: { tahun: String(tahun) } });
  if (res.error || !res.data?.success) throw new Error(`Gagal memuat rekap ${key} tahun ${tahun}: HTTP ${res.status}`);
  const { data, lainnya, total } = res.data;
  return { tahun: res.data.tahun, data, lainnya, total };
}
