'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { errorName, playAudio } from './audioPlayback';
import { MUSIC_TEXT } from './music.text';
import { computeNextIndex, computePrevAction } from './musicNavigation';
import type { Musik } from './music.types';
import { hasAudio } from './playable';
import { nextRepeatMode, wrapsAround, type RepeatMode } from './repeatMode';
import { useAudioElement, type AudioHandlers } from './useAudioElement';
import { useMusicLibraryLoader } from './useMusicLibraryLoader';
import { usePlaybackTime } from './usePlaybackTime';
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

/**
 * Mesin pemutar Musik Desa: pustaka, lagu saat ini, transport, antrean, riwayat, dan volume (`music`),
 * plus waktu pemutaran terpisah (`time`) supaya 'timeupdate' tidak me-render semua konsumen useMusic().
 */
export function useAudioEngine() {
  const { musikData, isLoading, loadError, loadMusikData, ensureMusikData } = useMusicLibraryLoader();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Musik | null>(null);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const wrap = wrapsAround(repeatMode);

  const handlersRef = useRef<AudioHandlers>(NOOP_HANDLERS);
  // Lagu yang file audionya gagal dimuat (404/rusak) di pustaka saat ini: dilewati next/prev & lompat otomatis.
  const brokenIdsRef = useRef(new Set<string>());
  const audioRef = useAudioElement(handlersRef, DEFAULT_VOLUME);
  const { volume, isMuted, setVolume, toggleMute } = useVolume(audioRef);
  const { time, timeHandlers, resetTime, restart } = usePlaybackTime(audioRef);

  useEffect(() => {
    brokenIdsRef.current = new Set();
  }, [musikData]);
  const isPlayable = useCallback((song: Musik) => hasAudio(song) && !brokenIdsRef.current.has(song.id), []);
  const queue = usePlayQueue(musikData, currentSong, isPlayable, wrap);
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

      resetTime();
      setCurrentSong(song);
      markPending(song.id);
      audio.src = song.audioFile.link;
      audio.load();
      playAudio(audio, reportPlayFailure);
    },
    [audioRef, markPending, reportPlayFailure, resetTime]
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

  // Lagu berikutnya yang bisa diputar di urutan putar (acak/pustaka); mode ulang mati berhenti di ujung.
  const findNext = useCallback(
    () => songAt(computeNextIndex(currentOrderIndex, orderLength, isPlayableAt, wrap)),
    [currentOrderIndex, orderLength, isPlayableAt, songAt, wrap]
  );
  const hasNext = findNext() !== undefined;

  const playNext = useCallback(() => {
    const nextSong = findNext();
    if (nextSong) playSong(nextSong);
    // Ujung urutan saat ulang mati bukan "tidak ada audio": tombol Berikutnya memang nonaktif.
    else if (wrap && orderLength > 0) toast.info(MUSIC_TEXT.noPlayable);
  }, [findNext, playSong, wrap, orderLength]);

  const playPrev = useCallback(() => {
    const position = audioRef.current?.currentTime ?? 0;
    const action = computePrevAction(currentOrderIndex, orderLength, position, isPlayableAt, wrap);
    if (action.type === 'restart') {
      restart();
      return;
    }
    const prevSong = songAt(action.index);
    if (prevSong) {
      playSong(prevSong);
    } else if (orderLength > 0) {
      toast.info(MUSIC_TEXT.noPlayable);
    }
  }, [audioRef, currentOrderIndex, orderLength, isPlayableAt, songAt, playSong, restart, wrap]);

  const cycleRepeat = useCallback(() => setRepeatMode(nextRepeatMode), []);

  // Penangan event audio selalu versi terbaru (useAudioElement membacanya lewat ref).
  useEffect(() => {
    handlersRef.current = {
      ...timeHandlers,
      onPlay: () => setIsPlaying(true),
      // 'playing' (bukan 'play'): file rusak memicu 'play' tapi tidak pernah berbunyi, jadi tidak masuk riwayat.
      onPlaying: () => commitPending(),
      onPause: () => setIsPlaying(false),
      onEnded: (audio) => {
        if (repeatMode === 'one') {
          audio.currentTime = 0;
          playAudio(audio, reportPlayFailure);
          return;
        }
        const nextSong = findNext();
        if (nextSong) playSong(nextSong);
        else setIsPlaying(false); // ulang mati: berhenti setelah lagu terakhir urutan putar
      },
      onError: (audio) => {
        // 'error' tanpa sumber (setelah sumber dilepas) bukan file rusak.
        if (!currentSong || !audio.getAttribute('src')) return;
        setIsPlaying(false);
        console.error(`Musik Desa: file audio lagu ${currentSong.id} gagal dimuat (MediaError ${audio.error?.code ?? '?'}).`);
        toast.error(MUSIC_TEXT.fileBroken, { toastId: TOAST_ID.fileBroken });
        // Lompat ke lagu berikutnya yang bisa diputar. Lagu rusak dicatat dulu, jadi pencarian tidak pernah
        // kembali ke sini; bila semua rusak (atau ujung urutan saat ulang mati) pemutar berhenti.
        brokenIdsRef.current.add(currentSong.id);
        const nextSong = findNext();
        if (nextSong) playSong(nextSong);
      },
    };
  });

  const { isShuffle, upNext, toggleShuffle } = queue;
  // Nilai context stabil: konsumen useMusic() hanya render ulang bila salah satu nilai ini berubah.
  const music = useMemo(
    () => ({
      isPlaying,
      currentSong,
      musikData,
      volume,
      isMuted,
      repeatMode,
      hasNext,
      isShuffle,
      isLoading,
      loadError,
      upNext,
      recentlyPlayed,
      playSong,
      togglePlayPause,
      playNext,
      playPrev,
      setVolume,
      toggleMute,
      cycleRepeat,
      toggleShuffle,
      loadMusikData,
      ensureMusikData,
    }),
    [
      isPlaying,
      currentSong,
      musikData,
      volume,
      isMuted,
      repeatMode,
      hasNext,
      isShuffle,
      isLoading,
      loadError,
      upNext,
      recentlyPlayed,
      playSong,
      togglePlayPause,
      playNext,
      playPrev,
      setVolume,
      toggleMute,
      cycleRepeat,
      toggleShuffle,
      loadMusikData,
      ensureMusikData,
    ]
  );

  return { music, time };
}
