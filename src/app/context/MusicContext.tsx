/**
 * Music Context - Legacy Compatibility Layer
 *
 * DEPRECATED: File ini dipertahankan untuk backward compatibility.
 * Gunakan `useMusic` dari `@/app/context/MusicContext` (file .ts) untuk state management baru.
 *
 * Menggunakan Valtio state management di belakang layar untuk konsistensi.
 * Audio handling dipindahkan ke MusicProvider.tsx untuk menghindari duplikasi
 */

'use client';


// Re-export MusicProvider dari file terpisah (satu-satunya tempat audio handling)
export { MusicProvider } from './MusicProvider';
import { usePublicMusic } from '../../state/public/publicMusicState.ts';
// Hook untuk backward compatibility
export function useMusic() {
  return usePublicMusic();
}
