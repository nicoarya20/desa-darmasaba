import type { ComponentProps } from 'react';
import type { KatalogRef } from '../katalog/katalog.types';
import type { LinkTokoOnlineButtons } from '../LinkTokoOnlineButtons';

/** Kontrak data halaman detail produk UMKM publik: bentuk yang dibaca komponen, dihasilkan adapter. */
export type DetailFoto = { src: string; alt: string };

export type DetailPenjual = {
  id: string;
  nama: string;
  pemilik: string | null;
  alamat: string | null;
  kontak: string | null;
};

/** Link toko online dalam bentuk yang diterima `LinkTokoOnlineButtons`. */
export type DetailLinkToko = NonNullable<ComponentProps<typeof LinkTokoOnlineButtons>['links']>[number];

export type DetailProduk = {
  id: string;
  nama: string;
  harga: number;
  satuan: string | null;
  isUnggulan: boolean;
  /** Sudah lewat `sanitizeRichText` (src/lib/rich-text.ts); '' bila kosong. */
  deskripsiHtml: string;
  /** Kini 0–1 foto: API hanya mengirim satu `image` (docs/BACKEND-TODO.md: multi-foto). */
  fotos: DetailFoto[];
  kategori: KatalogRef | null;
  /** Dari relasi `umkm`. */
  penjual: DetailPenjual | null;
  /** `alamatUsaha ?? umkm.alamat` (trim, '' → null). */
  alamat: string | null;
  linkTokoOnline: DetailLinkToko[];
  /** HANYA untuk alur pesanan website saat `UMKM_PESANAN_TERCATAT` true; tidak pernah ditampilkan. */
  stok: number;
};

export type DetailProdukState =
  | { status: 'loading' }
  | { status: 'ready'; data: DetailProduk }
  | { status: 'notFound' }
  | { status: 'error' };
