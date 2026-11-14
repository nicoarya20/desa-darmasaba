import { PlayingBars } from './PlayingBars';
import { TrackCover } from './TrackCover';
import { trackActionVerb, trackDurationText } from './track-a11y';
import type { Track } from './musik.types';
import sr from '../sr-only.module.css';
import s from './track-row.module.css';

type Props = { track: Track; active: boolean; playing: boolean; onPlay: (track: Track) => void };

/** Baris lagu ringkas (grid "Semua lagu"): sampul 64, judul + artis, durasi di kanan; nama tombol = isi baris. */
export function TrackRow({ track, active, playing, onPlay }: Props) {
  return (
    <button
      type="button"
      className={s.row}
      data-active={active}
      data-playable={track.playable}
      aria-current={active ? 'true' : undefined}
      onClick={() => onPlay(track)}
    >
      <span className={sr.srOnly}>{`${trackActionVerb(track, active, playing)} `}</span>
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
      <span className={s.meta}>{trackDurationText(track)}</span>
    </button>
  );
}
