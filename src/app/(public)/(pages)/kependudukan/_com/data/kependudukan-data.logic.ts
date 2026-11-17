import type { DatasetSlice } from './kependudukan-data.types';

/**
 * Batas muat find-many per dataset. MITIGASI SEMENTARA(kependudukan-limit): API belum bisa diminta "tahun terbaru",
 * jadi semua tahun dimuat lalu dipilih di klien; hapus bila summary/find-many rekan menerima `?tahun=` (BACKEND-TODO).
 */
export const KEPENDUDUKAN_FETCH_LIMIT = 100;

const TAHUN_MIN = 1900;
const TAHUN_MAX = 2999;

/** Hasil muat satu dataset sebelum dipotong per tahun. */
export type DatasetLoad = { status: 'loading' } | { status: 'error' } | { status: 'ready'; rows: unknown[] };

/** Field `tahun` baris mentah (angka atau teks angka bulat 1900–2999); selain itu null. */
export function readTahun(row: unknown): number | null {
  if (typeof row !== 'object' || row === null) return null;
  const raw = (row as Record<string, unknown>).tahun;
  const n = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;
  return typeof n === 'number' && Number.isInteger(n) && n >= TAHUN_MIN && n <= TAHUN_MAX ? n : null;
}

/** Tahun terbaru yang punya baris, daftar tahun (menurun), dan baris tahun itu saja. Baris tanpa tahun sah diabaikan. */
export function pilihTahunTerbaru(allRows: readonly unknown[]): Pick<DatasetSlice, 'tahun' | 'tahunTersedia' | 'rows'> {
  const tahunTersedia = [...new Set(allRows.map(readTahun).filter((t): t is number => t !== null))].sort((a, b) => b - a);
  const tahun = tahunTersedia[0] ?? null;
  return { tahun, tahunTersedia, rows: tahun === null ? [] : allRows.filter((row) => readTahun(row) === tahun) };
}

/** Keadaan muat → `DatasetSlice` kontrak section (memuat/galat = tanpa baris). */
export function toDatasetSlice(load: DatasetLoad, retry: () => void): DatasetSlice {
  if (load.status !== 'ready') {
    return { status: load.status, tahun: null, tahunTersedia: [], rows: [], allRows: [], retry };
  }
  return { status: 'ready', ...pilihTahunTerbaru(load.rows), allRows: load.rows, retry };
}
