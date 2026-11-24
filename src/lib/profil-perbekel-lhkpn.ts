// Aturan tautan laporan LHKPN Perbekel (`ProfilPerbekel.lhkpnUrl`) — murni, tanpa I/O.
// Dipakai bersama form admin (klien), endpoint PUT (server), dan halaman publik supaya batasnya tunggal.
import { z } from 'zod';

/** Batas panjang URL; sama dengan kolom `VarChar(500)` di schema. */
export const LHKPN_URL_MAX = 500;

/** Host Google Drive yang diterima (berkas Drive dan Google Docs/Sheets yang dibagikan dari Drive). */
export const LHKPN_ALLOWED_HOSTS = ['drive.google.com', 'docs.google.com'] as const;

export const PESAN_LHKPN_URL_TIDAK_VALID =
  'Link LHKPN harus berupa link Google Drive yang diawali https:// (drive.google.com atau docs.google.com)';
export const PESAN_LHKPN_URL_TERLALU_PANJANG = `Link LHKPN maksimal ${LHKPN_URL_MAX} karakter`;

/** True bila `value` URL https ke Google Drive, tanpa kredensial `user:pass@` (aman dirender sebagai tautan publik). */
export function isGoogleDriveUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (LHKPN_ALLOWED_HOSTS as readonly string[]).includes(url.hostname.toLowerCase()) &&
      !url.username &&
      !url.password
    );
  } catch {
    // `new URL` melempar untuk teks yang bukan URL absolut; itu memang jawaban "bukan URL Drive".
    return false;
  }
}

/** Isian kosong / spasi saja / null → null (kolom opsional dikosongkan); selain itu di-trim lalu dicek. */
export const lhkpnUrlSchema = z
  .string()
  .nullish()
  .transform((value) => {
    const trimmed = value?.trim() ?? '';
    return trimmed === '' ? null : trimmed;
  })
  .refine((value) => value === null || value.length <= LHKPN_URL_MAX, PESAN_LHKPN_URL_TERLALU_PANJANG)
  .refine((value) => value === null || isGoogleDriveUrl(value), PESAN_LHKPN_URL_TIDAK_VALID);

/** Pesan galat untuk isian form admin, atau null bila valid (termasuk kosong). */
export function lhkpnUrlError(value: string | null | undefined): string | null {
  const result = lhkpnUrlSchema.safeParse(value);
  return result.success ? null : result.error.issues[0]?.message ?? PESAN_LHKPN_URL_TIDAK_VALID;
}

/** URL yang boleh dirender sebagai tautan publik, atau null (kosong / data lama yang tidak valid). */
export function publicLhkpnUrl(value: string | null | undefined): string | null {
  const result = lhkpnUrlSchema.safeParse(value);
  return result.success ? result.data : null;
}
