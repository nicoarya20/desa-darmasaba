import { MUSIK_TEXT as T } from './musik-library.text';
import type { Track } from './musik.types';

/**
 * Kata kerja tombol lagu (dibaca pembaca layar sebelum isi tombol): "Jeda" untuk lagu yang sedang berbunyi,
 * selain itu "Putar". Nama tombol = kata kerja + isi yang terlihat (judul, artis, durasi/keterangan), bukan
 * aria-label yang menelan isi itu.
 */
export function trackActionVerb(track: Track, active: boolean, playing: boolean): string {
  return active && playing && track.playable ? T.jeda : T.putar;
}

/** Teks kolom durasi: durasi lagu (kosong bila admin belum mengisi), atau "Audio belum tersedia". */
export function trackDurationText(track: Track): string {
  return track.playable ? (track.durasi ?? '') : T.audioBelum;
}
