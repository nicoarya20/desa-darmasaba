/** Logika murni halaman detail lowongan: baca respons API, saring yang boleh tampil, dan bentuk data render. */
import { htmlToPlainText, sanitizeRichText } from '@/lib/rich-text';
import { toLowongan, type LowonganApiItem } from '../lowongan-adapter.logic';
import { petaHref, toLowonganKontak } from './lowongan-detail.contact.logic';
import type { LowonganDetail, RichText } from './lowongan-detail.types';

/** Kolom `GET /api/ekonomi/lowongankerja/:id` yang dibaca halaman detail (kolom daftar + kualifikasi & kontak). */
export type LowonganDetailApiItem = LowonganApiItem & {
  /** Teks polos (entri lama) atau HTML editor (entri baru). */
  kualifikasi: string;
  notelp: string;
  isActive?: boolean | null;
  /** Sengaja tidak dibaca: lihat `isLowonganTampil`. */
  deletedAt?: string | null;
};

export type LowonganDetailBody = { success?: boolean; message?: string; data?: LowonganDetailApiItem | null } | null | undefined;

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const NOT_FOUND_MESSAGE = /tidak ditemukan/i;
/** Tanda isian HTML editor (tag pembuka/penutup), mis. "<p>" atau "</li>"; "gaji < 3 juta" tidak cocok. */
const HTML_TAG = /<\/?[a-z][^>]*>/i;

/**
 * Baca respons detail: item bila HTTP 200 + `success:true` + data; `null` bila tidak ditemukan
 * (handler membalas HTTP 404 + "Lowongan kerja tidak ditemukan", beda dari UMKM yang 200); selain itu
 * Error berkonteks id + status (galat server, 404 tanpa pesan tak ditemukan, atau respons tidak valid).
 */
export function readDetailLowongan(id: string, status: number, body: LowonganDetailBody): LowonganDetailApiItem | null {
  if (status === HTTP_NOT_FOUND && body?.success === false && NOT_FOUND_MESSAGE.test(body.message ?? '')) return null;
  if (status === HTTP_OK && body?.success === true && body.data) return body.data;
  throw new Error(`Detail lowongan kerja ${id} gagal (HTTP ${status}): ${body?.message ?? 'respons tidak valid'}`);
}

/**
 * Lowongan boleh tampil bila tidak dinonaktifkan (`isActive` kosong = aktif, bawaan schema).
 * MITIGASI SEMENTARA(lowongan-detail): findUnique API mengabaikan `isActive` (docs/BACKEND-TODO.md P1).
 * `deletedAt` SENGAJA diabaikan, jangan diganti `isDataTampil` (detail UMKM): kolom ini `@default(now())`
 * sehingga selalu terisi (stg: = createdAt), dan hapus admin adalah hard delete. Menyaring `deletedAt == null`
 * akan membuat semua lowongan "tidak ditemukan".
 */
export function isLowonganTampil(item: Pick<LowonganDetailApiItem, 'isActive'>): boolean {
  return item.isActive !== false;
}

/**
 * Teks kaya siap render. Kosong → null. Memuat tag HTML → disanitasi (`sanitizeRichText`); hasil tanpa isi teks
 * (mis. "<p></p>" atau hanya tag berbahaya) → null. Teks polos (entri lama) → paragraf per baris tak kosong.
 */
export function toRichText(raw: string | null | undefined): RichText | null {
  const text = (raw ?? '').trim();
  if (text === '') return null;
  if (HTML_TAG.test(text)) {
    const html = sanitizeRichText(text);
    return html === '' || htmlToPlainText(html) === '' ? null : { kind: 'html', html };
  }
  const paragraphs = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return { kind: 'text', paragraphs };
}

/** Item API → bentuk halaman detail (bentuk daftar + deskripsi/kualifikasi, kontak, tautan peta). */
export function toLowonganDetail(item: LowonganDetailApiItem): LowonganDetail {
  const lowongan = toLowongan(item);
  return {
    ...lowongan,
    deskripsi: toRichText(item.deskripsi),
    kualifikasi: toRichText(item.kualifikasi),
    kontak: toLowonganKontak(item.notelp, lowongan),
    petaHref: petaHref(lowongan.lokasi),
  };
}
