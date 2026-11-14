import { perSatuanSuffix } from '../../_lib/satuan';
import { KATALOG_CARD_TEXT as T } from './katalog-card.text';
import type { KatalogProduk } from './katalog.types';

const RUPIAH = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/** Harga ringkas tanpa spasi gaya katalog, mis. 80000 → "Rp80.000". */
export function formatHarga(harga: number): string {
  return `Rp${RUPIAH.format(harga)}`;
}

/** Harga + akhiran satuan terpisah agar bisa diberi gaya berbeda, mis. { harga: "Rp80.000", satuan: " / ekor" }. */
export function hargaParts(produk: Pick<KatalogProduk, 'harga' | 'satuan'>) {
  return { harga: formatHarga(produk.harga), satuan: perSatuanSuffix(produk.satuan) };
}

/** URL foto yang layak dipakai; kosong/spasi → null (kartu menampilkan ikon pengganti). */
export function fotoSrc(url: string | null): string | null {
  const s = (url ?? '').trim();
  return s === '' ? null : s;
}

/** Alamat toko untuk kartu; kosong → nama desa. */
export function alamatTampil(alamat: string | null): string {
  const s = (alamat ?? '').trim();
  return s === '' ? T.alamatKosong : s;
}

/** Rute detail produk publik. */
export const produkHref = (id: string) => `/ekonomi/umkm/produk/${id}`;

/** Rute detail UMKM (toko) publik. */
export const tokoHref = (id: string) => `/ekonomi/umkm/${id}`;
