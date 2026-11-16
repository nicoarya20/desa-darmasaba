/**
 * Aturan bersama Dinamika Penduduk (total per tahun: kelahiran, kematian, pindah masuk/keluar):
 * batas input, pagination daftar, dan ringkasan yang ditampilkan di halaman publik.
 */

export const DINAMIKA_TAHUN_MIN = 2000;
export const DINAMIKA_TAHUN_MAX = 2100;
/** Default jumlah baris per halaman daftar dinamika. */
export const DINAMIKA_PAGE_SIZE = 10;
/** Batas atas `limit` agar daftar tidak pernah memuat seluruh tabel sekaligus. */
export const DINAMIKA_PAGE_SIZE_MAX = 100;

export type DinamikaInput = {
  tahun: number;
  kelahiran: number;
  kematian: number;
  masuk: number;
  keluar: number;
};

export type DinamikaRow = DinamikaInput & { id: string };

/** Field angka yang diisi admin, beserta label tampilnya (dipakai form & tabel). */
export const DINAMIKA_FIELDS: { key: Exclude<keyof DinamikaInput, "tahun">; label: string }[] = [
  { key: "kelahiran", label: "Kelahiran" },
  { key: "kematian", label: "Kematian" },
  { key: "masuk", label: "Pindah Masuk" },
  { key: "keluar", label: "Pindah Keluar" },
];

/** Normalisasi query `page`/`limit`: bilangan bulat positif, limit dibatasi DINAMIKA_PAGE_SIZE_MAX. */
export function parsePagination(page: unknown, limit: unknown): { page: number; limit: number; skip: number } {
  const p = Math.max(1, Math.floor(Number(page)) || 1);
  const l = Math.min(DINAMIKA_PAGE_SIZE_MAX, Math.max(1, Math.floor(Number(limit)) || DINAMIKA_PAGE_SIZE));
  return { page: p, limit: l, skip: (p - 1) * l };
}

/** Pertumbuhan alami (lahir − mati) dan migrasi bersih (masuk − keluar) satu tahun. */
export function ringkasanDinamika(row: DinamikaInput): { pertumbuhanAlami: number; migrasiBersih: number } {
  return {
    pertumbuhanAlami: row.kelahiran - row.kematian,
    migrasiBersih: row.masuk - row.keluar,
  };
}

/** Format selisih bertanda untuk tampilan: "+5", "-3", "0" (ribuan gaya id-ID). */
export function formatSelisih(n: number): string {
  const angka = Math.abs(n).toLocaleString("id-ID");
  if (n > 0) return `+${angka}`;
  if (n < 0) return `-${angka}`;
  return "0";
}
