import { isValidPhoneDigits, toPhoneDigits } from './notelp';

export type PeminjamanFormValues = {
  nama: string;
  noTelp: string;
  alamat: string;
  tanggalPinjam: string;
  catatan?: string;
};

// Batas panjang karakter agar data yang dikirim valid & tidak berlebihan.
export const NAMA_MIN = 3;
export const ALAMAT_MIN = 5;
export const ALAMAT_MAX = 200;
export const CATATAN_MAX = 500; // catatan opsional, tetapi dibatasi

/** Panjang teks murni dari konten rich-text (tag HTML dibuang). */
export function richTextLength(html?: string): number {
  return (html || '').replace(/<[^>]*>/g, '').trim().length;
}

/**
 * Validasi form peminjaman buku. Catatan bersifat opsional (boleh kosong)
 * namun bila diisi tidak boleh melebihi CATATAN_MAX. Alamat wajib memenuhi
 * rentang ALAMAT_MIN..ALAMAT_MAX.
 */
export function isPeminjamanFormValid(form: PeminjamanFormValues) {
  const phoneDigits = toPhoneDigits(form.noTelp);
  const alamat = (form.alamat || '').trim();
  return (
    (form.nama || '').trim().length >= NAMA_MIN &&
    isValidPhoneDigits(phoneDigits) &&
    alamat.length >= ALAMAT_MIN &&
    alamat.length <= ALAMAT_MAX &&
    richTextLength(form.catatan) <= CATATAN_MAX &&
    (form.tanggalPinjam || '').trim() !== ''
  );
}
