import { SEMUA_SLUG } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import type { KabarListTab } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import {
  KATEGORI_PRODUK_HUKUM,
  KATEGORI_PRODUK_HUKUM_LABEL,
  PRODUK_HUKUM_PUBLIC_PATH,
  isKategoriProdukHukum,
  labelKategoriProdukHukum,
  type KategoriProdukHukum,
} from '@/lib/produk-hukum';
import { PRODUK_HUKUM_TEXT as T } from './produk-hukum.text';

/** Id wadah tabel daftar: tujuan gulir setelah ganti halaman `?page=`. */
export const PRODUK_HUKUM_LIST_ID = 'produk-hukum-list';

/** Filter daftar publik: kategori ('' = semua), kata kunci, dan nomor halaman. */
export type ProdukHukumFilter = { kategori: KategoriProdukHukum | ''; search: string; page: number };

/** Kategori dari query `?kategori=`; nilai selain kategori sah (tautan lama, diketik manual) → '' (semua). */
export function parseKategoriParam(raw: string | null | undefined): KategoriProdukHukum | '' {
  return isKategoriProdukHukum(raw) ? raw : '';
}

/** Tautan daftar dengan filter; nilai bawaan (semua kategori, tanpa kata kunci, halaman 1) tidak ditulis. */
export function produkHukumHref({ kategori, search, page }: Partial<ProdukHukumFilter> = {}): string {
  const params = new URLSearchParams();
  if (kategori) params.set('kategori', kategori);
  const keyword = search?.trim();
  if (keyword) params.set('search', keyword);
  if (page && page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `${PRODUK_HUKUM_PUBLIC_PATH}?${query}` : PRODUK_HUKUM_PUBLIC_PATH;
}

/** Pil kategori untuk `KabarListHeader`: "Semua" lalu tiap kategori; kata kunci ikut terbawa, halaman kembali ke 1. */
export function produkHukumTabs(active: KategoriProdukHukum | '', search: string): KabarListTab[] {
  return [
    { key: SEMUA_SLUG, href: produkHukumHref({ search }), label: T.semua, active: active === '' },
    ...KATEGORI_PRODUK_HUKUM.map((kategori) => ({
      key: kategori,
      href: produkHukumHref({ kategori, search }),
      label: KATEGORI_PRODUK_HUKUM_LABEL[kategori],
      active: active === kategori,
    })),
  ];
}

/** Nomor urut baris pada halaman `page` (1-based) dengan `limit` baris per halaman. */
export function rowNumber(page: number, limit: number, index: number): number {
  return (page - 1) * limit + index + 1;
}

/** Tahun untuk sel tabel; belum diisi → tanda "-". */
export function formatTahun(tahun: number | null): string {
  return tahun === null ? T.tahunKosong : String(tahun);
}

/** Pesan daftar kosong menurut filter aktif: kata kunci > kategori > tanpa filter. */
export function produkHukumEmptyMessage(filter: Pick<ProdukHukumFilter, 'kategori' | 'search'>): string {
  if (filter.search) return T.emptySearch(filter.search);
  if (filter.kategori) return T.emptyKategori(labelKategoriProdukHukum(filter.kategori));
  return T.empty;
}
