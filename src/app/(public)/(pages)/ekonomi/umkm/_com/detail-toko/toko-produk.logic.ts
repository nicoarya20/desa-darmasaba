import { isUrutHarga, sortProduk } from '../katalog/katalog-filter.logic';
import type { KatalogUrut } from '../katalog/katalog-filter.meta';
import type { KatalogProduk } from '../katalog/katalog.types';

/** Urutan bawaan daftar produk toko (sama dengan bawaan tab Produk di katalog). */
export const TOKO_URUT_DEFAULT: KatalogUrut = 'terbaru';

/** Kontrol Urutkan baru berguna mulai 2 produk. */
export const TOKO_URUT_MIN_PRODUK = 2;

/** `urut` = urutan yang benar-benar dipakai; `denganHarga` false (harga disembunyikan) → tanpa urutan harga. */
export type TokoProdukView = { items: KatalogProduk[]; showUrut: boolean; urut: KatalogUrut; denganHarga: boolean };

/** Susun daftar produk toko: urutkan dengan logika katalog dan tentukan apakah kontrol Urutkan tampil. */
export function buildTokoProdukView(produk: readonly KatalogProduk[], urut: KatalogUrut): TokoProdukView {
  const denganHarga = produk.some((p) => p.harga !== null);
  const dipakai = !denganHarga && isUrutHarga(urut) ? TOKO_URUT_DEFAULT : urut;
  return { items: sortProduk(produk, dipakai), showUrut: produk.length >= TOKO_URUT_MIN_PRODUK, urut: dipakai, denganHarga };
}
