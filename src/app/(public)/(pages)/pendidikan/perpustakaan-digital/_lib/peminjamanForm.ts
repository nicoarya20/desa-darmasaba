import { isValidPhoneDigits, MAX_DIGITS, MIN_DIGITS, sanitizePhoneDigits, toStoredPhone } from './notelp';

/** Logika murni formulir peminjaman buku publik: batas isian, validasi, tanggal kalender, dan payload API. */

export const NAMA_MIN = 3;
export const NAMA_MAX = 100;
export const ALAMAT_MIN = 5;
export const ALAMAT_MAX = 200;
export const CATATAN_MAX = 500; // catatan opsional, tetapi dibatasi

/** Lama pinjam (hari) dari tanggal ambil sampai batas kembali. */
export const LAMA_PINJAM_HARI = 4;
/** Tanggal ambil paling jauh N hari dari hari ini. */
export const AMBIL_MAKS_HARI = 14;
/** Zona waktu desa (WITA): "hari ini" dihitung di sini, bukan di zona perangkat pengunjung. */
export const ZONA_DESA = 'Asia/Makassar';

/** Isian formulir. `telp` = digit tanpa 0 depan (prefix +62 di luar); `tanggalAmbil` = "YYYY-MM-DD" atau "". */
export type PeminjamanValues = { nama: string; telp: string; alamat: string; tanggalAmbil: string; catatan: string };
export type PeminjamanField = keyof PeminjamanValues;
export type PeminjamanErrors = Partial<Record<PeminjamanField, string>>;

export const EMPTY_PEMINJAMAN: PeminjamanValues = { nama: '', telp: '', alamat: '', tanggalAmbil: '', catatan: '' };

/** Badan `POST /api/pendidikan/perpustakaandigital/peminjamanbuku/create` (tanpa `tanggalKembali`). */
export type PeminjamanPayload = {
  bukuId: string;
  nama: string;
  noTelp: string;
  alamat: string;
  tanggalPinjam: string;
  batasKembali: string;
  catatan?: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Panjang teks murni dari konten rich-text (tag HTML dibuang). Kontrak lama: dipakai juga oleh
 * src/lib/permohonan-keberatan.ts (batas alasan keberatan PPID), jadi tetap diekspor dari sini.
 */
export function richTextLength(html?: string): number {
  return (html || '').replace(/<[^>]*>/g, '').trim().length;
}

/** Tanggal kalender "YYYY-MM-DD" hari ini di zona desa. */
export function hariIniDesa(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_DESA }).format(now);
}

/** Tambah `n` hari ke tanggal kalender "YYYY-MM-DD" (aritmetika UTC, bebas zona perangkat). */
export function tambahHari(tanggal: string, n: number): string {
  const [y, m, d] = tanggal.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" → "Jumat, 20 November 2026". */
export function formatTanggal(tanggal: string): string {
  const [y, m, d] = tanggal.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}

/**
 * Tanggal kalender → DateTime ISO yang disimpan. Dipilih pukul 12.00 WITA (04.00Z), bukan tengah malam lokal
 * (`toISOString()` lama = 16.00Z hari sebelumnya): tanggal yang sama tetap terbaca di zona UTC−4 s.d. UTC+12,
 * termasuk WIB/WITA/WIT di tabel admin.
 */
export function tanggalKeIso(tanggal: string): string {
  return `${tanggal}T04:00:00.000Z`;
}

/** Panjang isian setelah dipangkas. */
const len = (text: string) => text.trim().length;

/** Pesan galat per isian (kosong = valid). `hariIni` = "YYYY-MM-DD" zona desa. */
export function peminjamanErrors(values: PeminjamanValues, hariIni: string): PeminjamanErrors {
  const errors: PeminjamanErrors = {};
  if (len(values.nama) < NAMA_MIN) errors.nama = `Nama minimal ${NAMA_MIN} karakter.`;
  else if (len(values.nama) > NAMA_MAX) errors.nama = `Nama maksimal ${NAMA_MAX} karakter.`;
  if (!isValidPhoneDigits(values.telp)) {
    errors.telp = `Nomor harus ${MIN_DIGITS + 1}–${MAX_DIGITS + 1} digit (termasuk 0 di depan).`;
  }
  if (len(values.alamat) < ALAMAT_MIN) errors.alamat = `Alamat minimal ${ALAMAT_MIN} karakter.`;
  else if (len(values.alamat) > ALAMAT_MAX) errors.alamat = `Alamat maksimal ${ALAMAT_MAX} karakter.`;
  const batasAmbil = tambahHari(hariIni, AMBIL_MAKS_HARI);
  if (!ISO_DATE.test(values.tanggalAmbil)) errors.tanggalAmbil = 'Pilih tanggal ambil buku.';
  else if (values.tanggalAmbil < hariIni || values.tanggalAmbil > batasAmbil) {
    errors.tanggalAmbil = `Tanggal ambil antara hari ini dan ${AMBIL_MAKS_HARI} hari ke depan.`;
  }
  if (len(values.catatan) > CATATAN_MAX) errors.catatan = `Catatan maksimal ${CATATAN_MAX} karakter.`;
  return errors;
}

/** Formulir boleh dikirim bila tidak ada galat. */
export function isPeminjamanFormValid(values: PeminjamanValues, hariIni: string): boolean {
  return Object.keys(peminjamanErrors(values, hariIni)).length === 0;
}

/**
 * Catatan teks polos → HTML aman. MITIGASI SEMENTARA(perpus-catatan): halaman detail admin merender `catatan` lewat
 * dangerouslySetInnerHTML, jadi teks warga di-escape (dan baris baru jadi <br>) agar tampil apa adanya, bukan
 * dijalankan. Hapus bila server menyanitasi/admin merender teks polos (docs/BACKEND-TODO.md P1 XSS catatan).
 */
export function catatanKeHtml(text: string): string {
  return text
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r?\n/g, '<br>');
}

/** Isian valid → badan POST. `tanggalKembali` sengaja tidak dikirim (diisi admin saat buku dikembalikan). */
export function toPeminjamanPayload(bukuId: string, values: PeminjamanValues): PeminjamanPayload {
  const catatan = catatanKeHtml(values.catatan);
  return {
    bukuId,
    nama: values.nama.trim(),
    noTelp: toStoredPhone(sanitizePhoneDigits(values.telp)),
    alamat: values.alamat.trim(),
    tanggalPinjam: tanggalKeIso(values.tanggalAmbil),
    batasKembali: tanggalKeIso(tambahHari(values.tanggalAmbil, LAMA_PINJAM_HARI)),
    ...(catatan ? { catatan } : {}),
  };
}
