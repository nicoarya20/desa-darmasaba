'use client';

import { Slider } from '@mantine/core';
import { IconVolume, IconVolume3 } from '@tabler/icons-react';
import type { CSSProperties } from 'react';
import { useMusic } from '@/app/context/MusicContext';
import { PLAYER_TEXT } from './player.text';
import controls from './player-controls.module.css';
import s from './player-progress.module.css';
import bar from './now-playing-bar.module.css';

// Lihat PlayerProgress: warna trek lewat variabel inline supaya mengalahkan aturan skema warna Mantine.
const SLIDER_VARS = { '--slider-track-bg': 'rgba(255, 255, 255, 0.2)' } as CSSProperties;

/** Tombol bisu/bunyi + slider volume 110px (slider disembunyikan di bawah 1068px lewat CSS bar). */
export function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = useMusic();
  const silent = isMuted || volume === 0;
  const Icon = silent ? IconVolume3 : IconVolume;

  return (
    <div className={bar.volume}>
      <button
        type="button"
        className={controls.btn}
        onClick={toggleMute}
        aria-label={silent ? PLAYER_TEXT.unmute : PLAYER_TEXT.mute}
      >
        <Icon size={20} aria-hidden="true" />
      </button>
      <Slider
        className={`${s.slider} ${bar.volumeSlider}`}
        classNames={{ thumb: s.thumb }}
        style={SLIDER_VARS}
        size={4}
        thumbSize={12}
        color="#fff"
        radius="xl"
        min={0}
        max={100}
        value={isMuted ? 0 : volume}
        onChange={setVolume}
        label={null}
        thumbLabel={PLAYER_TEXT.volume}
      />
    </div>
  );
}
