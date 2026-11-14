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

export type RelArah = 1 | -1;

/**
 * Panah rel disembunyikan di ujung; bila panah yang baru diklik (`diklik`) ikut hilang, fokus pindah ke panah sisi
 * lain supaya tidak jatuh ke body. null = fokus tidak perlu dipindah (panah masih ada, atau sisi lain juga hilang).
 */
export function panahPenggantiFokus(diklik: RelArah | null, canPrev: boolean, canNext: boolean): 'prev' | 'next' | null {
  if (diklik === 1 && !canNext) return canPrev ? 'prev' : null;
  if (diklik === -1 && !canPrev) return canNext ? 'next' : null;
  return null;
}
