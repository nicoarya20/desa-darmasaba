import { formatHarga } from './katalog-card.logic';
import { PRODUK_URUT, TOKO_URUT, type KatalogTab, type KatalogUrut } from './katalog-filter.meta';
import { KATALOG_FILTER_TEXT as T } from './katalog-filter.text';
import type { KatalogParams } from './katalog-params.logic';
import type { KatalogProduk, KatalogRef, KatalogToko } from './katalog.types';

/**
 * Satu pilihan kotak centang di panel saring beserta jumlah entri dari data yang dimuat. `id` = id wakil yang ditulis
 * ke URL; `ids` = semua id yang digabung ke pilihan ini (kategori bernama sama), dipakai saat menyaring.
 */
export type FacetOption = { id: string; ids: string[]; label: string; count: number };

export type ProdukFacets = { kategori: FacetOption[]; toko: FacetOption[]; tersedia: number; unggulan: number };
export type TokoFacets = { kategori: FacetOption[] };

/** Chip saringan aktif: label + params bila chip dihapus. */
export type FilterChip = { key: string; label: string; next: KatalogParams };

/** Huruf kecil + spasi dirapatkan, untuk mencocokkan kata kunci tanpa peduli kapital/spasi ganda. */
export function normalizeSearch(text: string | null | undefined): string {
  return (text ?? '').toLocaleLowerCase('id').replace(/\s+/g, ' ').trim();
}

/** Setiap kata kunci harus muncul di salah satu kolom (kata kunci kosong = cocok semua). */
export function matchesSearch(query: string, fields: readonly (string | null | undefined)[]): boolean {
  const words = normalizeSearch(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fields.map(normalizeSearch).join(' \n ');
  return words.every((word) => haystack.includes(word));
}

/**
 * Pilihan dari relasi bernama, dengan jumlahnya, urut nama; relasi kosong tidak dihitung.
 * `mergeByName` menggabungkan id berbeda yang namanya sama (setelah dinormalisasi) jadi satu pilihan; id wakil =
 * id terkecil secara leksikal supaya URL & label stabil walau urutan data berubah.
 */
function facetOf<T>(items: readonly T[], pick: (item: T) => KatalogRef | null, mergeByName = false): FacetOption[] {
  const groups = new Map<string, { names: Map<string, string>; count: number }>();
  for (const item of items) {
    const ref = pick(item);
    if (!ref) continue;
    const key = mergeByName ? normalizeSearch(ref.nama) : ref.id;
    const group = groups.get(key) ?? { names: new Map<string, string>(), count: 0 };
    group.names.set(ref.id, ref.nama.trim());
    group.count += 1;
    groups.set(key, group);
  }
  return [...groups.values()]
    .map(({ names, count }) => {
      const ids = [...names.keys()].sort();
      // Label dari id wakil (bukan entri pertama) agar tidak berubah mengikuti urutan data.
      return { id: ids[0], ids, label: names.get(ids[0]) ?? '', count };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'id', { sensitivity: 'base' }));
}

// MITIGASI SEMENTARA(umkm-kategori-ganda): data kategori ganda di admin — docs/BACKEND-TODO.md (Isi data).
// Stg 2026-11-13 punya dua kategori "Makanan" berbeda id; tanpa penggabungan panel menampilkan dua baris bernama sama.
const MERGE_KATEGORI_BY_NAME = true;

/** Pilihan & jumlah panel saring tab Produk, dari seluruh produk yang dimuat (bukan hasil saring). */
export function produkFacets(items: readonly KatalogProduk[]): ProdukFacets {
  return {
    kategori: facetOf(items, (p) => p.kategori, MERGE_KATEGORI_BY_NAME),
    toko: facetOf(items, (p) => p.umkm),
    tersedia: items.filter((p) => p.stok > 0).length,
    unggulan: items.filter((p) => p.isUnggulan).length,
  };
}

/** Pilihan & jumlah panel saring tab Toko. */
export function tokoFacets(items: readonly KatalogToko[]): TokoFacets {
  return { kategori: facetOf(items, (t) => t.kategori, MERGE_KATEGORI_BY_NAME) };
}

/** Id URL → id wakil pilihannya (id mana pun dalam grup memilih grup itu); id tak dikenal dibuang, tanpa duplikat. */
function toRepresentative(ids: readonly string[], options: readonly FacetOption[]): string[] {
  const reps = ids.flatMap((id) => options.find((option) => option.ids.includes(id))?.id ?? []);
  return [...new Set(reps)];
}

/** Ganti id di URL dengan id wakil pilihan yang ada di data (nilai tak dikenal diabaikan). */
export function resolveParams(params: KatalogParams, facets: ProdukFacets | TokoFacets): KatalogParams {
  const toko = 'toko' in facets ? toRepresentative(params.toko, facets.toko) : [];
  return { ...params, kategori: toRepresentative(params.kategori, facets.kategori), toko };
}

/** Semua id anggota dari id wakil terpilih (untuk menyaring data). */
export function expandIds(selected: readonly string[], options: readonly FacetOption[]): string[] {
  return options.filter((option) => selected.includes(option.id)).flatMap((option) => option.ids);
}

/** Centang/lepas satu pilihan: bila salah satu id grupnya terpilih → semua id grup dilepas, selain itu id wakil ditambah. */
export function toggleOption(ids: readonly string[], option: FacetOption): string[] {
  return ids.some((id) => option.ids.includes(id))
    ? ids.filter((id) => !option.ids.includes(id))
    : [...ids, option.id];
}

/** Produk yang lolos kata kunci & saringan (`kategori`/`toko` = semua id anggota, lihat expandIds). */
export function filterProduk(items: readonly KatalogProduk[], p: KatalogParams): KatalogProduk[] {
  return items.filter(
    (item) =>
      matchesSearch(p.q, [item.nama, item.umkm?.nama]) &&
      (p.kategori.length === 0 || (item.kategori !== null && p.kategori.includes(item.kategori.id))) &&
      (p.toko.length === 0 || (item.umkm !== null && p.toko.includes(item.umkm.id))) &&
      (p.min === null || item.harga >= p.min) &&
      (p.max === null || item.harga <= p.max) &&
      (!p.tersedia || item.stok > 0) &&
      (!p.unggulan || item.isUnggulan),
  );
}

/** Toko yang lolos kata kunci (nama, pemilik, alamat) & kategori usaha (`kategori` = semua id anggota). */
export function filterToko(items: readonly KatalogToko[], p: KatalogParams): KatalogToko[] {
  return items.filter(
    (item) =>
      matchesSearch(p.q, [item.nama, item.pemilik, item.alamat]) &&
      (p.kategori.length === 0 || (item.kategori !== null && p.kategori.includes(item.kategori.id))),
  );
}

const byNama = (a: { nama: string }, b: { nama: string }) => a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' });
const byTerbaru = (a: { createdAt: string }, b: { createdAt: string }) => Date.parse(b.createdAt) - Date.parse(a.createdAt);

/** Urutkan produk; harga seri → yang terbaru dulu. */
export function sortProduk(items: readonly KatalogProduk[], urut: KatalogUrut): KatalogProduk[] {
  const list = [...items];
  if (urut === 'harga-asc') return list.sort((a, b) => a.harga - b.harga || byTerbaru(a, b));
  if (urut === 'harga-desc') return list.sort((a, b) => b.harga - a.harga || byTerbaru(a, b));
  if (urut === 'nama') return list.sort(byNama);
  return list.sort(byTerbaru);
}

/** Urutkan toko: nama A–Z (bawaan) atau terbaru. */
export function sortToko(items: readonly KatalogToko[], urut: KatalogUrut): KatalogToko[] {
  return [...items].sort(urut === 'terbaru' ? byTerbaru : byNama);
}

/** Pilihan "Urutkan" untuk satu tab. */
export function urutOptions(tab: KatalogTab): { value: KatalogUrut; label: string }[] {
  return (tab === 'toko' ? TOKO_URUT : PRODUK_URUT).map((value) => ({ value, label: T.urut[value] }));
}

/** Label chip harga: "Rp10.000–Rp50.000", "Mulai Rp10.000", atau "Sampai Rp50.000". */
export function hargaLabel(min: number | null, max: number | null): string | null {
  if (min !== null && max !== null) return `${formatHarga(min)}–${formatHarga(max)}`;
  if (min !== null) return T.chipHargaMin(formatHarga(min));
  if (max !== null) return T.chipHargaMax(formatHarga(max));
  return null;
}

/** Chip saringan aktif dalam urutan panel (kata kunci tidak dijadikan chip; ia tampil di kolom cari). */
export function activeChips(p: KatalogParams, facets: ProdukFacets | TokoFacets): FilterChip[] {
  const labelOf = (options: readonly FacetOption[], id: string) => options.find((o) => o.id === id)?.label ?? id;
  const chips: FilterChip[] = p.kategori.map((id) => ({
    key: `kategori:${id}`,
    label: labelOf(facets.kategori, id),
    next: { ...p, kategori: p.kategori.filter((k) => k !== id) },
  }));
  if (!('toko' in facets)) return chips;
  for (const id of p.toko) {
    chips.push({ key: `toko:${id}`, label: labelOf(facets.toko, id), next: { ...p, toko: p.toko.filter((t) => t !== id) } });
  }
  const harga = hargaLabel(p.min, p.max);
  if (harga) chips.push({ key: 'harga', label: harga, next: { ...p, min: null, max: null } });
  if (p.tersedia) chips.push({ key: 'tersedia', label: T.chipTersedia, next: { ...p, tersedia: false } });
  if (p.unggulan) chips.push({ key: 'unggulan', label: T.chipUnggulan, next: { ...p, unggulan: false } });
  return chips;
}
