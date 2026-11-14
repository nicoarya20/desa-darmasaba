/**
 * Urutan baku jenjang pendidikan (dari usia termuda), dipakai bersama filter publik Info Sekolah dan API `sort=jenjang`.
 * Tabel `JenjangPendidikan` tidak punya kolom urutan; tanpa ini daftar urut nama (SMA, SMK, SMP, SD, …).
 */
export const JENJANG_ORDER: readonly string[] = ["paud", "tk", "sd", "smp", "sma", "smk"];

/** Posisi jenjang di `JENJANG_ORDER` (nama case-insensitive); jenjang lain → di belakang semuanya. */
export function jenjangRank(nama: string): number {
  const i = JENJANG_ORDER.indexOf(nama.trim().toLowerCase());
  return i === -1 ? JENJANG_ORDER.length : i;
}

/** Pembanding untuk `sort`: urutan baku dulu, jenjang lain A–Z. */
export function compareJenjang(a: string, b: string): number {
  return jenjangRank(a) - jenjangRank(b) || a.trim().toLowerCase().localeCompare(b.trim().toLowerCase());
}

/** Nilai query `sort` API find-many lembaga/siswa/pengajar untuk mengurutkan baris per jenjang. Opsional; admin tidak memakainya. */
export const SORT_BY_JENJANG = "jenjang";
