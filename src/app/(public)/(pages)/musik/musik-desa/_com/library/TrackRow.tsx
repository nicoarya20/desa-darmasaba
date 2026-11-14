import { PlayingBars } from './PlayingBars';
import { TrackCover } from './TrackCover';
import { MUSIK_TEXT as T } from './musik-library.text';
import { trackActionLabel } from './track-a11y';
import type { Track } from './musik.types';
import s from './track-row.module.css';

type Props = { track: Track; active: boolean; playing: boolean; onPlay: (track: Track) => void };

/** Baris lagu ringkas (grid "Semua lagu"): sampul 64, judul + artis, durasi di kanan. */
export function TrackRow({ track, active, playing, onPlay }: Props) {
  return (
    <button
      type="button"
      className={s.row}
      data-active={active}
      data-playable={track.playable}
      aria-label={trackActionLabel(track, active, playing)}
      aria-current={active ? 'true' : undefined}
      onClick={() => onPlay(track)}
    >
      <span className={s.cover}>
        <TrackCover src={track.coverUrl} alt="" size={64} seed={track.id} />
      </span>
      <span className={s.text}>
        <span className={s.title}>
          {active ? <PlayingBars playing={playing && track.playable} /> : null}
          <span className={s.titleText}>{track.judul}</span>
        </span>
        <span className={s.artist}>{track.artis}</span>
      </span>
      <span className={s.meta}>{track.playable ? (track.durasi ?? '') : T.audioBelum}</span>
    </button>
  );
}
