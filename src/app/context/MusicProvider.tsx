/**
 * Music Provider Component
 *
 * Wrapper component untuk music player menggunakan Valtio state
 * Menyediakan audio element dan logic yang membutuhkan React lifecycle
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { publicMusicState } from '@/state/public/publicMusicState';
import { useSnapshot } from 'valtio';

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const isChangingSongRef = useRef(false);
  
  // Subscribe to Valtio state changes
  const snapshot = useSnapshot(publicMusicState);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'metadata';
    audioRef.current.volume = publicMusicState.volume / 100;

    // Event listeners
    audioRef.current.addEventListener('loadedmetadata', () => {
      publicMusicState.duration = Math.floor(audioRef.current!.duration);
      console.log('[MusicProvider] Duration loaded:', publicMusicState.duration);
    });

    // Update currentTime on timeupdate event - this is the key fix!
    audioRef.current.addEventListener('timeupdate', () => {
      const currentTime = Math.floor(audioRef.current!.currentTime);
      // Only update if changed to prevent unnecessary re-renders
      if (currentTime !== publicMusicState.currentTime) {
        publicMusicState.currentTime = currentTime;
      }
    });

    audioRef.current.addEventListener('ended', () => {
      if (publicMusicState.isRepeat) {
        audioRef.current!.currentTime = 0;
        audioRef.current!.play().catch(console.error);
      } else {
        publicMusicState.playNext();
      }
    });

    // Handle play/pause errors gracefully
    audioRef.current.addEventListener('error', (e) => {
      console.warn('[MusicProvider] Audio error:', e);
      publicMusicState.isPlaying = false;
    });

    // Load initial data
    publicMusicState.loadMusikData();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle song changes - load new audio source
  useEffect(() => {
    if (!audioRef.current) return;

    const song = snapshot.currentSong;
    if (!song?.audioFile?.link) {
      console.warn('[MusicProvider] No song or audio link:', song);
      return;
    }

    console.log('[MusicProvider] Loading song:', song.judul, song.audioFile.link);

    // Set flag to prevent race conditions
    isChangingSongRef.current = true;

    // Pause current playback
    audioRef.current.pause();
    audioRef.current.src = '';
    audioRef.current.load();

    // Load new song
    audioRef.current.src = song.audioFile.link;
    audioRef.current.load();

    // Wait for audio to be ready before playing
    const handleCanPlay = () => {
      console.log('[MusicProvider] Song can play, isPlaying:', snapshot.isPlaying);
      isChangingSongRef.current = false;

      if (snapshot.isPlaying) {
        audioRef.current!.play().then(() => {
          console.log('[MusicProvider] Song started playing');
        }).catch((err) => {
          // Ignore AbortError - this is expected when changing songs
          if (err.name !== 'AbortError') {
            console.error('[MusicProvider] Error playing audio:', err);
          }
        });
      }
    };

    const handleError = (err: Event) => {
      console.error('[MusicProvider] Error loading audio:', err);
      isChangingSongRef.current = false;
    };

    audioRef.current.addEventListener('canplay', handleCanPlay, { once: true });
    audioRef.current.addEventListener('error', handleError, { once: true });

    // Cleanup
    return () => {
      audioRef.current?.removeEventListener('canplay', handleCanPlay);
      audioRef.current?.removeEventListener('error', handleError);
    };
  }, [snapshot.currentSong, snapshot.currentSongIndex]);

  // Sync play/pause state (only when not changing songs)
  useEffect(() => {
    if (!audioRef.current || !snapshot.currentSong || isChangingSongRef.current) return;

    if (snapshot.isPlaying) {
      audioRef.current.play().catch((err) => {
        // Ignore AbortError - this is expected
        if (err.name !== 'AbortError') {
          console.error('[MusicProvider] Error playing audio:', err);
        }
      });
    } else {
      audioRef.current.pause();
    }
  }, [snapshot.isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    const newVolume = snapshot.isMuted ? 0 : snapshot.volume / 100;
    console.log('[MusicProvider] Volume changed:', snapshot.volume, 'muted:', snapshot.isMuted, 'setting:', newVolume);
    
    audioRef.current.volume = newVolume;
    audioRef.current.muted = snapshot.isMuted;
  }, [snapshot.volume, snapshot.isMuted]);

  // Handle seek - ONLY when user manually seeks (not during normal playback)
  // We don't need to sync currentTime back to audio element during normal playback
  // because timeupdate event handles that automatically

  return (
    <>
      {children}
    </>
  );
}
