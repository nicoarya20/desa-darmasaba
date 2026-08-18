'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAudioEngine, type Musik } from './music/useAudioEngine';

export type { Musik };

interface MusicContextType {
  // State
  isPlaying: boolean;
  currentSong: Musik | null;
  currentSongIndex: number;
  musikData: Musik[];
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isRepeat: boolean;
  isShuffle: boolean;
  isLoading: boolean;
  isPlayerOpen: boolean;

  // Actions
  playSong: (song: Musik) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  seekPreview: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  togglePlayer: () => void;
  loadMusikData: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const engine = useAudioEngine();

  return (
    <MusicContext.Provider value={engine}>{children}</MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
