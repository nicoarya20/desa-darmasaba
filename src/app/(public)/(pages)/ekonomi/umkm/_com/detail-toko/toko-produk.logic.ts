import { sortProduk } from '../katalog/katalog-filter.logic';
import type { KatalogUrut } from '../katalog/katalog-filter.meta';
import type { KatalogProduk } from '../katalog/katalog.types';

/** Urutan bawaan daftar produk toko (sama dengan bawaan tab Produk di katalog). */
export const TOKO_URUT_DEFAULT: KatalogUrut = 'terbaru';

/** Kontrol Urutkan baru berguna mulai 2 produk. */
export const TOKO_URUT_MIN_PRODUK = 2;

export type TokoProdukView = { items: KatalogProduk[]; showUrut: boolean };

/** Susun daftar produk toko: urutkan dengan logika katalog dan tentukan apakah kontrol Urutkan tampil. */
export function buildTokoProdukView(produk: readonly KatalogProduk[], urut: KatalogUrut): TokoProdukView {
  return { items: sortProduk(produk, urut), showUrut: produk.length >= TOKO_URUT_MIN_PRODUK };
}
