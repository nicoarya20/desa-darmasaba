'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { computeNextIndex, computePrevAction } from './musicNavigation';

const DEFAULT_VOLUME = 70;

interface MusicFile {
  id: string;
  name: string;
  realName: string;
  path: string;
  mimeType: string;
  link: string;
}

export interface Musik {
  id: string;
  judul: string;
  artis: string;
  deskripsi: string | null;
  durasi: string;
  genre: string | null;
  tahunRilis: number | null;
  audioFile: MusicFile | null;
  coverImage: MusicFile | null;
  isActive: boolean;
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
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef(false);
  const isRepeatRef = useRef(false);
  const playNextRef = useRef<() => void>(() => {});

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  const loadMusikData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/desa/musik/find-many?page=1&limit=50');
      const data = await res.json();
      if (data.success && data.data) {
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
    const handlePlay = () => setIsPlaying(true);
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
  }, [loadMusikData]);

  const playSong = useCallback(
    (song: Musik) => {
      const audio = audioRef.current;
      if (!audio) return;

      const songIndex = musikData.findIndex((m) => m.id === song.id);
      setCurrentSongIndex(songIndex);
      setCurrentSong(song);
      setCurrentTime(0);
      setDuration(0);

      if (!song?.audioFile?.link) {
        audio.pause();
        audio.removeAttribute('src');
        toast.info('Audio lagu ini belum tersedia.');
        return;
      }

      audio.src = song.audioFile.link;
      audio.load();
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        toast.error('Gagal memutar lagu, coba lagi.');
      });
    },
    [musikData]
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

  const playNext = useCallback(() => {
    const nextIndex = computeNextIndex(currentSongIndex, musikData.length, isShuffle);
    const nextSong = musikData[nextIndex];
    if (nextSong) {
      playSong(nextSong);
    }
  }, [musikData, isShuffle, currentSongIndex, playSong]);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  const playPrev = useCallback(() => {
    const action = computePrevAction(currentSongIndex, musikData.length, currentTime);
    if (action.type === 'restart') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      return;
    }
    const prevSong = musikData[action.index];
    if (prevSong) {
      playSong(prevSong);
    }
  }, [musikData, currentSongIndex, currentTime, playSong]);

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
  const toggleShuffle = useCallback(() => setIsShuffle((prev) => !prev), []);
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
    isShuffle,
    isLoading,
    isPlayerOpen,
    playSong,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    seekPreview,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    togglePlayer,
    loadMusikData,
  };
}
