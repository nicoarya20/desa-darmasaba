'use client';

import type { Musik } from '@/app/context/MusicContext';
import { TrackCover } from '../library/TrackCover';
import { PLAYER_TEXT } from './player.text';
import s from './queue-panel.module.css';

type Props = {
  song: Musik;
  /** Lagu yang sedang diputar: judul beraksen. */
  current?: boolean;
  onPlay: (song: Musik) => void;
};

/** Satu baris lagu di panel Antrean / Baru diputar; klik = putar. Tanpa audio → sampul redup, teks warna sekunder + keterangan. */
export function QueueRow({ song, current = false, onPlay }: Props) {
  const playable = Boolean(song.audioFile?.link);
  return (
    <li>
      <button
        type="button"
        className={s.row}
        onClick={() => onPlay(song)}
        data-current={current}
        data-playable={playable}
        aria-current={current ? 'true' : undefined}
      >
        <span className={s.cover}>
          <TrackCover src={song.coverImage?.link ?? null} alt="" seed={song.id} />
        </span>
        <span className={s.rowText}>
          <span className={s.rowTitle}>{song.judul}</span>
          <span className={s.rowArtist}>
            {song.artis}
            {!playable && ` · ${PLAYER_TEXT.noAudio}`}
          </span>
        </span>
      </button>
    </li>
  );
}
