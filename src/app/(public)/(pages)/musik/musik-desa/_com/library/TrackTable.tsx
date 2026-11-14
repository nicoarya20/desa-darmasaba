import { PlayingBars } from './PlayingBars';
import { TrackCover } from './TrackCover';
import { MUSIK_TEXT as T } from './musik-library.text';
import { trackActionLabel } from './track-a11y';
import type { Track } from './musik.types';
import s from './track-table.module.css';

type Props = {
  tracks: readonly Track[];
  currentId: string | null;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
};

/** Daftar hasil Jelajahi bergaya tabel: #, sampul + judul/artis, genre, tahun, durasi (≤734px: tanpa genre & tahun). */
export function TrackTable({ tracks, currentId, isPlaying, onPlay }: Props) {
  return (
    <div className={s.table}>
      <div className={s.head} aria-hidden="true">
        <span className={s.num}>{T.kolomNo}</span>
        <span>{T.kolomJudul}</span>
        <span className={s.wide}>{T.kolomGenre}</span>
        <span className={s.wide}>{T.kolomTahun}</span>
        <span className={s.end}>{T.kolomDurasi}</span>
      </div>
      <ol className={s.list}>
        {tracks.map((t, i) => {
          const active = t.id === currentId;
          const playing = active && isPlaying;
          return (
            <li key={t.id}>
              <button
                type="button"
                className={s.row}
                data-active={active}
                data-playable={t.playable}
                aria-label={trackActionLabel(t, active, playing)}
                aria-current={active ? 'true' : undefined}
                onClick={() => onPlay(t)}
              >
                <span className={s.num}>{active ? <PlayingBars playing={playing && t.playable} /> : i + 1}</span>
                <span className={s.main}>
                  <TrackCover src={t.coverUrl} alt="" size={48} seed={t.id} />
                  <span className={s.text}>
                    <span className={s.title}>{t.judul}</span>
                    <span className={s.sub}>{t.artis}</span>
                  </span>
                </span>
                <span className={`${s.wide} ${s.sub}`}>{t.genre ?? ''}</span>
                <span className={`${s.wide} ${s.sub} ${s.tabular}`}>{t.tahun ?? ''}</span>
                <span className={`${s.end} ${s.tabular}`}>{t.playable ? (t.durasi ?? '') : T.audioBelum}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
