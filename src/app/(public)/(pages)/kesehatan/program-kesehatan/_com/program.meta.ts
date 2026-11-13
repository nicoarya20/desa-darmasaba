/** Konstanta halaman Program Kesehatan (`/kesehatan/program-kesehatan`). */

export const PROGRAM_BASE_HREF = "/kesehatan/program-kesehatan";

/** Tiap halaman daftar kegiatan: 1 kartu utama + 6 kartu kecil (2 baris × 3 kolom di desktop), sama dengan Kegiatan Desa. */
export const PROGRAM_PAGE_LIMIT = 7;

/**
 * Batas entri yang dimuat sekaligus (satu permintaan find-many).
 * MITIGASI SEMENTARA: API `programkesehatan/find-many` tidak punya filter jenis (indikator vs kegiatan) dan 4 indikator
 * (createdAt terbaru) bercampur di halaman pertama. Halaman memuat sampai batas ini, membuang indikator, lalu
 * memaginasi di klien (paginasi server akan memberi halaman pertama yang kurang dari 7 kartu).
 * Entri ke-101 dst. tidak tampil (stg 2026-11-12: 11 entri). Bisa dihapus bila backend menambah param mis.
 * `?jenis=indikator|kegiatan` sehingga kegiatan dipaginasi di server.
 */
export const PROGRAM_FETCH_LIMIT = 100;
