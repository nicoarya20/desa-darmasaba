import { RefObject } from 'react';

/**
 * Setup audio progress interval
 * Updates current time every second when playing
 */
export const setupProgressInterval = (
  audioRef: RefObject<HTMLAudioElement | null>,
  isPlaying: boolean,
  setCurrentTime: (time: number) => void,
  progressIntervalRef: RefObject<number | null>
) => {
  if (isPlaying && audioRef.current) {
    progressIntervalRef.current = window.setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(Math.floor(audioRef.current.currentTime));
      }
    }, 1000);
  } else {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }

  // Cleanup function
  return () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };
};

/**
 * Clear progress interval
 */
export const clearProgressInterval = (
  progressIntervalRef: RefObject<number | null>
) => {
  if (progressIntervalRef.current) {
    clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = null;
  }
};

/**
 * Handle audio metadata loaded
 * Sets duration from actual audio file
 */
export const handleAudioMetadataLoaded = (
  audioRef: RefObject<HTMLAudioElement | null>,
  setDuration: (duration: number) => void
) => {
  if (audioRef.current) {
    setDuration(Math.floor(audioRef.current.duration));
  }
};

/**
 * Handle audio error
 */
export const handleAudioError = (
  error: Event,
  audioRef: RefObject<HTMLAudioElement | null>,
  setIsPlaying: (playing: boolean) => void
) => {
  console.error('Audio error:', error);
  setIsPlaying(false);
  if (audioRef.current) {
    audioRef.current.pause();
  }
};

/**
 * Preload audio
 * Can be used to preload next song
 */
export const preloadAudio = (
  audioRef: RefObject<HTMLAudioElement | null>,
  src: string
) => {
  if (audioRef.current) {
    audioRef.current.src = src;
    audioRef.current.load();
  }
};

/**
 * Stop audio and reset state
 */
export const stopAudio = (
  audioRef: RefObject<HTMLAudioElement | null>,
  setIsPlaying: (playing: boolean) => void,
  setCurrentTime: (time: number) => void
) => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }
  setIsPlaying(false);
  setCurrentTime(0);
};
