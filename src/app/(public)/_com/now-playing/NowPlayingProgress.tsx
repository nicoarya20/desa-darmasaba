'use client';

import { Slider } from '@mantine/core';
import type { CSSProperties } from 'react';
import { useMusic, useMusicTime } from '@/app/context/MusicContext';
import { formatTime } from '@/app/context/music/format';
import { positionValueText } from '@/app/context/music/music.text';
import { canSeek } from '@/app/context/music/playable';
import { remainingText } from './now-playing.logic';
import { NOW_PLAYING_TEXT as T } from './now-playing.text';
import s from './now-playing-progress.module.css';

// Rel lewat variabel inline: aturan Mantine `[data-mantine-color-scheme] .slider` lebih spesifik dari kelas modul.
const SLIDER_VARS = {
  '--slider-track-bg': 'var(--np-track)',
  '--slider-track-disabled-bg': 'var(--np-track)',
} as CSSProperties;

/**
 * Waktu berjalan · progres · sisa waktu ("-1:24"). Satu-satunya bagian kartu yang membaca useMusicTime(),
 * jadi 'timeupdate' tidak me-render ulang seluruh kartu. Seret = pratinjau, lepas = pindah posisi audio.
 */
export function NowPlayingProgress() {
  const { currentSong } = useMusic();
  const { currentTime, duration, seek, seekPreview } = useMusicTime();
  // Predikat sama dengan PlayerProgress aplikasi Musik: tanpa audio / durasi belum diketahui → tidak bisa digeser.
  const enabled = canSeek(currentSong, duration);

  return (
    <div className={s.progress}>
      <span className={s.time}>{formatTime(enabled ? currentTime : 0)}</span>
      <Slider
        className={s.slider}
        classNames={{ thumb: s.thumb }}
        style={SLIDER_VARS}
        size={4}
        thumbSize={12}
        color="var(--jenna-glass-ink)"
        radius="xl"
        min={0}
        max={enabled ? duration : 1}
        step={1}
        value={enabled ? Math.min(currentTime, duration) : 0}
        onChange={seekPreview}
        onChangeEnd={seek}
        disabled={!enabled}
        label={null}
        thumbLabel={T.seek}
        thumbValueText={(value) => positionValueText(formatTime(value), formatTime(duration))}
      />
      <span className={s.time}>{remainingText(enabled ? currentTime : 0, enabled ? duration : 0)}</span>
    </div>
  );
}
