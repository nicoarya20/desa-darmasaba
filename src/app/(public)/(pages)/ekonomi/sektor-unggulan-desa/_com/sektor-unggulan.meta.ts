/** Konstanta halaman Sektor Unggulan Desa (`/ekonomi/sektor-unggulan-desa`). */

/**
 * Batas sektor yang dimuat sekaligus (satu find-many, diurutkan di klien). API memakai bawaan 10 bila `limit` tidak
 * dikirim, sehingga sektor ke-11 dst. dulu hilang. Stg 2026-11-16: 7 sektor. Sektor ke-101 dst. tidak tampil
 * (ada console.warn).
 */
export const SEKTOR_UNGGULAN_FETCH_LIMIT = 100;

/** Halaman foto & cerita tiap potensi; Sektor Unggulan hanya angka + peringkat (keputusan user 2026-11-16). */
export const POTENSI_DESA_HREF = "/pemerintahan/potensi";
