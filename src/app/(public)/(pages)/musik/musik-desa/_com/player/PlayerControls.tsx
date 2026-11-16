'use client';

import {
  IconArrowsShuffle,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconRepeat,
  IconRepeatOnce,
} from '@tabler/icons-react';
import { useMusic } from '@/app/context/MusicContext';
import { REPEAT_LABEL } from '@/app/context/music/music.text';
import { PLAYER_TEXT } from './player.text';
import s from './player-controls.module.css';

/** Status tombol transport dari lagu saat ini: tanpa lagu → semua nonaktif; tanpa audio → putar/jeda nonaktif. */
export function useTransportState() {
  const { currentSong, isPlaying } = useMusic();
  const hasSong = currentSong !== null;
  const playable = Boolean(currentSong?.audioFile?.link);
  return { hasSong, playable, isPlaying: isPlaying && playable };
}

/** Tombol putar/jeda: ikon putih tanpa lingkaran (gaya TIDAL), target sentuh ≥44px. */
export function PlayPauseButton({ size = 36 }: { size?: number }) {
  const { togglePlayPause } = useMusic();
  const { hasSong, playable, isPlaying } = useTransportState();
  const Icon = isPlaying ? IconPlayerPauseFilled : IconPlayerPlayFilled;
  return (
    <button
      type="button"
      className={`${s.btn} ${s.main}`}
      onClick={togglePlayPause}
      disabled={!hasSong || !playable}
      aria-label={isPlaying ? PLAYER_TEXT.pause : PLAYER_TEXT.play}
    >
      <Icon size={size} aria-hidden="true" />
    </button>
  );
}

/** Tombol lagu berikutnya (dipakai juga di bar versi ponsel); nonaktif di ujung urutan saat ulang mati. */
export function NextButton() {
  const { playNext, hasNext } = useMusic();
  const { hasSong } = useTransportState();
  return (
    <button
      type="button"
      className={s.btn}
      onClick={playNext}
      disabled={!hasSong || !hasNext}
      aria-label={PLAYER_TEXT.next}
    >
      <IconPlayerSkipForwardFilled size={22} aria-hidden="true" />
    </button>
  );
}

/** Baris kontrol lengkap: acak · sebelumnya · putar/jeda · berikutnya · ulang. */
export function PlayerControls() {
  const { playPrev, isShuffle, repeatMode, toggleShuffle, cycleRepeat, musikData } = useMusic();
  const RepeatIcon = repeatMode === 'one' ? IconRepeatOnce : IconRepeat;
  const { hasSong } = useTransportState();
  const hasLibrary = musikData.length > 0;

  return (
    <div className={s.row}>
      <button
        type="button"
        className={s.btn}
        onClick={toggleShuffle}
        disabled={!hasLibrary}
        aria-label={PLAYER_TEXT.shuffle}
        aria-pressed={isShuffle}
        data-active={isShuffle}
      >
        <IconArrowsShuffle size={20} aria-hidden="true" />
      </button>
      <button type="button" className={s.btn} onClick={playPrev} disabled={!hasSong} aria-label={PLAYER_TEXT.prev}>
        <IconPlayerSkipBackFilled size={22} aria-hidden="true" />
      </button>
      <PlayPauseButton />
      <NextButton />
      <button
        type="button"
        className={s.btn}
        onClick={cycleRepeat}
        disabled={!hasLibrary}
        // Tiga status: label menyebut mode aktif (aria-pressed hanya cocok untuk dua status).
        aria-label={REPEAT_LABEL[repeatMode]}
        data-active={repeatMode !== 'off'}
      >
        <RepeatIcon size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
