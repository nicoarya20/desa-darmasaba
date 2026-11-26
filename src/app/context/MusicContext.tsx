'use client';

import { createContext, useContext, useSyncExternalStore, ReactNode } from 'react';
import { ZERO_TIME, type MusicTime, type MusicTimeStore } from './music/musicTime';
import type { RepeatMode } from './music/repeatMode';
import { useAudioEngine, type Musik } from './music/useAudioEngine';

export type { Musik, RepeatMode };

interface MusicContextType {
  // State
  isPlaying: boolean;
  currentSong: Musik | null;
  musikData: Musik[];
  volume: number;
  isMuted: boolean;
  /** Mati → berhenti setelah lagu terakhir; semua → melingkar; satu → ulangi lagu saat ini. */
  repeatMode: RepeatMode;
  /** Ada lagu berikutnya yang bisa diputar (ulang mati di ujung urutan → false). */
  hasNext: boolean;
  isShuffle: boolean;
  /** Pustaka belum siap: true sejak awal (sebelum diminta) sampai muat pertama/ulang selesai. */
  isLoading: boolean;
  /** Muat pustaka terakhir gagal (HTTP/`success:false`/jaringan). Coba lagi lewat `loadMusikData()`. */
  loadError: boolean;
  /** Lagu setelah lagu saat ini sesuai urutan putar (acak/pustaka), melingkar kecuali ulang mati; tanpa lagu → seluruh urutan. */
  upNext: Musik[];
  /** Riwayat "Baru diputar": terbaru dulu, unik, maks 20 (localStorage). */
  recentlyPlayed: Musik[];

  // Actions
  playSong: (song: Musik) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  /** Hentikan lagu: jeda, posisi ke 0, sumber audio dilepas, currentSong null (pemutar situs hilang). */
  stop: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  /** Siklus mode ulang: mati → semua → satu → mati. */
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  /** Muat (ulang) pustaka: isLoading true & loadError false selama memuat. */
  loadMusikData: () => Promise<void>;
  /**
   * Minta pustaka bila belum pernah dimuat (aman dipanggil berulang; tidak fetch ulang). Pustaka tidak dimuat saat
   * mount supaya halaman selain Musik tidak membayar fetch-nya; dipanggil oleh aplikasi Musik Desa saat dibuka.
   */
  ensureMusikData: () => void;
}

interface MusicTimeContextType {
  store: MusicTimeStore;
  /** Pindah posisi audio (lepas slider). */
  seek: (time: number) => void;
  /** Pratinjau posisi saat slider diseret; tidak menyentuh audio. */
  seekPreview: (time: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);
const MusicTimeContext = createContext<MusicTimeContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const { music, time } = useAudioEngine();

  return (
    <MusicContext.Provider value={music}>
      <MusicTimeContext.Provider value={time}>{children}</MusicTimeContext.Provider>
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}

const serverTime = () => ZERO_TIME;

/**
 * Posisi & durasi lagu saat ini + seek. Dipisah dari useMusic(): hanya komponen yang memanggil hook ini
 * yang render ulang pada 'timeupdate'.
 */
export function useMusicTime(): MusicTime & Pick<MusicTimeContextType, 'seek' | 'seekPreview'> {
  const context = useContext(MusicTimeContext);
  if (context === undefined) {
    throw new Error('useMusicTime must be used within a MusicProvider');
  }
  const { store, seek, seekPreview } = context;
  const { currentTime, duration } = useSyncExternalStore(store.subscribe, store.getSnapshot, serverTime);
  return { currentTime, duration, seek, seekPreview };
}
