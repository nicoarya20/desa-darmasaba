// Teks tampilan judul program publik Desa Anti Korupsi: nomor indikator dipisah, teks kapital
// jadi sentence case (aturan sama dengan section beranda), dan deteksi deskripsi yang hanya mengulang judul.
import {
  splitIndicatorNumber,
  toSentenceCase,
} from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.logic';

/** Judul program siap tampil: `nomor` ("1.1" / null), `judul` sentence case, `lengkap` = nomor + judul. */
export type JudulProgram = { nomor: string | null; judul: string; lengkap: string };

/** Pecah nama program ("1.1 ADANYA ...") menjadi nomor + judul sentence case. Data asli tidak diubah. */
export function judulProgram(name: string): JudulProgram {
  const { number, text } = splitIndicatorNumber(name);
  const judul = toSentenceCase(text);
  return { nomor: number, judul, lengkap: number ? `${number} ${judul}` : judul };
}

/** Isi teks HTML tanpa tag & entitas, spasi dirapikan. */
export function teksPolos(html: string | null | undefined): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Bentuk pembanding: tanpa nomor indikator, huruf kecil, hanya huruf/angka dipisah satu spasi. */
function kunciBanding(text: string): string {
  return splitIndicatorNumber(text)
    .text.toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** True bila deskripsi (setelah strip HTML & normalisasi spasi/kapital/nomor) sama dengan nama program. */
export function isDeskripsiDuplikat(deskripsi: string | null | undefined, name: string): boolean {
  const isi = kunciBanding(teksPolos(deskripsi));
  return isi !== '' && isi === kunciBanding(name);
}
