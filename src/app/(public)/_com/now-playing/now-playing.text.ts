/** Teks UI kartu & widget Now Playing situs (tanpa em dash). */
export const NOW_PLAYING_TEXT = {
  region: 'Sedang diputar',
  play: 'Putar',
  pause: 'Jeda',
  prev: 'Lagu sebelumnya',
  next: 'Lagu berikutnya',
  stop: 'Hentikan musik',
  seek: 'Posisi lagu',
  noAudio: 'Audio belum tersedia',
  /** Nama tautan sampul + judul ke aplikasi Musik Desa. */
  open: (judul: string, artis: string) => `Buka Musik Desa: ${judul}, ${artis}`,
  /** Nama tombol pil (widget mengecil) yang membuka kartu lagi. */
  expand: (judul: string) => `Tampilkan pemutar: ${judul}`,
  cover: (judul: string) => `Sampul ${judul}`,
} as const;
