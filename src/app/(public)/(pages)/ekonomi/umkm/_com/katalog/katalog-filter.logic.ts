import { formatHarga } from './katalog-card.logic';
import { PRODUK_URUT, TOKO_URUT, type KatalogTab, type KatalogUrut } from './katalog-filter.meta';
import { KATALOG_FILTER_TEXT as T } from './katalog-filter.text';
import type { KatalogParams } from './katalog-params.logic';
import type { KatalogProduk, KatalogRef, KatalogToko } from './katalog.types';

/** Satu pilihan kotak centang di panel saring beserta jumlah entri dari data yang dimuat. */
export type FacetOption = { id: string; label: string; count: number };

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

/** Pilihan unik dari relasi bernama, dengan jumlahnya, urut nama; relasi kosong tidak dihitung. */
function facetOf<T>(items: readonly T[], pick: (item: T) => KatalogRef | null): FacetOption[] {
  const map = new Map<string, FacetOption>();
  for (const item of items) {
    const ref = pick(item);
    if (!ref) continue;
    const option = map.get(ref.id) ?? { id: ref.id, label: ref.nama, count: 0 };
    option.count += 1;
    map.set(ref.id, option);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'id', { sensitivity: 'base' }));
}

/** Pilihan & jumlah panel saring tab Produk, dari seluruh produk yang dimuat (bukan hasil saring). */
export function produkFacets(items: readonly KatalogProduk[]): ProdukFacets {
  return {
    kategori: facetOf(items, (p) => p.kategori),
    toko: facetOf(items, (p) => p.umkm),
    tersedia: items.filter((p) => p.stok > 0).length,
    unggulan: items.filter((p) => p.isUnggulan).length,
  };
}

/** Pilihan & jumlah panel saring tab Toko. */
export function tokoFacets(items: readonly KatalogToko[]): TokoFacets {
  return { kategori: facetOf(items, (t) => t.kategori) };
}

const knownOnly = (ids: readonly string[], options: readonly FacetOption[]) =>
  ids.filter((id) => options.some((option) => option.id === id));

/** Buang id kategori/toko di URL yang tidak ada di data (nilai tak dikenal diabaikan). */
export function resolveParams(params: KatalogParams, facets: ProdukFacets | TokoFacets): KatalogParams {
  const toko = 'toko' in facets ? knownOnly(params.toko, facets.toko) : [];
  return { ...params, kategori: knownOnly(params.kategori, facets.kategori), toko };
}

/** Produk yang lolos kata kunci & saringan (params sudah di-resolve). */
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

/** Toko yang lolos kata kunci (nama, pemilik, alamat) & kategori usaha. */
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
