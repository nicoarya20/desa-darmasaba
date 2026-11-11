/**
 * Utilitas nomor telepon peminjaman perpustakaan.
 *
 * Konvensi: nomor disimpan dalam format internasional `+62<digit>` di mana
 * prefix `+62` menggantikan angka `0` di depan nomor lokal Indonesia.
 * Contoh: lokal `08123456` → tersimpan `+628123456`.
 *
 * Batas: nomor lokal 10–13 digit (termasuk `0` depan) → digit setelah `+62`
 * berkisar 9–12.
 */
export const PHONE_PREFIX = '+62';
export const MIN_DIGITS = 9; // = 10 digit lokal (termasuk 0 depan)
export const MAX_DIGITS = 12; // = 13 digit lokal (termasuk 0 depan)

/**
 * Bersihkan input mentah menjadi digit-only tanpa `0` depan, dibatasi MAX_DIGITS.
 * `0` depan dibuang karena sudah diwakili prefix `+62`.
 */
export function sanitizePhoneDigits(raw: string): string {
  const digitsOnly = (raw || '').replace(/\D/g, '');
  const withoutLeadingZero = digitsOnly.replace(/^0+/, '');
  return withoutLeadingZero.slice(0, MAX_DIGITS);
}

/** Ambil bagian digit (tanpa prefix) dari nilai tersimpan `+62...`. */
export function toPhoneDigits(stored: string): string {
  if (!stored) return '';
  return sanitizePhoneDigits(stored.startsWith(PHONE_PREFIX)
    ? stored.slice(PHONE_PREFIX.length)
    : stored);
}

/** Gabungkan digit jadi nilai simpan `+62<digit>`. String kosong jika digit kosong. */
export function toStoredPhone(digits: string): string {
  const clean = sanitizePhoneDigits(digits);
  return clean ? `${PHONE_PREFIX}${clean}` : '';
}

/** Valid bila jumlah digit (tanpa prefix) berada dalam rentang MIN..MAX. */
export function isValidPhoneDigits(digits: string): boolean {
  const len = sanitizePhoneDigits(digits).length;
  return len >= MIN_DIGITS && len <= MAX_DIGITS;
}
