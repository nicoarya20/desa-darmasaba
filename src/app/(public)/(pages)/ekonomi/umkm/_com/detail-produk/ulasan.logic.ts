/** Hitungan murni ringkasan ulasan produk UMKM (angka rata-rata, sebaran bintang 5→1). */

export type UlasanBintang = 1 | 2 | 3 | 4 | 5;

export type UlasanRingkasan = {
  /** null = belum ada nilai. */
  rataRata: number | null;
  jumlah: number;
  distribusi: Record<UlasanBintang, number>;
};

/** Urutan baris sebaran: bintang terbanyak di atas. */
export const ULASAN_BINTANG: readonly UlasanBintang[] = [5, 4, 3, 2, 1];

// TODO(umkm-ulasan): belum ada model ulasan — docs/BACKEND-TODO.md P3. Sampai ada, halaman selalu memakai ringkasan kosong.
export const ULASAN_KOSONG: UlasanRingkasan = {
  rataRata: null,
  jumlah: 0,
  distribusi: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const KOSONG = '–';

/** Jumlah ulasan yang tercatat di sebaran (dasar persen bar). */
export function totalDistribusi(distribusi: Record<UlasanBintang, number>): number {
  return ULASAN_BINTANG.reduce((sum, bintang) => sum + Math.max(0, distribusi[bintang] || 0), 0);
}

/** Lebar bar (0–100) satu baris bintang; total 0 atau angka tak valid → 0, tidak pernah NaN. */
export function persenBintang(jumlahBintang: number, total: number): number {
  if (!Number.isFinite(jumlahBintang) || !Number.isFinite(total) || total <= 0 || jumlahBintang <= 0) return 0;
  return Math.min(100, (jumlahBintang / total) * 100);
}

/** Angka rata-rata satu desimal gaya Indonesia ("4,5"); belum ada nilai → "–". */
export function formatRataRata(rataRata: number | null): string {
  if (rataRata == null || !Number.isFinite(rataRata)) return KOSONG;
  return rataRata.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
