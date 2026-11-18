'use client';

import { Slider } from '@mantine/core';
import type { CSSProperties } from 'react';
import { useMusic, useMusicTime } from '@/app/context/MusicContext';
import { formatTime } from '@/app/context/music/format';
import { positionValueText } from '@/app/context/music/music.text';
import { canSeek } from '@/app/context/music/playable';
import { PLAYER_TEXT } from './player.text';
import s from './player-progress.module.css';

// Warna trek lewat variabel inline: aturan Mantine `[data-mantine-color-scheme] .slider` lebih spesifik dari kelas modul.
export const SLIDER_VARS = { '--slider-track-bg': 'var(--m-track)' } as CSSProperties;
/** Isi slider = tinta (gaya TIDAL; gelap: tinta putih di rel putih 20%). */
export const SLIDER_FILL = 'var(--m-ink)';

/** Waktu berjalan · slider posisi · durasi. Seret = pratinjau, lepas = pindah posisi audio. */
export function PlayerProgress() {
  const { currentSong } = useMusic();
  const { currentTime, duration, seek, seekPreview } = useMusicTime();
  const enabled = canSeek(currentSong, duration);

  return (
    <div className={s.progress}>
      <span className={s.time}>{formatTime(currentTime)}</span>
      <Slider
        className={s.slider}
        classNames={{ thumb: s.thumb }}
        style={SLIDER_VARS}
        size={4}
        thumbSize={12}
        color={SLIDER_FILL}
        radius="xl"
        min={0}
        max={enabled ? duration : 1}
        step={1}
        value={enabled ? Math.min(currentTime, duration) : 0}
        onChange={seekPreview}
        onChangeEnd={seek}
        disabled={!enabled}
        label={null}
        thumbLabel={PLAYER_TEXT.seek}
        thumbValueText={(value) => positionValueText(formatTime(value), formatTime(duration))}
      />
      <span className={s.time}>{formatTime(duration)}</span>
    </div>
  );
}

/** Versi ponsel: garis progres 2px di tepi atas bar, hanya penanda (tanpa thumb). */
export function PlayerProgressLine() {
  const { currentTime, duration } = useMusicTime();
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  return (
    <span className={s.line} aria-hidden="true">
      <span className={s.lineFill} style={{ width: `${pct}%` }} />
    </span>
  );
}
