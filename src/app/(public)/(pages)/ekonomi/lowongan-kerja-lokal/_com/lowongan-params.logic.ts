import {
  GAJI_MIN_OPTIONS,
  LOKASI_OPTIONS,
  LOWONGAN_BASE_HREF,
  LOWONGAN_URUT,
  TAYANG_HARI_OPTIONS,
  type GajiMin,
  type LokasiKerja,
  type LowonganUrut,
  type TayangHari,
} from './lowongan-filter.meta';

/**
 * Keadaan daftar lowongan yang disimpan di URL: `q`, `tipe` (kunci dipisah koma), `lokasi` (`desa|luar`), `gaji` (ambang
 * minimal), `tayang` (hari ke belakang), `urut`. Nilai bawaan tidak ditulis; nilai tak dikenal diabaikan.
 */
export type LowonganParams = {
  q: string;
  /** `tipeKey` terpilih (banyak). */
  tipe: string[];
  lokasi: LokasiKerja | null;
  gaji: GajiMin | null;
  tayang: TayangHari | null;
  urut: LowonganUrut;
};

/** Pengubah params: fungsi dari params terakhir (lihat use-lowongan-params.ts). */
export type LowonganUpdate = (change: (current: LowonganParams) => LowonganParams) => void;

type Reader = { get(name: string): string | null };

const DEFAULT_URUT: LowonganUrut = LOWONGAN_URUT[0];

/** Params kosong: urutan bawaan, tanpa filter; kata kunci boleh dibawa. */
export function emptyParams(q = ''): LowonganParams {
  return { q, tipe: [], lokasi: null, gaji: null, tayang: null, urut: DEFAULT_URUT };
}

/**
 * Kunci tipe berasal dari teks bebas (bisa memuat koma), sedangkan koma adalah pemisah daftar. Koma dan persen
 * di dalam kunci ditulis sebagai `%2C` / `%25` supaya tetap terbaca setelah peramban men-decode query.
 */
const escapeKey = (key: string) => key.replace(/%/g, '%25').replace(/,/g, '%2C');
const unescapeKey = (part: string) => part.replace(/%(2C|25)/gi, (_, hex: string) => (hex === '25' ? '%' : ','));

/** Daftar kunci unik dari "a,b,,a" → ["a","b"]. */
function parseKeys(raw: string | null): string[] {
  const keys = (raw ?? '').split(',').map((part) => unescapeKey(part).trim()).filter(Boolean);
  return [...new Set(keys)];
}

/** Angka dari teks bila termasuk daftar pilihan yang sah; selain itu null. */
function parseChoice<T extends number>(raw: string | null, options: readonly T[]): T | null {
  if (raw === null || !/^\d{1,9}$/.test(raw.trim())) return null;
  const value = Number(raw.trim());
  return options.find((option) => option === value) ?? null;
}

/** Baca params dari URL; nilai tak dikenal diabaikan (kembali ke bawaan). */
export function parseLowonganParams(search: Reader): LowonganParams {
  return {
    q: search.get('q')?.trim() ?? '',
    tipe: parseKeys(search.get('tipe')),
    lokasi: LOKASI_OPTIONS.find((value) => value === search.get('lokasi')) ?? null,
    gaji: parseChoice(search.get('gaji'), GAJI_MIN_OPTIONS),
    tayang: parseChoice(search.get('tayang'), TAYANG_HARI_OPTIONS),
    urut: LOWONGAN_URUT.find((value) => value === search.get('urut')) ?? DEFAULT_URUT,
  };
}

/** URL daftar lowongan untuk params; nilai bawaan tidak ditulis. Tiap kunci di-encode, koma pemisah tidak. */
export function lowonganListHref(p: LowonganParams): string {
  const parts: string[] = [];
  const add = (name: string, value: string) => parts.push(`${name}=${value}`);
  const keys = (list: readonly string[]) => list.map((key) => encodeURIComponent(escapeKey(key))).join(',');
  if (p.q) add('q', encodeURIComponent(p.q));
  if (p.tipe.length) add('tipe', keys(p.tipe));
  if (p.lokasi !== null) add('lokasi', p.lokasi);
  if (p.gaji !== null) add('gaji', String(p.gaji));
  if (p.tayang !== null) add('tayang', String(p.tayang));
  if (p.urut !== DEFAULT_URUT) add('urut', p.urut);
  return parts.length ? `${LOWONGAN_BASE_HREF}?${parts.join('&')}` : LOWONGAN_BASE_HREF;
}

/** "Hapus semua" filter: kata kunci dan urutan tetap. */
export function clearFilters(p: LowonganParams): LowonganParams {
  return { ...emptyParams(p.q), urut: p.urut };
}

/** Kosongkan filter dan kata kunci (aksi keadaan "tidak ada yang cocok"); urutan tetap. */
export function clearAll(p: LowonganParams): LowonganParams {
  return { ...emptyParams(), urut: p.urut };
}

/** Banyak filter aktif (tiap tipe dihitung satu; lokasi, gaji, dan waktu tayang masing-masing satu). */
export function countActiveFilters(p: LowonganParams): number {
  return p.tipe.length + Number(p.lokasi !== null) + Number(p.gaji !== null) + Number(p.tayang !== null);
}

/** Pilih/lepas satu kunci pada filter banyak pilihan (tipe). */
export function toggleKey(keys: readonly string[], key: string): string[] {
  return keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key];
}

/** Pilih satu nilai pada filter satu pilihan; memilih nilai yang sedang aktif melepasnya. */
export function toggleSingle<T>(current: T | null, value: T): T | null {
  return current === value ? null : value;
}
