import { useId } from 'react';
import { PlayingBars } from './PlayingBars';
import { TrackCover } from './TrackCover';
import { MUSIK_TEXT as T } from './musik-library.text';
import { trackActionVerb, trackDurationText } from './track-a11y';
import type { Track } from './musik.types';
import sr from '../sr-only.module.css';
import s from './track-table.module.css';

type Props = {
  tracks: readonly Track[];
  currentId: string | null;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
};

/**
 * Hasil Jelajahi sebagai tabel semantik (role table/row/columnheader/cell di atas tata letak grid): #, sampul +
 * judul/artis, genre, tahun, durasi (≤734px: #/genre/tahun disembunyikan secara visual saja). Tombol putar ada di
 * sel judul dan menutup seluruh baris lewat ::after; durasi/keterangan audio terhubung lewat aria-describedby.
 */
export function TrackTable({ tracks, currentId, isPlaying, onPlay }: Props) {
  const baseId = useId();
  return (
    <div className={s.table} role="table" aria-label={T.tabelLabel}>
      <div className={s.head} role="row">
        <span className={s.num} role="columnheader">
          <span aria-hidden="true">{T.kolomNo}</span>
          <span className={sr.srOnly}>{T.kolomNoLabel}</span>
        </span>
        <span role="columnheader">{T.kolomJudul}</span>
        <span className={s.wide} role="columnheader">
          {T.kolomGenre}
        </span>
        <span className={s.wide} role="columnheader">
          {T.kolomTahun}
        </span>
        <span className={s.end} role="columnheader">
          {T.kolomDurasi}
        </span>
      </div>
      <div role="rowgroup">
        {tracks.map((t, i) => {
          const active = t.id === currentId;
          const playing = active && isPlaying;
          const durationId = `${baseId}-durasi-${i}`;
          return (
            <div key={t.id} className={s.row} role="row" data-active={active} data-playable={t.playable}>
              <span className={s.num} role="cell">
                {active ? (
                  <>
                    <PlayingBars playing={playing && t.playable} />
                    <span className={sr.srOnly}>{T.sedangDiputar}</span>
                  </>
                ) : (
                  i + 1
                )}
              </span>
              <span className={s.main} role="cell">
                <span className={s.cover}>
                  <TrackCover src={t.coverUrl} alt="" size={48} seed={t.id} />
                </span>
                <button
                  type="button"
                  className={s.hit}
                  aria-current={active ? 'true' : undefined}
                  aria-describedby={durationId}
                  onClick={() => onPlay(t)}
                >
                  <span className={sr.srOnly}>{`${trackActionVerb(t, active, playing)} `}</span>
                  <span className={s.title}>{t.judul}</span>
                  <span className={s.sub}>{t.artis}</span>
                </button>
              </span>
              <span className={`${s.wide} ${s.sub}`} role="cell">
                {t.genre ?? ''}
              </span>
              <span className={`${s.wide} ${s.sub} ${s.tabular}`} role="cell">
                {t.tahun ?? ''}
              </span>
              <span id={durationId} className={`${s.end} ${s.tabular}`} role="cell">
                {trackDurationText(t)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
