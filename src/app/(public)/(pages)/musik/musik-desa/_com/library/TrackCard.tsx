import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react';
import { TrackCover } from './TrackCover';
import { trackActionLabel } from './track-a11y';
import type { Track } from './musik.types';
import s from './track-card.module.css';

type Props = { track: Track; active: boolean; playing: boolean; onPlay: (track: Track) => void };

/** Kartu sampul besar untuk rak horizontal; seluruh kartu satu tombol putar. */
export function TrackCard({ track, active, playing, onPlay }: Props) {
  const showPause = active && playing && track.playable;
  return (
    <button
      type="button"
      className={s.card}
      data-active={active}
      data-playable={track.playable}
      aria-label={trackActionLabel(track, active, playing)}
      onClick={() => onPlay(track)}
    >
      <span className={s.media}>
        <TrackCover src={track.coverUrl} alt="" radius={6} seed={track.id} />
        <span className={s.play} aria-hidden="true">
          {showPause ? <IconPlayerPauseFilled size={22} /> : <IconPlayerPlayFilled size={22} />}
        </span>
      </span>
      <span className={s.title}>{track.judul}</span>
      <span className={s.artist}>{track.artis}</span>
    </button>
  );
}
