import { parseJumlah } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { DINAMIKA_TAHUN_MAX, DINAMIKA_TAHUN_MIN, ringkasanDinamika, type DinamikaRow } from '@/lib/dinamika-penduduk';

export type { DinamikaRow } from '@/lib/dinamika-penduduk';

/** Arus satu tahun: warga bertambah (lahir + masuk), berkurang (mati + keluar), dan selisihnya. */
export type DinamikaNeraca = { bertambah: number; berkurang: number; bersih: number };

/** Neraca tahun terbaru siap tampil: angka mentah + arus + pecahan alami/migrasi + lebar batang (0–100). */
export type DinamikaRingkasan = DinamikaNeraca & {
  row: DinamikaRow;
  pertumbuhanAlami: number;
  migrasiBersih: number;
  /** Lebar batang relatif ke arus terbesar (bertambah vs berkurang); 0 bila keduanya 0. */
  lebar: { bertambah: number; berkurang: number };
};

type ApiRow = Record<string, unknown>;

const isObject = (value: unknown): value is ApiRow => typeof value === 'object' && value !== null;

/** Satu baris API → DinamikaRow; null bila id/tahun tak valid atau salah satu jumlah tak terbaca (tidak ditebak). */
export function parseDinamikaRow(value: unknown): DinamikaRow | null {
  if (!isObject(value) || typeof value.id !== 'string' || value.id === '') return null;
  const tahun = Number(value.tahun);
  if (!Number.isInteger(tahun) || tahun < DINAMIKA_TAHUN_MIN || tahun > DINAMIKA_TAHUN_MAX) return null;
  const kelahiran = parseJumlah(value.kelahiran);
  const kematian = parseJumlah(value.kematian);
  const masuk = parseJumlah(value.masuk);
  const keluar = parseJumlah(value.keluar);
  if (kelahiran === null || kematian === null || masuk === null || keluar === null) return null;
  return { id: value.id, tahun, kelahiran, kematian, masuk, keluar };
}

/**
 * Baris mentah `/api/kependudukan/dinamikapenduduk/find-many` → baris valid, tahun terbaru dulu.
 * Baris tak valid dibuang; tahun ganda (seharusnya mustahil, `tahun` unik di DB) → yang pertama dipakai.
 */
export function parseDinamikaRows(rows: readonly unknown[]): DinamikaRow[] {
  const seen = new Set<number>();
  const out: DinamikaRow[] = [];
  for (const raw of rows) {
    const row = parseDinamikaRow(raw);
    if (!row || seen.has(row.tahun)) continue;
    seen.add(row.tahun);
    out.push(row);
  }
  return out.sort((a, b) => b.tahun - a.tahun);
}

/** Bertambah = lahir + masuk, berkurang = mati + keluar, bersih = bertambah − berkurang (dipakai juga hero dashboard). */
export function dinamikaNeraca(row: DinamikaRow): DinamikaNeraca {
  const bertambah = row.kelahiran + row.masuk;
  const berkurang = row.kematian + row.keluar;
  return { bertambah, berkurang, bersih: bertambah - berkurang };
}

/** Ringkasan satu tahun untuk panel neraca. */
export function ringkasDinamika(row: DinamikaRow): DinamikaRingkasan {
  const neraca = dinamikaNeraca(row);
  const max = Math.max(neraca.bertambah, neraca.berkurang);
  const lebar = (n: number) => (max > 0 ? (n / max) * 100 : 0);
  return {
    ...neraca,
    ...ringkasanDinamika(row),
    row,
    lebar: { bertambah: lebar(neraca.bertambah), berkurang: lebar(neraca.berkurang) },
  };
}
