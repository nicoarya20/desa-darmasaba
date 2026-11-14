'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { errorName, playAudio } from './audioPlayback';
import { MUSIC_TEXT } from './music.text';
import { computeNextIndex, computePrevAction } from './musicNavigation';
import type { Musik } from './music.types';
import { hasAudio } from './playable';
import { useAudioElement, type AudioHandlers } from './useAudioElement';
import { useMusicLibraryLoader } from './useMusicLibraryLoader';
import { usePlayQueue } from './usePlayQueue';
import { useRecentlyPlayed } from './useRecentlyPlayed';
import { DEFAULT_VOLUME, useVolume } from './useVolume';

export type { Musik };

/** toastId react-toastify: toast yang sama tidak menumpuk saat dipicu beruntun (mis. beberapa file rusak). */
const TOAST_ID = { noAudio: 'musik-no-audio', playFailed: 'musik-play-failed', fileBroken: 'musik-file-broken' } as const;

const NOOP_HANDLERS: AudioHandlers = {
  onLoadedMetadata: () => {},
  onTimeUpdate: () => {},
  onSeeked: () => {},
  onPlay: () => {},
  onPlaying: () => {},
  onPause: () => {},
  onEnded: () => {},
  onError: () => {},
  onSourceReset: () => {},
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
  // Lagu yang file audionya gagal dimuat (404/rusak) di pustaka saat ini: dilewati next/prev & lompat otomatis.
  const brokenIdsRef = useRef(new Set<string>());
  const audioRef = useAudioElement(handlersRef, DEFAULT_VOLUME);
  const { volume, isMuted, setVolume, toggleMute } = useVolume(audioRef);

  useEffect(() => {
    brokenIdsRef.current = new Set();
  }, [musikData]);
  const isPlayable = useCallback((song: Musik) => hasAudio(song) && !brokenIdsRef.current.has(song.id), []);
  const queue = usePlayQueue(musikData, currentSong, isPlayable);
  const { recentlyPlayed, markPending, commitPending } = useRecentlyPlayed(musikData);

  const reportPlayFailure = useCallback((error: unknown) => {
    console.error(`Musik Desa: audio gagal diputar (${errorName(error)}).`);
    toast.error(MUSIC_TEXT.playFailed, { toastId: TOAST_ID.playFailed });
  }, []);

  const playSong = useCallback(
    (song: Musik) => {
      const audio = audioRef.current;
      if (!audio) return;
      // Lagu tanpa audio: cukup diberi tahu. Lagu yang sedang berbunyi, bar, dan antrean tidak berubah.
      if (!hasAudio(song)) {
        toast.info(MUSIC_TEXT.noAudio, { toastId: TOAST_ID.noAudio });
        return;
      }

      isSeekingRef.current = false;
      setCurrentSongIndex(musikData.findIndex((m) => m.id === song.id));
      setCurrentSong(song);
      setCurrentTime(0);
      setDuration(0);
      markPending(song.id);
      audio.src = song.audioFile.link;
      audio.load();
      playAudio(audio, reportPlayFailure);
    },
    [audioRef, musikData, markPending, reportPlayFailure]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio(currentSong)) return;
    // File sebelumnya gagal dimuat → muat ulang (coba lagi), bukan play() pada sumber yang rusak.
    if (audio.error) playSong(currentSong);
    else if (audio.paused) playAudio(audio, reportPlayFailure);
    else audio.pause();
  }, [audioRef, currentSong, playSong, reportPlayFailure]);

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
      // Tanpa sumber, 'seeked' tidak pernah datang: jangan biarkan progres membeku menunggu.
      if (!audio.getAttribute('src')) {
        isSeekingRef.current = false;
        return;
      }
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
      onPlay: () => setIsPlaying(true),
      // 'playing' (bukan 'play'): file rusak memicu 'play' tapi tidak pernah berbunyi, jadi tidak masuk riwayat.
      onPlaying: () => commitPending(),
      onPause: () => setIsPlaying(false),
      onEnded: (audio) => {
        if (isRepeat) {
          audio.currentTime = 0;
          playAudio(audio, reportPlayFailure);
        } else {
          playNext();
        }
      },
      onError: (audio) => {
        // 'error' tanpa sumber (setelah sumber dilepas) bukan file rusak.
        if (!currentSong || !audio.getAttribute('src')) return;
        setIsPlaying(false);
        console.error(`Musik Desa: file audio lagu ${currentSong.id} gagal dimuat (MediaError ${audio.error?.code ?? '?'}).`);
        toast.error(MUSIC_TEXT.fileBroken, { toastId: TOAST_ID.fileBroken });
        // Lompat ke lagu berikutnya yang bisa diputar. Lagu rusak dicatat dulu, jadi pencarian tidak pernah
        // kembali ke sini; bila semua rusak hasilnya -1 dan pemutar berhenti (tanpa putaran tanpa akhir).
        brokenIdsRef.current.add(currentSong.id);
        const next = songAt(computeNextIndex(currentOrderIndex, orderLength, isPlayableAt));
        if (next) playSong(next);
      },
      onSourceReset: () => {
        isSeekingRef.current = false;
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
