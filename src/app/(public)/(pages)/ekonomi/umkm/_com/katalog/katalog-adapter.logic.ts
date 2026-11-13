import type { KatalogProduk, KatalogRef, KatalogToko } from './katalog.types';

/** Bentuk relasi bernama dari API (kategori, UMKM); kolom lain diabaikan. */
type ApiRef = { id: string; nama: string } | null | undefined;

/** Kolom produk dari `GET /api/ekonomi/umkm/produk/find-many` yang dibaca katalog (`rating` sengaja tidak dibaca). */
export type ProdukApiItem = {
  id: string;
  nama: string;
  harga: number;
  satuan?: string | null;
  stok: number;
  isUnggulan?: boolean | null;
  createdAt: string;
  image?: { link?: string | null } | null;
  /** `include: { umkm }` ikut membawa kolom skalar UMKM, termasuk `isActive`. */
  umkm?: (NonNullable<ApiRef> & { isActive?: boolean | null }) | null;
  kategoriProduk?: ApiRef;
};

/** Kolom UMKM dari `GET /api/ekonomi/umkm/find-many` yang dibaca katalog. */
export type TokoApiItem = {
  id: string;
  nama: string;
  pemilik: string;
  alamat?: string | null;
  isActive?: boolean | null;
  createdAt: string;
  image?: { link?: string | null } | null;
  kategori?: ApiRef;
};

const toRef = (ref: ApiRef): KatalogRef | null => (ref ? { id: ref.id, nama: ref.nama } : null);
const toImageUrl = (image: { link?: string | null } | null | undefined) => image?.link || null;

/** Produk API → bentuk kartu katalog. */
export function toKatalogProduk(item: ProdukApiItem): KatalogProduk {
  return {
    id: item.id,
    nama: item.nama,
    harga: item.harga,
    satuan: item.satuan ?? null,
    stok: item.stok,
    isUnggulan: item.isUnggulan === true,
    createdAt: item.createdAt,
    imageUrl: toImageUrl(item.image),
    umkm: toRef(item.umkm),
    kategori: toRef(item.kategoriProduk),
  };
}

/** UMKM API → bentuk kartu toko. */
export function toKatalogToko(item: TokoApiItem): KatalogToko {
  return {
    id: item.id,
    nama: item.nama,
    pemilik: item.pemilik,
    alamat: item.alamat ?? null,
    imageUrl: toImageUrl(item.image),
    kategori: toRef(item.kategori),
    createdAt: item.createdAt,
  };
}

/**
 * UMKM yang boleh tampil di katalog publik: API find-many ikut mengirim UMKM nonaktif
 * (docs/BACKEND-TODO.md P2), jadi `isActive === false` dibuang di klien. Kolom kosong = aktif (bawaan schema).
 */
export function isTokoAktif(item: Pick<TokoApiItem, 'isActive'>): boolean {
  return item.isActive !== false;
}

/** Produk yang boleh tampil: milik UMKM nonaktif disembunyikan (senada tab Toko); produk tanpa relasi UMKM tetap tampil. */
export function isProdukTampil(item: Pick<ProdukApiItem, 'umkm'>): boolean {
  return !item.umkm || isTokoAktif(item.umkm);
}

/** Jumlah produk per id UMKM dari daftar produk yang dimuat (API UMKM tidak mengirim jumlah produk). */
export function countProdukPerToko(produk: readonly KatalogProduk[]): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const item of produk) {
    if (item.umkm) counts.set(item.umkm.id, (counts.get(item.umkm.id) ?? 0) + 1);
  }
  return counts;
}
