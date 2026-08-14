import { isValidPhoneDigits, toPhoneDigits } from './notelp';

export type PeminjamanFormValues = {
  nama: string;
  noTelp: string;
  alamat: string;
  tanggalPinjam: string;
  catatan?: string;
};

/**
 * Validasi form peminjaman buku. Catatan bersifat opsional dan tidak
 * memblokir submit.
 */
export function isPeminjamanFormValid(form: PeminjamanFormValues) {
  const phoneDigits = toPhoneDigits(form.noTelp);
  return (
    form.nama?.trim() !== '' &&
    isValidPhoneDigits(phoneDigits) &&
    form.alamat?.trim() !== '' &&
    form.tanggalPinjam?.trim() !== ''
  );
}
