/**
 * Logika murni halaman Kontak Darurat Kesehatan: deskripsi HTML → teks dan penyaring cari di klien.
 * Logika nomor (tel:/wa.me/format) ada di modul bersama `_com/kontak-darurat/kontak-phone.logic.ts`.
 */
import { phoneDigits } from '@/app/(public)/_com/kontak-darurat/kontak-phone.logic';

/** Satu kontak darurat dari `kesehatan/kontakdarurat`; field `whatsapp` berisi nomor apa pun (juga telepon tetap). */
export type KontakDarurat = {
  id: string;
  name: string;
  deskripsi?: string | null;
  whatsapp?: string | null;
  isActive?: boolean;
  image?: { link?: string | null } | null;
};

/**
 * lineClamp (`display: -webkit-box`) gagal di WebKit bila isinya mengandung tag blok (<p>, <div>, <ul>):
 * teks tampil penuh dan tinggi baris meledak, hanya di Safari. Deskripsi HTML diratakan jadi teks dulu.
 * Regex dipakai (bukan DOMParser) supaya tetap aman saat SSR.
 */
export function toPlainText(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();

/** Saring kontak berdasar nama, deskripsi, atau digit nomor; huruf besar/kecil & spasi ganda diabaikan. */
export function filterKontak<T extends KontakDarurat>(items: readonly T[], query: string): T[] {
  const q = normalize(query);
  if (!q) return [...items];
  const qDigits = phoneDigits(q);
  return items.filter((item) => {
    const text = normalize(`${item.name} ${toPlainText(item.deskripsi)}`);
    if (text.includes(q)) return true;
    return qDigits.length >= 3 && q.replace(/[\s()+-]/g, '') === qDigits && phoneDigits(item.whatsapp).includes(qDigits);
  });
}
