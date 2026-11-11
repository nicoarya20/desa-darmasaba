// Pilihan "Urutkan" halaman program publik Desa Anti Korupsi: nilai query `?urut=<key>-<dir>`,
// parsing (nilai asing → default), dan pengurutan daftar dokumen / hasil cari.
import type { DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { sortDokumen, type DokumenSortKey, type SortDir } from '@/lib/desa-anti-korupsi-sort';

/** Pilihan urut yang tersedia di UI; `value` = isi query `?urut=`. */
export const URUT_OPTIONS = [
  { value: 'urutan-asc', label: 'Urutan asli' },
  { value: 'judul-asc', label: 'Judul A–Z' },
  { value: 'tanggal-desc', label: 'Terbaru' },
  { value: 'tanggal-asc', label: 'Terlama' },
  { value: 'tipe-asc', label: 'Tipe' },
  { value: 'ukuran-desc', label: 'Ukuran terbesar' },
] as const satisfies readonly { value: `${DokumenSortKey}-${SortDir}`; label: string }[];

/** Nilai `?urut=` yang dikenal. */
export type UrutValue = (typeof URUT_OPTIONS)[number]['value'];

/** Urut default = urutan asli dari admin (tidak ditulis ke URL). */
export const URUT_DEFAULT: UrutValue = 'urutan-asc';

const URUT_VALUES = new Set<string>(URUT_OPTIONS.map((o) => o.value));

/** Baca `?urut=`; kosong / tidak dikenal → urut default. */
export function parseUrut(param: string | null | undefined): UrutValue {
  return param && URUT_VALUES.has(param) ? (param as UrutValue) : URUT_DEFAULT;
}

/** Nilai query untuk URL; urut default → null (parameter dihilangkan). */
export function serializeUrut(urut: UrutValue): string | null {
  return urut === URUT_DEFAULT ? null : urut;
}

/**
 * Urutkan item yang membawa dokumen (baris folder atau hasil cari lintas folder) tanpa mengubah input.
 * Urutan asli = urutan dari API (folder lalu `urutan`), jadi dikembalikan apa adanya.
 */
export function urutkanItems<T>(
  items: readonly T[],
  dokumenOf: (item: T) => DokumenDesaAntiKorupsiView,
  urut: UrutValue,
): T[] {
  if (urut === URUT_DEFAULT) return [...items];
  const [key, dir] = urut.split('-') as [DokumenSortKey, SortDir];
  return sortDokumen(
    items.map((item) => ({ ...dokumenOf(item), item })),
    key,
    dir,
  ).map((entry) => entry.item);
}
