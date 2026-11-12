// Aturan retensi Sampah (berkas & dokumen terhapus) — fungsi & konstanta murni tanpa I/O.
// Dipakai Sampah per fitur koleksi (DAK, APBDes, galeri BUMDes, perencanaan) dan purge harian.

/** Lama item terhapus disimpan di Sampah sebelum dihapus permanen otomatis (hari). Satu-satunya sumber nilai default. */
export const SAMPAH_RETENSI_HARI = 30;

const MS_PER_HARI = 24 * 60 * 60 * 1000;

/** Batas waktu: item dengan `deletedAt <= cutoff` sudah melewati retensi (tepat N hari ikut kedaluwarsa). */
export function sampahCutoff(now: Date, retensiHari: number): Date {
  return new Date(now.getTime() - retensiHari * MS_PER_HARI);
}

/** Apakah item terhapus sudah melewati retensi sehingga harus dihapus permanen. */
export function isSampahKedaluwarsa(deletedAt: Date, now: Date, retensiHari: number): boolean {
  return deletedAt.getTime() <= sampahCutoff(now, retensiHari).getTime();
}

/** Sisa hari sebelum dihapus permanen, dibulatkan ke atas (baru dihapus = N, tepat N hari = 0). */
export function sisaHariSampah(deletedAt: Date, now: Date, retensiHari: number): number {
  const sisaMs = deletedAt.getTime() + retensiHari * MS_PER_HARI - now.getTime();
  return Math.min(retensiHari, Math.max(0, Math.ceil(sisaMs / MS_PER_HARI)));
}
