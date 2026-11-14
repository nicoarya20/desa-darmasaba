/**
 * Teks toast mesin pemutar Musik Desa (dipakai bar pemutar aplikasi musik dan FixedPlayerBar situs).
 * Disimpan di samping mesin, bukan di folder rute musik, karena mesin dipasang global untuk semua halaman publik.
 */
export const MUSIC_TEXT = {
  noAudio: 'Audio lagu ini belum tersedia.',
  noPlayable: 'Belum ada lagu dengan audio yang bisa diputar.',
  playFailed: 'Gagal memutar lagu, coba lagi.',
  fileBroken: 'Gagal memutar lagu, file audio bermasalah.',
} as const;
