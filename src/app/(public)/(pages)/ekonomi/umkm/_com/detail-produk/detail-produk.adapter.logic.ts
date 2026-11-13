import { sanitizeRichText } from '@/lib/rich-text';
import type { KatalogRef } from '../katalog/katalog.types';
import type { DetailLinkToko, DetailProduk } from './detail-produk.types';

type ApiRef = { id: string; nama: string } | null | undefined;

/** Kolom `GET /api/ekonomi/umkm/produk/:id` yang dibaca halaman detail (`rating` & `penjualan` sengaja diabaikan). */
export type ProdukDetailApiItem = {
  id: string;
  nama: string;
  harga: number;
  satuan?: string | null;
  deskripsi?: string | null;
  stok: number;
  isUnggulan?: boolean | null;
  isActive?: boolean | null;
  deletedAt?: string | null;
  alamatUsaha?: string | null;
  image?: { link?: string | null } | null;
  umkm?: {
    id: string;
    nama: string;
    pemilik?: string | null;
    alamat?: string | null;
    kontak?: string | null;
    isActive?: boolean | null;
  } | null;
  kategoriProduk?: ApiRef;
  linkTokoOnline?: DetailLinkToko[] | null;
};

export type DetailBody = { success?: boolean; message?: string; data?: ProdukDetailApiItem | null } | null | undefined;

const NOT_FOUND_MESSAGE = /tidak ditemukan/i;

/**
 * Baca respons detail: produk, `null` bila tidak ditemukan (handler membalas HTTP 200 + `success:false` +
 * pesan "tidak ditemukan"), selain itu Error berkonteks (galat server / respons tidak valid).
 */
export function readDetailBody(id: string, status: number, body: DetailBody): ProdukDetailApiItem | null {
  if (status !== 200) throw new Error(`detail produk UMKM ${id} gagal (HTTP ${status}): ${body?.message ?? 'tanpa pesan'}`);
  if (body?.success === true && body.data) return body.data;
  if (body?.success === false && NOT_FOUND_MESSAGE.test(body.message ?? '')) return null;
  throw new Error(`detail produk UMKM ${id} gagal: ${body?.message ?? 'respons tidak valid'}`);
}

/**
 * Produk yang boleh tampil di halaman publik.
 * MITIGASI SEMENTARA(umkm-detail): endpoint detail mengirim produk terhapus/nonaktif dan milik UMKM nonaktif
 * (docs/BACKEND-TODO.md P2 "Detail produk UMKM publik"); hapus setelah endpoint memfilter sendiri.
 */
export function isDetailTampil(item: Pick<ProdukDetailApiItem, 'deletedAt' | 'isActive' | 'umkm'>): boolean {
  return item.deletedAt == null && item.isActive !== false && item.umkm?.isActive !== false;
}

/** Teks dipangkas; kosong/spasi → null. */
const clean = (s: string | null | undefined): string | null => {
  const t = (s ?? '').trim();
  return t === '' ? null : t;
};

const toRef = (ref: ApiRef): KatalogRef | null => (ref ? { id: ref.id, nama: ref.nama } : null);

/** Produk API → bentuk halaman detail. `sanitize` bisa diganti di test (DOMPurify butuh DOM). */
export function toDetailProduk(item: ProdukDetailApiItem, sanitize: (html: string) => string = sanitizeRichText): DetailProduk {
  const foto = clean(item.image?.link);
  const umkm = item.umkm;
  return {
    id: item.id,
    nama: item.nama,
    harga: item.harga,
    satuan: clean(item.satuan),
    isUnggulan: item.isUnggulan === true,
    deskripsiHtml: item.deskripsi ? sanitize(item.deskripsi) : '',
    fotos: foto ? [{ src: foto, alt: item.nama }] : [],
    kategori: toRef(item.kategoriProduk),
    penjual: umkm
      ? { id: umkm.id, nama: umkm.nama, pemilik: clean(umkm.pemilik), alamat: clean(umkm.alamat), kontak: clean(umkm.kontak) }
      : null,
    alamat: clean(item.alamatUsaha) ?? clean(umkm?.alamat),
    linkTokoOnline: item.linkTokoOnline ?? [],
    stok: item.stok,
  };
}
