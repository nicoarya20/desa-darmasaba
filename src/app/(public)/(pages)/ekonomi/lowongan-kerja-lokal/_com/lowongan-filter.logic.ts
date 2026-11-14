import { matchesSearch } from '../../umkm/_com/katalog/katalog-filter.logic';
import {
  GAJI_MIN_OPTIONS,
  LOKASI_OPTIONS,
  LOWONGAN_URUT,
  TAYANG_HARI_OPTIONS,
  type GajiMin,
  type LokasiKerja,
  type LowonganUrut,
  type TayangHari,
} from './lowongan-filter.meta';
import { LOWONGAN_FILTER_TEXT as T } from './lowongan-filter.text';
import type { LowonganParams } from './lowongan-params.logic';
import type { Lowongan } from './lowongan.types';

/** Grup panel Filter, dalam urutan tampil. */
export type FilterGroupKey = 'tipe' | 'lokasi' | 'gaji' | 'tayang';

/** Satu pilihan tipe dari data: kunci URL, tulisan pertama yang ditemui, jumlah lowongan. */
export type FacetOption = { key: string; label: string; count: number };

/** Satu pilihan daftar tetap (lokasi, ambang gaji, hari tayang) beserta jumlah lowongan yang lolos. */
export type FixedOption<V extends string | number> = { value: V; label: string; count: number };

export type LowonganFacets = {
  tipe: FacetOption[];
  lokasi: FixedOption<LokasiKerja>[];
  gaji: FixedOption<GajiMin>[];
  tayang: FixedOption<TayangHari>[];
};

/** Chip filter aktif: grup (untuk ikon), label, dan params bila chip dihapus. */
export type FilterChip = { key: string; group: FilterGroupKey; label: string; next: LowonganParams };

const DAY_MS = 86_400_000;
const RUPIAH_PER_JUTA = 1_000_000;

const byLabel = (a: FacetOption, b: FacetOption) => a.label.localeCompare(b.label, 'id', { sensitivity: 'base' });

/** Label ambang gaji: 1500000 → "Minimal Rp1,5 juta". */
export function gajiMinLabel(value: GajiMin): string {
  return T.gajiMin(String(value / RUPIAH_PER_JUTA).replace('.', ','));
}

/** Batas bawah waktu tayang (epoch ms) untuk "N hari terakhir" dihitung dari `nowMs`. */
export function tayangSinceMs(hari: TayangHari, nowMs: number): number {
  return nowMs - hari * DAY_MS;
}

/** Kelompokkan per kunci (kunci kosong/null dilewati); label = tulisan pertama yang ditemui. */
function facetOf(items: readonly Lowongan[], pick: (item: Lowongan) => { key: string | null; label: string | null }) {
  const groups = new Map<string, FacetOption>();
  for (const item of items) {
    const { key, label } = pick(item);
    if (!key) continue;
    const group = groups.get(key) ?? { key, label: label ?? key, count: 0 };
    group.count += 1;
    groups.set(key, group);
  }
  return [...groups.values()];
}

/**
 * Pilihan dan jumlah panel Filter, dihitung dari seluruh lowongan yang dimuat (bukan hasil saring lain).
 * Tipe: jumlah terbanyak lalu nama. Lokasi, gaji, dan waktu tayang: daftar tetap.
 */
export function lowonganFacets(items: readonly Lowongan[], nowMs: number): LowonganFacets {
  return {
    tipe: facetOf(items, (l) => ({ key: l.tipeKey, label: l.tipe })).sort((a, b) => b.count - a.count || byLabel(a, b)),
    lokasi: LOKASI_OPTIONS.map((value) => ({
      value,
      label: T.lokasi[value],
      count: items.filter((l) => l.diDesa === (value === 'desa')).length,
    })),
    gaji: GAJI_MIN_OPTIONS.map((value) => ({
      value,
      label: gajiMinLabel(value),
      count: items.filter((l) => l.gaji !== null && l.gaji >= value).length,
    })),
    tayang: TAYANG_HARI_OPTIONS.map((value) => ({
      value,
      label: T.tayang[value],
      count: items.filter((l) => l.tayangMs >= tayangSinceMs(value, nowMs)).length,
    })),
  };
}

/** Pilihan daftar tetap yang ditampilkan: jumlah 0 disembunyikan kecuali sedang terpilih. */
export function visibleFixed<V extends string | number>(options: readonly FixedOption<V>[], selected: V | null): FixedOption<V>[] {
  return options.filter((option) => option.count > 0 || option.value === selected);
}

/** Buang kunci tipe dari URL yang tidak ada di data (nilai tak dikenal diabaikan). */
export function resolveParams(p: LowonganParams, facets: LowonganFacets): LowonganParams {
  return { ...p, tipe: p.tipe.filter((key) => facets.tipe.some((option) => option.key === key)) };
}

/** Lowongan yang lolos kata kunci (posisi, pemberi kerja, lokasi, tipe) dan semua filter aktif. */
export function filterLowongan(items: readonly Lowongan[], p: LowonganParams, nowMs: number): Lowongan[] {
  const since = p.tayang === null ? null : tayangSinceMs(p.tayang, nowMs);
  return items.filter(
    (item) =>
      matchesSearch(p.q, [item.posisi, item.pemberiKerja, item.lokasi, item.tipe]) &&
      (p.tipe.length === 0 || (item.tipeKey !== null && p.tipe.includes(item.tipeKey))) &&
      (p.lokasi === null || item.diDesa === (p.lokasi === 'desa')) &&
      (p.gaji === null || (item.gaji !== null && item.gaji >= p.gaji)) &&
      (since === null || item.tayangMs >= since),
  );
}

const byTerbaru = (a: Lowongan, b: Lowongan) => b.tayangMs - a.tayangMs;

/** Urutkan lowongan; pada kedua urutan gaji, lowongan tanpa gaji selalu di akhir dan gaji seri → terbaru dulu. */
export function sortLowongan(items: readonly Lowongan[], urut: LowonganUrut): Lowongan[] {
  const list = [...items];
  if (urut === 'terbaru') return list.sort(byTerbaru);
  const direction = urut === 'gaji-asc' ? 1 : -1;
  return list.sort((a, b) => {
    if (a.gaji === null || b.gaji === null) return Number(a.gaji === null) - Number(b.gaji === null) || byTerbaru(a, b);
    return direction * (a.gaji - b.gaji) || byTerbaru(a, b);
  });
}

/** Pilihan "Urutkan". */
export function urutOptions(): { value: LowonganUrut; label: string }[] {
  return LOWONGAN_URUT.map((value) => ({ value, label: T.urut[value] }));
}

/** Chip filter aktif dalam urutan panel (kata kunci tidak dijadikan chip; ia tampil di kolom cari). */
export function activeChips(p: LowonganParams, facets: LowonganFacets): FilterChip[] {
  const chips: FilterChip[] = p.tipe.map((key) => ({
    key: `tipe:${key}`,
    group: 'tipe',
    label: facets.tipe.find((o) => o.key === key)?.label ?? key,
    next: { ...p, tipe: p.tipe.filter((k) => k !== key) },
  }));
  if (p.lokasi !== null) {
    chips.push({ key: 'lokasi', group: 'lokasi', label: T.lokasi[p.lokasi], next: { ...p, lokasi: null } });
  }
  if (p.gaji !== null) chips.push({ key: 'gaji', group: 'gaji', label: gajiMinLabel(p.gaji), next: { ...p, gaji: null } });
  if (p.tayang !== null) {
    chips.push({ key: 'tayang', group: 'tayang', label: T.tayang[p.tayang], next: { ...p, tayang: null } });
  }
  return chips;
}
