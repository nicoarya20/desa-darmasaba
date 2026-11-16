import ApiFetch from '@/lib/api-fetch';
import type { HalamanPenerima, ProgramPublik, RekapPublik } from './program-kemiskinan.types';

/** Jumlah penerima per halaman di daftar publik. */
export const PENERIMA_PUBLIK_LIMIT = 20;

/** URL detail publik program: slug bila ada, selain itu id. */
export function programHref(p: { id: string; slug?: string | null }): string {
  return `/ekonomi/program-kemiskinan/${encodeURIComponent(p.slug || p.id)}`;
}

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
