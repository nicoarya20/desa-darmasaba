'use client';

import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconX,
} from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { useMusic } from '@/app/context/MusicContext';
import { hasAudio } from '@/app/context/music/playable';
import glass from '../jenna/jenna.module.css';
import reveal from '../link-reveal/link-reveal.module.css';
import { MUSIK_BASE_PATH } from '../musik-route';
import { NowPlayingCover } from './NowPlayingCover';
import { NowPlayingProgress } from './NowPlayingProgress';
import { NOW_PLAYING_TEXT as T } from './now-playing.text';
import s from './now-playing-card.module.css';

type Props = {
  /** widget = kartu melayang desktop (lebar tetap, berbayang); menu = di panel menu ponsel (selebar wadah). */
  variant: 'widget' | 'menu';
  /** Dipanggil saat tautan ke aplikasi Musik diklik (mis. menutup panel menu). */
  onNavigate?: () => void;
  /** Dipanggil sesudah stop() saat × ditekan (kartu hilang); mis. memindahkan fokus ke tombol menu. */
  onStop?: () => void;
};

/**
 * Kartu pemutar gaya widget Now Playing iPhone: sampul + judul + artis (tautan ke Musik Desa), progres dengan
 * waktu berjalan & sisa, sebelumnya / putar-jeda / berikutnya, dan × = hentikan lagu. Kaca gelap Jenna
 * (`.glass` jenna.module.css) di kedua tema. Tanpa lagu → null.
 */
export function NowPlayingCard({ variant, onNavigate, onStop }: Props) {
  const { currentSong, isPlaying, hasNext, togglePlayPause, playPrev, playNext, stop } = useMusic();
  if (!currentSong) return null;
  const playable = hasAudio(currentSong);
  const playing = isPlaying && playable;
  const PlayIcon = playing ? IconPlayerPauseFilled : IconPlayerPlayFilled;
  const onClose = () => {
    stop();
    onStop?.();
  };

  return (
    <section className={`${glass.glass} ${s.card}`} data-variant={variant} aria-label={T.region}>
      <Link
        href={MUSIK_BASE_PATH}
        className={`${s.info} ${reveal.trigger}`}
        onClick={onNavigate}
        aria-label={T.open(currentSong.judul, currentSong.artis)}
      >
        <NowPlayingCover src={currentSong.coverImage?.link ?? null} className={s.cover} />
        <span className={s.text}>
          <span className={s.title}>
            <span className={`${reveal.title} ${s.titleReveal}`}>{currentSong.judul}</span>
          </span>
          <span className={s.artist}>{currentSong.artis}</span>
        </span>
      </Link>

      <NowPlayingProgress />

      <div className={s.controls}>
        <span aria-hidden="true" />
        <div className={s.transport}>
          <button type="button" className={s.btn} onClick={playPrev} aria-label={T.prev}>
            <IconPlayerSkipBackFilled size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${s.btn} ${s.main}`}
            onClick={togglePlayPause}
            disabled={!playable}
            title={playable ? undefined : T.noAudio}
            aria-label={playing ? T.pause : T.play}
          >
            <PlayIcon size={30} aria-hidden="true" />
          </button>
          <button type="button" className={s.btn} onClick={playNext} disabled={!hasNext} aria-label={T.next}>
            <IconPlayerSkipForwardFilled size={22} aria-hidden="true" />
          </button>
        </div>
        <button type="button" className={`${s.btn} ${s.close}`} onClick={onClose} aria-label={T.stop}>
          <IconX size={18} stroke={2.25} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
