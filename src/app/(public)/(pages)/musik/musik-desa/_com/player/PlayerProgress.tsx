'use client';

import { Slider } from '@mantine/core';
import type { CSSProperties } from 'react';
import { useMusic } from '@/app/context/MusicContext';
import { formatTime } from '@/app/context/music/format';
import { PLAYER_TEXT } from './player.text';
import s from './player-progress.module.css';

// Warna trek lewat variabel inline: aturan Mantine `[data-mantine-color-scheme] .slider` lebih spesifik dari kelas modul.
const SLIDER_VARS = { '--slider-track-bg': 'rgba(255, 255, 255, 0.2)' } as CSSProperties;

/** Waktu berjalan · slider posisi · durasi. Seret = pratinjau, lepas = pindah posisi audio. */
export function PlayerProgress() {
  const { currentSong, currentTime, duration, seek, seekPreview } = useMusic();
  const enabled = Boolean(currentSong?.audioFile?.link) && duration > 0;

  return (
    <div className={s.progress}>
      <span className={s.time}>{formatTime(currentTime)}</span>
      <Slider
        className={s.slider}
        classNames={{ thumb: s.thumb }}
        style={SLIDER_VARS}
        size={4}
        thumbSize={12}
        color="#fff"
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
      />
      <span className={s.time}>{formatTime(duration)}</span>
    </div>
  );
}

/** Versi ponsel: garis progres 2px di tepi atas bar, hanya penanda (tanpa thumb). */
export function PlayerProgressLine() {
  const { currentTime, duration } = useMusic();
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  return (
    <span className={s.line} aria-hidden="true">
      <span className={s.lineFill} style={{ width: `${pct}%` }} />
    </span>
  );
}
