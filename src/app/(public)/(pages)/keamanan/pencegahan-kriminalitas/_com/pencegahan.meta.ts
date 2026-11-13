/** Konstanta halaman Pencegahan Kriminalitas (`/keamanan/pencegahan-kriminalitas`). */

export const PENCEGAHAN_BASE_HREF = "/keamanan/pencegahan-kriminalitas";

/** Kartu program per halaman daftar (2 baris × 3 kolom di desktop). Sorotan di halaman 1 tidak dihitung. */
export const PENCEGAHAN_PAGE_SIZE = 6;

/**
 * Batas entri yang dimuat sekaligus (satu permintaan find-many), lalu dipaginasi di klien.
 * MITIGASI SEMENTARA: sorotan (entri terbaru) dikeluarkan dari daftar kartu di semua halaman, sehingga kartu halaman n
 * mulai dari offset 1 + (n-1)×6; API find-many hanya punya `page`/`limit` (tanpa `offset`), jadi offset itu tak bisa
 * diminta ke server. Stg 2026-11-12: 4 entri. Entri ke-101 dst. tidak tampil (ada console.warn). Bisa dihapus bila
 * backend menambah param `offset` (atau `skip`) di find-many.
 */
export const PENCEGAHAN_FETCH_LIMIT = 100;

/** Gambar pratinjau video YouTube (`hqdefault` selalu tersedia; 4:3 berpita hitam, dipotong `object-fit: cover`). */
export const YOUTUBE_THUMB_BASE = "https://i.ytimg.com/vi";

/** Pemutar YouTube mode privasi (tanpa cookie sampai video diputar); dimuat hanya setelah tombol putar diklik. */
export const YOUTUBE_EMBED_BASE = "https://www.youtube-nocookie.com/embed";

/** Lebar maks gambar pengganti i.ytimg untuk video yang tidak tersedia (120×90); `hqdefault` asli 480 px. */
export const YOUTUBE_MISSING_THUMB_MAX_WIDTH = 120;
