/**
 * Estimasi waktu & biaya pelayanan desa (kolom opsional di 4 model Pelayanan*).
 * Semantik: `null` = belum diisi (badge disembunyikan), `biaya` 0 = Gratis.
 * Dipakai bersama oleh API (validasi di boundary), form admin, dan tampilan publik.
 */

/** Batas wajar tarif layanan administrasi desa (Rp 100 juta); di atas ini dianggap salah input. */
export const PELAYANAN_BIAYA_MAX = 100_000_000;
/** Panjang maksimum teks estimasi waktu, mis. "1 hari kerja". */
export const PELAYANAN_ESTIMASI_WAKTU_MAX_LENGTH = 100;
/** Jumlah digit maksimum input biaya di form admin. */
export const PELAYANAN_BIAYA_MAX_DIGITS = String(PELAYANAN_BIAYA_MAX).length;
/** Label untuk biaya 0. */
export const PELAYANAN_BIAYA_GRATIS_LABEL = 'Gratis';
/** Pemisah antar bagian pada label gabungan waktu & biaya. */
export const PELAYANAN_WAKTU_BIAYA_SEPARATOR = ' • ';

export interface WaktuBiayaValue {
  estimasiWaktu?: string | null;
  biaya?: number | null;
}

export type WaktuBiayaParseResult =
  | { ok: true; data: WaktuBiayaValue }
  | { ok: false; message: string };

interface WaktuBiayaRaw {
  estimasiWaktu?: unknown;
  biaya?: unknown;
}

/**
 * Validasi + normalisasi input API. Hanya key yang dikirim yang muncul di `data`
 * (undefined = jangan ubah kolom, null = kosongkan, nilai = simpan).
 */
export function parseWaktuBiaya(input: WaktuBiayaRaw | null | undefined): WaktuBiayaParseResult {
  const data: WaktuBiayaValue = {};
  const { estimasiWaktu, biaya } = input ?? {};

  if (estimasiWaktu !== undefined) {
    if (estimasiWaktu === null) {
      data.estimasiWaktu = null;
    } else if (typeof estimasiWaktu !== 'string') {
      return { ok: false, message: 'Estimasi waktu harus berupa teks' };
    } else {
      const trimmed = estimasiWaktu.trim();
      if (trimmed.length > PELAYANAN_ESTIMASI_WAKTU_MAX_LENGTH) {
        return {
          ok: false,
          message: `Estimasi waktu maksimal ${PELAYANAN_ESTIMASI_WAKTU_MAX_LENGTH} karakter`,
        };
      }
      data.estimasiWaktu = trimmed === '' ? null : trimmed;
    }
  }

  if (biaya !== undefined) {
    if (biaya === null) {
      data.biaya = null;
    } else if (typeof biaya !== 'number' || !Number.isInteger(biaya)) {
      return { ok: false, message: 'Biaya harus berupa bilangan bulat (rupiah)' };
    } else if (biaya < 0) {
      return { ok: false, message: 'Biaya tidak boleh negatif' };
    } else if (biaya > PELAYANAN_BIAYA_MAX) {
      return {
        ok: false,
        message: `Biaya maksimal Rp ${PELAYANAN_BIAYA_MAX.toLocaleString('id-ID')}`,
      };
    } else {
      data.biaya = biaya;
    }
  }

  return { ok: true, data };
}

/** Biaya → teks tampilan: null → null (tak ditampilkan), 0 → "Gratis", lainnya "Rp 50.000". */
export function formatBiayaPelayanan(biaya: number | null | undefined): string | null {
  if (biaya === null || biaya === undefined) return null;
  if (biaya === 0) return PELAYANAN_BIAYA_GRATIS_LABEL;
  return `Rp ${biaya.toLocaleString('id-ID')}`;
}

/** Label gabungan "1 hari kerja • Gratis"; null bila kedua field belum diisi. */
export function waktuBiayaLabel(value: WaktuBiayaValue | null | undefined): string | null {
  const waktu = value?.estimasiWaktu?.trim() || null;
  const parts = [waktu, formatBiayaPelayanan(value?.biaya)].filter(
    (part): part is string => part !== null
  );
  return parts.length > 0 ? parts.join(PELAYANAN_WAKTU_BIAYA_SEPARATOR) : null;
}

/** Saring input form biaya: hanya digit, dipotong ke jumlah digit maksimum. */
export function sanitizeBiayaInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, PELAYANAN_BIAYA_MAX_DIGITS);
}

export interface WaktuBiayaForm {
  estimasiWaktu: string;
  biaya: string;
}

/** Form admin (string) → payload API; string kosong menjadi null (= belum diisi). */
export function toWaktuBiayaPayload(form: WaktuBiayaForm): { estimasiWaktu: string | null; biaya: number | null } {
  const waktu = form.estimasiWaktu.trim();
  const biaya = form.biaya.trim();
  return {
    estimasiWaktu: waktu === '' ? null : waktu,
    biaya: biaya === '' ? null : Number(biaya),
  };
}

/** Data dari API → nilai awal form admin (null menjadi string kosong). */
export function toWaktuBiayaForm(data: WaktuBiayaValue | null | undefined): WaktuBiayaForm {
  return {
    estimasiWaktu: data?.estimasiWaktu ?? '',
    biaya: data?.biaya === null || data?.biaya === undefined ? '' : String(data.biaya),
  };
}

/** Validasi form admin sebelum kirim; mengembalikan pesan error atau null bila valid. */
export function validateWaktuBiayaForm(form: WaktuBiayaForm): string | null {
  const result = parseWaktuBiaya(toWaktuBiayaPayload(form));
  return result.ok ? null : result.message;
}
