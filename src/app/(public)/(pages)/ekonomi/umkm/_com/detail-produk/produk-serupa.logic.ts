import { normalizeSearch } from '../katalog/katalog-filter.logic';
import type { KatalogProduk } from '../katalog/katalog.types';

/** Batas kartu di rel Produk serupa. */
export const PRODUK_SERUPA_MAX = 12;

/** Produk yang sedang dibuka, acuan pencarian produk serupa. */
export type ProdukSerupaAcuan = { id: string; kategoriNama: string | null; umkmId: string | null };

/**
 * Produk serupa: kategori sama dulu, lalu produk lain dari UMKM yang sama, tanpa produk ini dan tanpa duplikat.
 * Kategori dibandingkan lewat nama ternormalisasi (DB punya kategori "Makanan" ganda dengan id berbeda).
 * Urutan dalam kelompok mengikuti urutan sumber; hasil dipotong ke `max`.
 */
export function pickProdukSerupa(
  all: readonly KatalogProduk[],
  current: ProdukSerupaAcuan,
  max: number = PRODUK_SERUPA_MAX,
): KatalogProduk[] {
  const kategori = normalizeSearch(current.kategoriNama);
  const lain = all.filter((produk) => produk.id !== current.id);
  const sekategori = kategori ? lain.filter((produk) => normalizeSearch(produk.kategori?.nama) === kategori) : [];
  const dipilih = new Set(sekategori.map((produk) => produk.id));
  const setoko = current.umkmId
    ? lain.filter((produk) => produk.umkm?.id === current.umkmId && !dipilih.has(produk.id))
    : [];
  return [...sekategori, ...setoko].slice(0, Math.max(0, max));
}
