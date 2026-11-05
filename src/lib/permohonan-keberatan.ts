// Aturan field "alasan keberatan" pada Permohonan Keberatan Informasi Publik —
// fungsi & konstanta murni (tanpa I/O), dipakai bersama oleh form publik (klien)
// dan endpoint create (server) supaya batasnya tunggal.
import { richTextLength } from "@/app/darmasaba/(pages)/pendidikan/perpustakaan-digital/_lib/peminjamanForm";

export { richTextLength };

/** Batas panjang teks murni alasan keberatan (tag HTML editor tidak dihitung). */
export const ALASAN_KEBERATAN_MAX_LENGTH = 2000;

/** Batas panjang HTML mentah; mencegah markup berlebihan menembus batas teks murni. */
export const ALASAN_KEBERATAN_MAX_HTML_LENGTH = 20000;

/** Pesan error batas alasan keberatan, dipakai klien (zod/UI) dan server. */
export const ALASAN_KEBERATAN_TOO_LONG_MESSAGE = `Alasan keberatan maksimal ${ALASAN_KEBERATAN_MAX_LENGTH} karakter`;

/** Pesan error saat HTML alasan keberatan melebihi batas mentah. */
export const ALASAN_KEBERATAN_HTML_TOO_LONG_MESSAGE =
  "Format alasan keberatan terlalu panjang, sederhanakan isi atau formatnya";

/** Mengembalikan pesan error jika alasan melebihi batas, atau null bila valid. */
export function validateAlasanKeberatanLength(alasan: string): string | null {
  if (richTextLength(alasan) > ALASAN_KEBERATAN_MAX_LENGTH) {
    return ALASAN_KEBERATAN_TOO_LONG_MESSAGE;
  }
  if (alasan.length > ALASAN_KEBERATAN_MAX_HTML_LENGTH) {
    return ALASAN_KEBERATAN_HTML_TOO_LONG_MESSAGE;
  }
  return null;
}
