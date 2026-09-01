/**
 * Helper terstruktur untuk field `jadwalPelayanan` Posyandu.
 *
 * Data disimpan sebagai JSON string di kolom `jadwalPelayanan String` yang sudah
 * ada (tanpa migrasi DB). Data lama yang berupa HTML rich-text tetap didukung
 * lewat jalur "legacy" agar tidak hilang.
 */

export type JadwalHari = 'senin-jumat' | 'sabtu-minggu' | 'libur';

export interface JadwalEntry {
  hari: JadwalHari;
  /** Format "HH:MM" (dari TimeInput). Kosong/absen untuk hari libur. */
  buka?: string;
  tutup?: string;
}

/** Opsi untuk komponen Select "Hari". */
export const JADWAL_HARI_OPTIONS: { value: JadwalHari; label: string }[] = [
  { value: 'senin-jumat', label: 'Senin–Jumat' },
  { value: 'sabtu-minggu', label: 'Sabtu–Minggu' },
  { value: 'libur', label: 'Libur' },
];

export const HARI_LABEL: Record<JadwalHari, string> = {
  'senin-jumat': 'Senin–Jumat',
  'sabtu-minggu': 'Sabtu–Minggu',
  libur: 'Libur',
};

const VALID_HARI = new Set<JadwalHari>(['senin-jumat', 'sabtu-minggu', 'libur']);

/** Entri lengkap = punya hari valid; non-libur wajib punya jam buka & tutup. */
export function isJadwalEntryComplete(entry: JadwalEntry): boolean {
  if (!VALID_HARI.has(entry.hari)) return false;
  if (entry.hari === 'libur') return true;
  return Boolean(entry.buka?.trim() && entry.tutup?.trim());
}

/** Normalisasi satu entri: buang jam untuk libur, trim jam untuk lainnya. */
function cleanEntry(entry: JadwalEntry): JadwalEntry {
  if (entry.hari === 'libur') return { hari: 'libur' };
  return { hari: entry.hari, buka: entry.buka?.trim(), tutup: entry.tutup?.trim() };
}

/**
 * Parse nilai kolom menjadi daftar entri terstruktur.
 * Mengembalikan `[]` untuk string kosong maupun konten legacy (HTML/teks bebas)
 * yang bukan JSON format kita.
 */
export function parseJadwal(value: string | null | undefined): JadwalEntry[] {
  if (!value || !value.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return []; // legacy HTML / teks bebas
  }
  if (!Array.isArray(parsed)) return [];
  const entries: JadwalEntry[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue;
    const hari = (item as JadwalEntry).hari;
    if (!VALID_HARI.has(hari)) continue;
    entries.push(cleanEntry(item as JadwalEntry));
  }
  return entries;
}

/** Serialize entri lengkap menjadi JSON string; kembalikan "" jika tak ada yang lengkap. */
export function stringifyJadwal(entries: JadwalEntry[]): string {
  const complete = entries.filter(isJadwalEntryComplete).map(cleanEntry);
  return complete.length ? JSON.stringify(complete) : '';
}

/** Apakah konten adalah data legacy (ada isi, tapi bukan JSON format kita)? */
export function isLegacyJadwal(value: string | null | undefined): boolean {
  if (!value || !value.trim()) return false;
  return parseJadwal(value).length === 0 && !looksLikeEmptyJson(value);
}

function looksLikeEmptyJson(value: string): boolean {
  const t = value.trim();
  return t === '[]' || t === '{}';
}

/**
 * Kosong untuk keperluan validasi form: tidak ada entri terstruktur DAN
 * bukan konten legacy yang masih berisi.
 */
export function isJadwalEmpty(value: string | null | undefined): boolean {
  if (parseJadwal(value).length > 0) return false;
  return !isLegacyJadwal(value);
}

/** "08:00" -> "08.00" (gaya penulisan jam Indonesia). */
function formatJam(jam?: string): string {
  return (jam ?? '').trim().replace(':', '.');
}

/** Buang tag HTML dari konten legacy menjadi teks polos. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Format satu entri menjadi teks: "Senin–Jumat 08.00–12.00" atau "Libur". */
export function formatJadwalEntry(entry: JadwalEntry): string {
  const label = HARI_LABEL[entry.hari];
  if (entry.hari === 'libur') return label;
  return `${label} ${formatJam(entry.buka)}–${formatJam(entry.tutup)}`;
}

/**
 * Ringkas jadwal menjadi satu baris teks (untuk kartu dengan lineClamp).
 * Legacy: dikembalikan sebagai teks polos hasil strip HTML.
 */
export function jadwalToText(value: string | null | undefined): string {
  const entries = parseJadwal(value);
  if (entries.length) return entries.map(formatJadwalEntry).join(' • ');
  if (isLegacyJadwal(value)) return stripHtml(value as string);
  return '';
}

/** Baris jadwal untuk tampilan multi-baris (label + jam terpisah). */
export interface JadwalLine {
  label: string;
  jam: string | null;
}

export function jadwalToLines(value: string | null | undefined): JadwalLine[] {
  return parseJadwal(value).map((entry) => ({
    label: HARI_LABEL[entry.hari],
    jam: entry.hari === 'libur' ? null : `${formatJam(entry.buka)}–${formatJam(entry.tutup)}`,
  }));
}
