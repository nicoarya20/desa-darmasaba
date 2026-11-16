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

/** aria-valuetext slider posisi, mis. "0:08 dari 2:34" (pembaca layar tidak membaca angka detik mentah). */
export const positionValueText = (current: string, total: string) => `${current} dari ${total}`;

/** aria-valuetext slider volume, mis. "70%". */
export const volumeValueText = (volume: number) => `${Math.round(volume)}%`;

/** Label tombol Ulang per mode (dipakai bar /musik dan bar global; label sekaligus menyebut status). */
export const REPEAT_LABEL = {
  off: 'Ulang: mati',
  all: 'Ulang: semua lagu',
  one: 'Ulang: satu lagu',
} as const;
