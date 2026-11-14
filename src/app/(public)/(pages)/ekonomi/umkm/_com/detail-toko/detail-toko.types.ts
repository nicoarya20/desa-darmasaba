import type { KatalogProduk, KatalogRef } from '../katalog/katalog.types';

/** Kontrak data halaman detail toko UMKM publik: bentuk yang dibaca komponen, dihasilkan adapter. */
export type DetailToko = {
  id: string;
  nama: string;
  pemilik: string | null;
  alamat: string | null;
  kontak: string | null;
  /** Sudah lewat `sanitizeRichText` (src/lib/rich-text.ts); '' bila kosong. */
  deskripsiHtml: string;
  fotoUrl: string | null;
  kategori: KatalogRef | null;
  /**
   * Hanya produk yang boleh tampil (`isActive !== false`, `deletedAt` null). `umkm` = {id, nama} toko ini;
   * `kategori` null karena endpoint detail UMKM tidak mengirim relasi kategori produk.
   */
  produk: KatalogProduk[];
};

export type DetailTokoState =
  | { status: 'loading' }
  | { status: 'ready'; data: DetailToko }
  | { status: 'notFound' }
  | { status: 'error' };
