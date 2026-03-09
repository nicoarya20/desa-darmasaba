/**
 * Music Context Compatibility Layer
 *
 * Wrapper untuk backward compatibility dengan kode yang sudah menggunakan useMusic
 * Menggunakan Valtio state di belakang layar
 */

'use client';

import { useSnapshot } from 'valtio';
import { publicMusicState, usePublicMusic } from '@/state/public/publicMusicState';

// Export MusicProvider dari file terpisah
export { MusicProvider } from './MusicProvider';

// Export compatibility hook yang sama dengan Context API
export const useMusic = () => {
  const music = usePublicMusic();

  return {
    ...music,
    // Tambahkan loadMusikData sebagai method reference
    loadMusikData: publicMusicState.loadMusikData,
  };
};

// Re-export types
export type { Musik } from '@/state/public/publicMusicState';

// Helper untuk mendapatkan snapshot tanpa subscribtion
export const getMusicState = () => {
  return publicMusicState;
};
