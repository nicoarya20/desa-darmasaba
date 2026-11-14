'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { computeNextIndex, computePrevAction } from './musicNavigation';
import type { Musik } from './music.types';
import { usePlayQueue } from './usePlayQueue';
import { useRecentlyPlayed } from './useRecentlyPlayed';

export type { Musik };

const DEFAULT_VOLUME = 70;
/** Batas muat pustaka sekali jalan (endpoint dipaginasi, klien memuat satu halaman). */
const MUSIK_LOAD_LIMIT = 50;
const NO_PLAYABLE_MESSAGE = 'Belum ada lagu dengan audio yang bisa diputar.';

/** MITIGASI: pustaka hanya memuat MUSIK_LOAD_LIMIT lagu pertama; beri tahu bila server punya lebih. */
function warnTruncated(total: unknown, loaded: number) {
  const count = Number(total);
  if (Number.isFinite(count) && count > loaded) {
    console.warn(`Musik Desa: ${count} lagu di server, hanya ${loaded} pertama yang dimuat (batas ${MUSIK_LOAD_LIMIT}).`);
  }
}

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Musik | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [musikData, setMusikData] = useState<Musik[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef(false);
  const isRepeatRef = useRef(false);
  const playNextRef = useRef<() => void>(() => {});

  const queue = usePlayQueue(musikData, currentSong);
  const { recentlyPlayed, markPending, commitPending } = useRecentlyPlayed(musikData);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  const loadMusikData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/desa/musik/find-many?page=1&limit=${MUSIK_LOAD_LIMIT}`);
      const data = await res.json();
      if (data.success && data.data) {
        warnTruncated(data.total, data.data.length);
        const activeMusik = data.data.filter((m: Musik) => m.isActive);
        setMusikData(activeMusik);
      }
    } catch (error) {
      console.error('Error fetching musik:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Init audio element + wire native events as the single source of truth
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = DEFAULT_VOLUME / 100;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? Math.floor(audio.duration) : 0);
    };
    const handleTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setCurrentTime(Math.floor(audio.currentTime));
      }
    };
    const handleSeeked = () => {
      isSeekingRef.current = false;
      setCurrentTime(Math.floor(audio.currentTime));
    };
    const handlePlay = () => {
      setIsPlaying(true);
      commitPending();
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      // Ref supaya selalu memanggil playNext versi terbaru, bukan closure dari mount pertama
      if (isRepeatRef.current) {
        audio.currentTime = 0;
        audio.play().catch((err) => console.error('Error repeating audio:', err));
      } else {
        playNextRef.current();
      }
    };
    const handleError = () => {
      setIsPlaying(false);
      toast.error('Gagal memutar lagu, file audio bermasalah.');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('seeked', handleSeeked);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    loadMusikData();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('seeked', handleSeeked);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
    };
  }, [loadMusikData, commitPending]);

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
        toast.info('Audio lagu ini belum tersedia.');
        return;
      }

      markPending(song.id);
      audio.src = song.audioFile.link;
      audio.load();
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        toast.error('Gagal memutar lagu, coba lagi.');
      });
    },
    [musikData, markPending]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (!currentSong.audioFile?.link) {
      toast.info('Audio lagu ini belum tersedia.');
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        toast.error('Gagal memutar lagu, coba lagi.');
      });
    }
  }, [isPlaying, currentSong]);

  const { orderLength, currentOrderIndex, isPlayableAt, songAt } = queue;

  // Mengikuti urutan putar (acak/pustaka) dan melewati lagu tanpa audio.
  const playNext = useCallback(() => {
    const nextSong = songAt(computeNextIndex(currentOrderIndex, orderLength, isPlayableAt));
    if (nextSong) {
      playSong(nextSong);
    } else if (orderLength > 0) {
      toast.info(NO_PLAYABLE_MESSAGE);
    }
  }, [currentOrderIndex, orderLength, isPlayableAt, songAt, playSong]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

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
      toast.info(NO_PLAYABLE_MESSAGE);
    }
  }, [currentOrderIndex, orderLength, currentTime, isPlayableAt, songAt, playSong]);

  // Visual-only update while dragging the seek slider (tidak menyentuh audio element)
  const seekPreview = useCallback((time: number) => {
    isSeekingRef.current = true;
    setCurrentTime(time);
  }, []);

  // Commit posisi ke audio element; isSeekingRef di-reset oleh event native 'seeked'
  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    isSeekingRef.current = true;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const normalizedVol = Math.max(0, Math.min(100, vol)) / 100;
    audio.volume = normalizedVol;
    // toggleMute memasang audio.muted; tanpa ini menggeser volume setelah bisu tetap senyap walau UI "tidak bisu".
    audio.muted = normalizedVol === 0;
    setVolumeState(Math.max(0, Math.min(100, vol)));
    setIsMuted(normalizedVol === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !isMuted;
    audio.muted = newMuted;
    setIsMuted(newMuted);
    if (newMuted && volume > 0) {
      audio.volume = 0;
    } else if (!newMuted && volume > 0) {
      audio.volume = volume / 100;
    }
  }, [isMuted, volume]);

  const toggleRepeat = useCallback(() => setIsRepeat((prev) => !prev), []);
  const togglePlayer = useCallback(() => setIsPlayerOpen((prev) => !prev), []);

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
