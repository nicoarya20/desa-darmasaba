/** Helper murni halaman publik Info Sekolah: URL daftar, opsi filter jenjang, dan pesan kosong. */

export const INFO_SEKOLAH_PATH = "/pendidikan/info-sekolah";

/** Ukuran satu halaman tabel Lembaga/Siswa/Pengajar. */
export const INFO_SEKOLAH_PAGE_SIZE = 10;

/** Jeda ketik sebelum kata kunci dikirim ke URL (ms). */
export const INFO_SEKOLAH_SEARCH_DEBOUNCE_MS = 500;

export type InfoSekolahQuery = { jenjang: string; search: string; page: number };

/** Path daftar → URL dengan `?jenjang=&search=&page=`; nilai kosong dan halaman 1 tidak ditulis. */
export function buildListHref(path: string, query: Partial<InfoSekolahQuery> = {}): string {
  const params = new URLSearchParams();
  const jenjang = query.jenjang?.trim().toLowerCase();
  const search = query.search?.trim();
  if (jenjang) params.set("jenjang", jenjang);
  if (search) params.set("search", search);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export type JenjangOption = { value: string; label: string };

/**
 * Urutan tampil jenjang = urutan sekolah dari usia termuda (huruf kecil). Tabel jenjang di DB tidak punya kolom urutan,
 * dan API mengurutkan menurut nama (SMA, SMK, SMP, SD, …) yang membingungkan warga. Jenjang lain → di belakang, A–Z.
 */
export const JENJANG_ORDER: readonly string[] = ["paud", "tk", "sd", "smp", "sma", "smk"];

function jenjangRank(value: string): number {
  const i = JENJANG_ORDER.indexOf(value);
  return i === -1 ? JENJANG_ORDER.length : i;
}

/**
 * Opsi `Select` jenjang dari nama jenjang di DB (value = huruf kecil, sama dengan URL), diurutkan menurut `JENJANG_ORDER`.
 * Jenjang aktif yang belum/tidak ada di daftar tetap dimunculkan agar `Select` tidak kosong saat memuat.
 */
export function jenjangOptions(names: readonly string[], current: string): JenjangOption[] {
  const options = names.map((nama) => ({ value: nama.trim().toLowerCase(), label: nama }));
  const active = current.trim().toLowerCase();
  if (active && !options.some((o) => o.value === active)) options.push({ value: active, label: current });
  return options.sort((a, b) => jenjangRank(a.value) - jenjangRank(b.value) || a.value.localeCompare(b.value));
}

/** Pesan saat tabel kosong: beda antara memang belum ada data dan hasil filter/pencarian yang nihil. */
export function emptyMessage(noun: string, query: Pick<InfoSekolahQuery, "jenjang" | "search">): string {
  const search = query.search.trim();
  if (search && query.jenjang) return `Tidak ada ${noun} “${search}” di jenjang ${query.jenjang.toUpperCase()}.`;
  if (search) return `Tidak ada ${noun} yang cocok dengan “${search}”.`;
  if (query.jenjang) return `Belum ada data ${noun} di jenjang ${query.jenjang.toUpperCase()}.`;
  return `Belum ada data ${noun}.`;
}
