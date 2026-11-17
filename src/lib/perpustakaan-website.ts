// Aturan pengaturan halaman penghubung Perpustakaan Digital (`PerpustakaanConfig`) — murni, tanpa I/O.
// Dipakai bersama oleh form admin (klien) dan endpoint PUT (server) supaya batasnya tunggal.
// Keputusan: docs/decisions/2026-11-17-perpustakaan-link-eksternal.md.
import { z } from 'zod';

export const NAMA_PLATFORM_MIN = 3;
export const NAMA_PLATFORM_MAX = 100;
export const DESKRIPSI_MIN = 10;
export const DESKRIPSI_MAX = 1000;
export const WEBSITE_URL_MAX = 300;

/** Bentuk pengaturan yang dikirim ke halaman publik. */
export type PerpustakaanWebsite = {
  namaPlatform: string;
  deskripsi: string;
  websiteUrl: string;
};

/** URL wajib https, punya host, dan tanpa kredensial (`user:pass@`) supaya tautan publik aman. */
function isSafeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.length > 0 && !url.username && !url.password;
  } catch {
    // URL tak bisa diurai = bukan URL valid; galat sengaja dipetakan ke pesan zod di pemanggil.
    return false;
  }
}

/** Skema isian admin; string di-trim sebelum dicek. */
export const perpustakaanWebsiteSchema = z.object({
  namaPlatform: z
    .string()
    .trim()
    .min(NAMA_PLATFORM_MIN, `Nama platform minimal ${NAMA_PLATFORM_MIN} karakter`)
    .max(NAMA_PLATFORM_MAX, `Nama platform maksimal ${NAMA_PLATFORM_MAX} karakter`),
  deskripsi: z
    .string()
    .trim()
    .min(DESKRIPSI_MIN, `Deskripsi minimal ${DESKRIPSI_MIN} karakter`)
    .max(DESKRIPSI_MAX, `Deskripsi maksimal ${DESKRIPSI_MAX} karakter`),
  websiteUrl: z
    .string()
    .trim()
    .max(WEBSITE_URL_MAX, `Alamat website maksimal ${WEBSITE_URL_MAX} karakter`)
    .refine(isSafeHttpsUrl, 'Alamat website harus diawali https:// dan berupa alamat yang valid'),
});

/** Ambil bidang publik dari baris DB; `null` bila belum ada baris aktif. */
export function toPerpustakaanWebsite(
  row: { namaPlatform: string; deskripsi: string; websiteUrl: string } | null,
): PerpustakaanWebsite | null {
  if (!row) return null;
  return { namaPlatform: row.namaPlatform, deskripsi: row.deskripsi, websiteUrl: row.websiteUrl };
}
