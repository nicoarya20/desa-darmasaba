/** Satu baris grafik jumlah penduduk miskin per tahun (bentuk data halaman publik). */
export type PendudukMiskinRow = { year: number | string; totalPoorPopulation: number | string };

/**
 * Angka penduduk miskin tahun TERBARU (bukan jumlah semua tahun: menjumlahkan data tahunan
 * menghasilkan angka menyesatkan, mis. 27 + 27 + 26 = 80). `null` bila tidak ada baris bertahun valid.
 */
export function pendudukMiskinTerbaru(rows: readonly PendudukMiskinRow[]): { year: number; total: number } | null {
  let terbaru: { year: number; total: number } | null = null;
  for (const row of rows) {
    const year = Number(row.year);
    if (!Number.isFinite(year)) continue;
    if (!terbaru || year > terbaru.year) terbaru = { year, total: Number(row.totalPoorPopulation) || 0 };
  }
  return terbaru;
}

/** Baris grafik terurut tahun naik (tahun tidak valid dibuang). */
export function urutkanPerTahun<T extends PendudukMiskinRow>(rows: readonly T[]): T[] {
  return rows.filter((r) => Number.isFinite(Number(r.year))).sort((a, b) => Number(a.year) - Number(b.year));
}
