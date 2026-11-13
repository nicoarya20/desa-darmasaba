import { sanitizeRichText } from '@/lib/rich-text';
import { toKatalogProduk, type ProdukApiItem } from '../katalog/katalog-adapter.logic';
import type { DetailToko } from './detail-toko.types';

/** Produk di `include.produk` endpoint detail UMKM: tanpa relasi `umkm` & `kategoriProduk` (hanya `kategoriProdukId`). */
export type TokoProdukApiItem = Omit<ProdukApiItem, 'umkm' | 'kategoriProduk'> & {
  isActive?: boolean | null;
  deletedAt?: string | null;
};

/** Kolom `GET /api/ekonomi/umkm/:id` yang dibaca halaman detail toko. */
export type TokoDetailApiItem = {
  id: string;
  nama: string;
  pemilik?: string | null;
  /** HTML dari editor admin (CreateEditor) → wajib `sanitizeRichText`. */
  deskripsi?: string | null;
  alamat?: string | null;
  kontak?: string | null;
  isActive?: boolean | null;
  deletedAt?: string | null;
  image?: { link?: string | null } | null;
  kategori?: { id: string; nama: string } | null;
  produk?: TokoProdukApiItem[] | null;
};

export type TokoBody = { success?: boolean; message?: string; data?: TokoDetailApiItem | null } | null | undefined;

const NOT_FOUND_MESSAGE = /tidak ditemukan/i;

/**
 * Baca respons detail UMKM: data, `null` bila tidak ditemukan (handler membalas HTTP 200 + `success:false` +
 * "UMKM tidak ditemukan"), selain itu Error berkonteks (galat server / respons tidak valid).
 */
export function readTokoBody(id: string, status: number, body: TokoBody): TokoDetailApiItem | null {
  if (status !== 200) throw new Error(`detail UMKM ${id} gagal (HTTP ${status}): ${body?.message ?? 'tanpa pesan'}`);
  if (body?.success === true && body.data) return body.data;
  if (body?.success === false && NOT_FOUND_MESSAGE.test(body.message ?? '')) return null;
  throw new Error(`detail UMKM ${id} gagal: ${body?.message ?? 'respons tidak valid'}`);
}

/**
 * UMKM yang boleh tampil di halaman publik; selain itu halaman menampilkan "Toko tidak ditemukan".
 * MITIGASI SEMENTARA(umkm-detail-toko): endpoint detail mengirim UMKM nonaktif/terhapus (docs/BACKEND-TODO.md P2);
 * hapus setelah endpoint memfilter sendiri.
 */
export function isTokoTampil(item: Pick<TokoDetailApiItem, 'deletedAt' | 'isActive'>): boolean {
  return item.deletedAt == null && item.isActive !== false;
}

/**
 * Produk toko yang boleh tampil. MITIGASI SEMENTARA(umkm-detail-toko): `include.produk` hanya menyaring
 * `deletedAt`, produk `isActive:false` ikut terkirim (docs/BACKEND-TODO.md P2).
 */
export function isProdukTokoTampil(item: Pick<TokoProdukApiItem, 'deletedAt' | 'isActive'>): boolean {
  return item.deletedAt == null && item.isActive !== false;
}

/** Teks dipangkas; kosong/spasi → null. */
const clean = (s: string | null | undefined): string | null => {
  const t = (s ?? '').trim();
  return t === '' ? null : t;
};

/** UMKM API → bentuk halaman detail toko. `sanitize` bisa diganti di test (DOMPurify butuh DOM). */
export function toDetailToko(item: TokoDetailApiItem, sanitize: (html: string) => string = sanitizeRichText): DetailToko {
  const umkm = { id: item.id, nama: item.nama };
  return {
    id: item.id,
    nama: item.nama,
    pemilik: clean(item.pemilik),
    alamat: clean(item.alamat),
    kontak: clean(item.kontak),
    deskripsiHtml: item.deskripsi ? sanitize(item.deskripsi) : '',
    fotoUrl: clean(item.image?.link),
    kategori: item.kategori ? { id: item.kategori.id, nama: item.kategori.nama } : null,
    produk: (item.produk ?? [])
      .filter(isProdukTokoTampil)
      .map((p) => toKatalogProduk({ ...p, umkm, kategoriProduk: null })),
  };
}
