import { z } from "zod";

/** Batas panjang URL tautan konten bersama (media sosial, Google Maps). */
export const MAX_PANJANG_URL = 500;

/** True bila `value` URL absolut ber-skema http/https dengan host (skema lain seperti `javascript:` ditolak). */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.length > 0;
  } catch {
    // `new URL` melempar untuk teks yang bukan URL absolut — itu memang jawaban "bukan URL".
    return false;
  }
}

/** Skema URL wajib http/https (spasi di tepi dibuang). */
export const urlHttpSchema = z
  .string({ required_error: "URL wajib diisi", invalid_type_error: "URL harus berupa teks" })
  .trim()
  .min(1, "URL wajib diisi")
  .max(MAX_PANJANG_URL, `URL maksimal ${MAX_PANJANG_URL} karakter`)
  .refine(isHttpUrl, "URL harus diawali http:// atau https://");
