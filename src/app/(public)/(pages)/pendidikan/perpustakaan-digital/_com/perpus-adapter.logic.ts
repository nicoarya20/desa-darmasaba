import { htmlToPlainText, sanitizeRichText } from '@/lib/rich-text';
import type { Buku } from './perpus.types';
import { kategoriSlug } from './perpus-katalog.logic';

/** Bentuk satu buku dari API `dataperpustakaan` (findMany & :id, include kategori + image). */
export type BukuApiItem = {
  id: string;
  judul?: string | null;
  deskripsi?: string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  kategori?: { id: string; name?: string | null } | null;
  image?: { link?: string | null } | null;
};

/** Bentuk respons detail `GET /api/pendidikan/perpustakaandigital/dataperpustakaan/:id`. */
export type BukuDetailBody = { success?: boolean; message?: string; data?: BukuApiItem | null } | null | undefined;

const NOT_FOUND_MESSAGE = /not found|tidak ditemukan/i;

/** API → bentuk publik: deskripsi disanitasi + versi teks polos, kategori bernama kosong dianggap tidak ada. */
export function toBuku(item: BukuApiItem): Buku {
  const namaKategori = item.kategori?.name?.trim();
  const dibuat = Date.parse(item.createdAt ?? '');
  return {
    id: item.id,
    judul: item.judul?.trim() || 'Tanpa judul',
    deskripsiHtml: sanitizeRichText(item.deskripsi),
    ringkasan: htmlToPlainText(item.deskripsi),
    kategori:
      item.kategori && namaKategori
        ? { id: item.kategori.id, nama: namaKategori, slug: kategoriSlug(namaKategori) }
        : null,
    sampul: item.image?.link?.trim() || null,
    dibuat: Number.isFinite(dibuat) ? dibuat : 0,
  };
}

/**
 * Baca respons detail: data, `null` bila tidak ditemukan atau nonaktif, selain itu Error berkonteks id.
 * Handler membalas HTTP 200 + `success:false` + "Data not found" untuk id yang tidak ada, dan tetap mengirim buku
 * nonaktif. MITIGASI SEMENTARA(perpus-detail): buku `isActive:false` dianggap tidak ditemukan di klien sampai
 * endpoint memfilter `isActive` (docs/BACKEND-TODO.md P2). `deletedAt` tidak dipakai: schema mengisinya saat dibuat.
 */
export function readBukuDetail(id: string, status: number, body: BukuDetailBody): BukuApiItem | null {
  if (status !== 200) throw new Error(`Detail buku ${id} gagal (HTTP ${status}): ${body?.message ?? 'tanpa pesan'}`);
  if (body?.success === true && body.data) return body.data.isActive === false ? null : body.data;
  if (body?.success === false && NOT_FOUND_MESSAGE.test(body.message ?? '')) return null;
  throw new Error(`Detail buku ${id} gagal: ${body?.message ?? 'respons tidak valid'}`);
}
