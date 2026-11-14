'use client';

import { Slider } from '@mantine/core';
import { IconVolume, IconVolume3 } from '@tabler/icons-react';
import { useMusic } from '@/app/context/MusicContext';
import { SLIDER_FILL, SLIDER_VARS } from './PlayerProgress';
import { PLAYER_TEXT } from './player.text';
import controls from './player-controls.module.css';
import s from './player-progress.module.css';
import bar from './now-playing-bar.module.css';

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
        color={SLIDER_FILL}
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
