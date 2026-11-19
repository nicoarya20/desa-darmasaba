import type { CSSProperties } from 'react';

/** Jumlah angka di belakang koma saat menampilkan skor (IDM Kemendesa dipublikasikan empat desimal). */
export const SKOR_TAMPIL_DESIMAL = 4;

const skorFormat = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: SKOR_TAMPIL_DESIMAL,
  maximumFractionDigits: SKOR_TAMPIL_DESIMAL,
});

/** Skor 0-1 dalam format Indonesia dengan empat desimal (koma desimal), mis. "0,5000". */
export function formatSkor(skor: number): string {
  return skorFormat.format(skor);
}

/** Lebar batang CSS (persen) untuk skor 0-1, ditulis lewat variabel `--w`. Skor di luar rentang dipotong ke 0-100%. */
export function barStyle(skor: number): CSSProperties {
  const persen = Math.min(100, Math.max(0, skor * 100));
  return { '--w': `${persen}%` } as CSSProperties;
}
