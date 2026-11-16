import type { Musik } from '@/app/context/MusicContext';

/** Satu lagu siap tampil (hasil adapter dari Musik di context). */
export type Track = {
  id: string;
  judul: string;
  artis: string;
  /** Kunci artis untuk URL/saring: huruf kecil, spasi dirapikan. */
  artisKey: string;
  genre: string | null;
  genreKey: string | null;
  tahun: number | null;
  /** "5:24" dirapikan dari durasi teks; tak terbaca → null. */
  durasi: string | null;
  coverUrl: string | null;
  /** audioFile?.link ada. */
  playable: boolean;
  /** Diteruskan ke playSong(). */
  source: Musik;
};

/** Artis turunan dari teks `artis` lagu (belum ada model artis di backend). */
export type Artist = { key: string; nama: string; jumlahLagu: number; coverUrl: string | null };

/** Genre turunan dari teks `genre` lagu, digabung tanpa beda huruf. */
export type Genre = { key: string; label: string; jumlahLagu: number };
