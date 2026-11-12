// Logika murni (tanpa I/O) untuk normalisasi field opsional struktur organisasi.
// Dipakai API Struktur Perangkat Desa; disiapkan untuk PPID/BumDes di fase 2.

/** Hasil normalisasi: nilai siap simpan, atau pesan error untuk respons 400. */
export type NormalizeResult<T> = { ok: true; value: T } | { ok: false; message: string };

// Cukup ketat untuk menolak salah ketik umum tanpa menolak alamat yang sah.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Ubah string kosong/spasi, null, atau undefined menjadi null; selain itu kembalikan hasil trim. */
export function toNullableText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** Normalisasi teks opsional dan tolak bila melebihi `max` karakter. */
export function parseOptionalText(
  value: string | null | undefined,
  { max, label }: { max: number; label: string }
): NormalizeResult<string | null> {
  const text = toNullableText(value);
  if (text !== null && text.length > max) {
    return { ok: false, message: `${label} maksimal ${max} karakter` };
  }
  return { ok: true, value: text };
}

/** Validasi email hanya bila diisi; kosong menjadi null. */
export function parseOptionalEmail(
  value: string | null | undefined,
  max = 255
): NormalizeResult<string | null> {
  const text = parseOptionalText(value, { max, label: "Email" });
  if (!text.ok || text.value === null) return text;
  if (!EMAIL_PATTERN.test(text.value)) return { ok: false, message: "Format email tidak valid" };
  return text;
}

/** Parse tanggal `YYYY-MM-DD` (harus tanggal kalender nyata) menjadi Date UTC tengah malam; kosong menjadi null. */
export function parseOptionalDate(value: string | null | undefined): NormalizeResult<Date | null> {
  const text = toNullableText(value);
  if (text === null) return { ok: true, value: null };

  const match = DATE_ONLY_PATTERN.exec(text);
  if (!match) return { ok: false, message: "Tanggal harus berformat YYYY-MM-DD" };

  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  const sameDay =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!sameDay) return { ok: false, message: "Tanggal tidak valid" };
  return { ok: true, value: date };
}

/** Format Date/ISO string menjadi `YYYY-MM-DD` (UTC) untuk form; kosong/invalid menjadi "". */
export function formatDateOnly(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/** Parse query boolean "true"/"false"; nilai lain (termasuk kosong) berarti tanpa filter (undefined). */
export function parseOptionalBoolean(value: unknown): boolean | undefined {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
}
