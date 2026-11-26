import type { Musik, MusicFile } from './music.types';

/** Lagu punya file audio (link terisi). Lagu tanpa audio tetap tampil, tapi tidak dimuat ke elemen audio. */
export const hasAudio = (song: Musik | null | undefined): song is Musik & { audioFile: MusicFile } =>
  Boolean(song?.audioFile?.link);

/**
 * Slider posisi boleh digeser: lagu punya audio dan durasinya sudah diketahui. Satu predikat untuk
 * PlayerProgress dan NowPlayingProgress (kartu Now Playing situs); menggeser lagu tanpa sumber tidak
 * pernah memicu 'seeked'.
 */
export const canSeek = (song: Musik | null | undefined, duration: number): boolean => hasAudio(song) && duration > 0;
