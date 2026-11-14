'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { MUSIC_TEXT } from './music.text';
import { computeNextIndex, computePrevAction } from './musicNavigation';
import type { Musik } from './music.types';
import { useAudioElement, type AudioHandlers } from './useAudioElement';
import { useMusicLibraryLoader } from './useMusicLibraryLoader';
import { usePlayQueue } from './usePlayQueue';
import { useRecentlyPlayed } from './useRecentlyPlayed';
import { DEFAULT_VOLUME, useVolume } from './useVolume';

export type { Musik };

const NOOP_HANDLERS: AudioHandlers = {
  onLoadedMetadata: () => {},
  onTimeUpdate: () => {},
  onSeeked: () => {},
  onPlay: () => {},
  onPause: () => {},
  onEnded: () => {},
  onError: () => {},
};

/** Mesin pemutar Musik Desa: pustaka, lagu saat ini, transport, antrean, riwayat, dan volume. */
export function useAudioEngine() {
  const { musikData, isLoading, loadMusikData } = useMusicLibraryLoader();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Musik | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const handlersRef = useRef<AudioHandlers>(NOOP_HANDLERS);
  const isSeekingRef = useRef(false);
  const audioRef = useAudioElement(handlersRef, DEFAULT_VOLUME);
  const { volume, isMuted, setVolume, toggleMute } = useVolume(audioRef);

  const queue = usePlayQueue(musikData, currentSong);
  const { recentlyPlayed, markPending, commitPending } = useRecentlyPlayed(musikData);

  const playSong = useCallback(
    (song: Musik) => {
      const audio = audioRef.current;
      if (!audio) return;

      const songIndex = musikData.findIndex((m) => m.id === song.id);
      setCurrentSongIndex(songIndex);
      setCurrentSong(song);
      setCurrentTime(0);
      setDuration(0);
      markPending(null);

      if (!song?.audioFile?.link) {
        audio.pause();
        audio.removeAttribute('src');
        toast.info(MUSIC_TEXT.noAudio);
        return;
      }

      markPending(song.id);
      audio.src = song.audioFile.link;
      audio.load();
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        toast.error(MUSIC_TEXT.playFailed);
      });
    },
    [audioRef, musikData, markPending]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (!currentSong.audioFile?.link) {
      toast.info(MUSIC_TEXT.noAudio);
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        toast.error(MUSIC_TEXT.playFailed);
      });
    }
  }, [audioRef, isPlaying, currentSong]);

  const { orderLength, currentOrderIndex, isPlayableAt, songAt } = queue;

  // Mengikuti urutan putar (acak/pustaka) dan melewati lagu tanpa audio.
  const playNext = useCallback(() => {
    const nextSong = songAt(computeNextIndex(currentOrderIndex, orderLength, isPlayableAt));
    if (nextSong) {
      playSong(nextSong);
    } else if (orderLength > 0) {
      toast.info(MUSIC_TEXT.noPlayable);
    }
  }, [currentOrderIndex, orderLength, isPlayableAt, songAt, playSong]);

  const playPrev = useCallback(() => {
    const action = computePrevAction(currentOrderIndex, orderLength, currentTime, isPlayableAt);
    if (action.type === 'restart') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      return;
    }
    const prevSong = songAt(action.index);
    if (prevSong) {
      playSong(prevSong);
    } else if (orderLength > 0) {
      toast.info(MUSIC_TEXT.noPlayable);
    }
  }, [audioRef, currentOrderIndex, orderLength, currentTime, isPlayableAt, songAt, playSong]);

  // Visual-only update while dragging the seek slider (tidak menyentuh audio element)
  const seekPreview = useCallback((time: number) => {
    isSeekingRef.current = true;
    setCurrentTime(time);
  }, []);

  // Commit posisi ke audio element; isSeekingRef di-reset oleh event native 'seeked'
  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      isSeekingRef.current = true;
      audio.currentTime = time;
      setCurrentTime(time);
    },
    [audioRef]
  );

  const toggleRepeat = useCallback(() => setIsRepeat((prev) => !prev), []);
  const togglePlayer = useCallback(() => setIsPlayerOpen((prev) => !prev), []);

  // Penangan event audio selalu versi terbaru (useAudioElement membacanya lewat ref).
  useEffect(() => {
    handlersRef.current = {
      onLoadedMetadata: (audio) => setDuration(Number.isFinite(audio.duration) ? Math.floor(audio.duration) : 0),
      onTimeUpdate: (audio) => {
        if (!isSeekingRef.current) setCurrentTime(Math.floor(audio.currentTime));
      },
      onSeeked: (audio) => {
        isSeekingRef.current = false;
        setCurrentTime(Math.floor(audio.currentTime));
      },
      onPlay: () => {
        setIsPlaying(true);
        commitPending();
      },
      onPause: () => setIsPlaying(false),
      onEnded: (audio) => {
        if (isRepeat) {
          audio.currentTime = 0;
          audio.play().catch((err) => console.error('Error repeating audio:', err));
        } else {
          playNext();
        }
      },
      onError: () => {
        setIsPlaying(false);
        toast.error(MUSIC_TEXT.fileBroken);
      },
    };
  });

  return {
    isPlaying,
    currentSong,
    currentSongIndex,
    musikData,
    currentTime,
    duration,
    volume,
    isMuted,
    isRepeat,
    isShuffle: queue.isShuffle,
    isLoading,
    isPlayerOpen,
    upNext: queue.upNext,
    recentlyPlayed,
    playSong,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    seekPreview,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle: queue.toggleShuffle,
    togglePlayer,
    loadMusikData,
  };
}
