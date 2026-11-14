import { MUSIK_TEXT as T } from './musik-library.text';
import type { Track } from './musik.types';

/** Label tombol lagu: "Jeda" untuk lagu yang sedang berbunyi, selain itu "Putar"; lagu tanpa audio diberi keterangan. */
export function trackActionLabel(track: Track, active: boolean, playing: boolean): string {
  const verb = active && playing && track.playable ? T.jeda : T.putar;
  const who = track.artis ? `, ${track.artis}` : '';
  const note = track.playable ? '' : ` (${T.audioBelum})`;
  return `${verb} ${track.judul}${who}${note}`;
}
