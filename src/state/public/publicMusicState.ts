/**
 * Public Music Player State
 * 
 * State management untuk music player di public pages
 * Menggunakan Valtio untuk reactive state
 * 
 * Menggantikan MusicContext dengan Valtio untuk konsistensi
 */

import { proxy, useSnapshot } from 'valtio';

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

export const publicMusicState = proxy<{
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
  error: string | null;
  
  // Actions
  playSong: (song: Musik) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  togglePlayer: () => void;
  loadMusikData: () => Promise<void>;
  reset: () => void;
}>({
  // Initial State
  isPlaying: false,
  currentSong: null,
  currentSongIndex: -1,
  musikData: [],
  currentTime: 0,
  duration: 0,
  volume: 70,
  isMuted: false,
  isRepeat: false,
  isShuffle: false,
  isLoading: true,
  isPlayerOpen: false,
  error: null,
  
  // Actions
  playSong(song: Musik) {
    if (!song?.audioFile?.link) {
      console.warn('[MusicState] No audio file link for song:', song);
      return;
    }

    console.log('[MusicState] Playing song:', song.judul);
    
    const songIndex = publicMusicState.musikData.findIndex(m => m.id === song.id);
    console.log('[MusicState] Song index:', songIndex);
    
    publicMusicState.currentSongIndex = songIndex;
    publicMusicState.currentSong = song;
    publicMusicState.isPlaying = true;
    
    console.log('[MusicState] State updated:', {
      isPlaying: publicMusicState.isPlaying,
      currentSong: publicMusicState.currentSong?.judul,
      currentSongIndex: publicMusicState.currentSongIndex,
    });

    // Audio handling dilakukan di component dengan useEffect
  },
  
  togglePlayPause() {
    publicMusicState.isPlaying = !publicMusicState.isPlaying;
  },
  
  playNext() {
    if (publicMusicState.musikData.length === 0) return;
    
    let nextIndex: number;
    if (publicMusicState.isShuffle) {
      nextIndex = Math.floor(Math.random() * publicMusicState.musikData.length);
    } else {
      nextIndex = (publicMusicState.currentSongIndex + 1) % publicMusicState.musikData.length;
    }
    
    const nextSong = publicMusicState.musikData[nextIndex];
    if (nextSong) {
      publicMusicState.playSong(nextSong);
    }
  },
  
  playPrev() {
    if (publicMusicState.musikData.length === 0) return;
    
    // If more than 3 seconds into song, restart it
    if (publicMusicState.currentTime > 3) {
      publicMusicState.currentTime = 0;
      return;
    }
    
    const prevIndex = publicMusicState.currentSongIndex <= 0 
      ? publicMusicState.musikData.length - 1 
      : publicMusicState.currentSongIndex - 1;
    
    const prevSong = publicMusicState.musikData[prevIndex];
    if (prevSong) {
      publicMusicState.playSong(prevSong);
    }
  },
  
  seek(time: number) {
    publicMusicState.currentTime = time;
  },
  
  setVolume(vol: number) {
    const normalizedVol = Math.max(0, Math.min(100, vol)) / 100;
    const newVolume = Math.max(0, Math.min(100, vol));
    
    console.log('[MusicState] setVolume called:', vol, '->', newVolume, 'normalized:', normalizedVol);
    
    publicMusicState.volume = newVolume;
    publicMusicState.isMuted = normalizedVol === 0;
  },
  
  toggleMute() {
    publicMusicState.isMuted = !publicMusicState.isMuted;
  },
  
  toggleRepeat() {
    publicMusicState.isRepeat = !publicMusicState.isRepeat;
  },
  
  toggleShuffle() {
    publicMusicState.isShuffle = !publicMusicState.isShuffle;
  },
  
  togglePlayer() {
    publicMusicState.isPlayerOpen = !publicMusicState.isPlayerOpen;
  },
  
  async loadMusikData() {
    try {
      publicMusicState.isLoading = true;
      publicMusicState.error = null;

      console.log('[MusicState] Loading musik data...');
      
      const res = await fetch('/api/desa/musik/find-many?page=1&limit=50');
      const data = await res.json();

      console.log('[MusicState] API response:', data);

      if (data.success && data.data) {
        const activeMusik = data.data.filter((m: Musik) => m.isActive);
        console.log('[MusicState] Loaded', activeMusik.length, 'active songs');
        publicMusicState.musikData = activeMusik;
        
        // Log first song for debugging
        if (activeMusik.length > 0) {
          console.log('[MusicState] First song:', {
            judul: activeMusik[0].judul,
            hasAudioFile: !!activeMusik[0].audioFile,
            audioLink: activeMusik[0].audioFile?.link,
          });
        }
      }
    } catch (error) {
      console.error('[MusicState] Error fetching musik:', error);
      publicMusicState.error = error instanceof Error ? error.message : 'Failed to load music';
    } finally {
      publicMusicState.isLoading = false;
    }
  },
  
  reset() {
    publicMusicState.isPlaying = false;
    publicMusicState.currentSong = null;
    publicMusicState.currentSongIndex = -1;
    publicMusicState.currentTime = 0;
    publicMusicState.duration = 0;
    publicMusicState.isPlayerOpen = false;
    publicMusicState.error = null;
  },
});

// Helper hook untuk React components
export const usePublicMusic = () => {
  const snapshot = useSnapshot(publicMusicState);
  return {
    ...snapshot,
    playSong: publicMusicState.playSong,
    togglePlayPause: publicMusicState.togglePlayPause,
    playNext: publicMusicState.playNext,
    playPrev: publicMusicState.playPrev,
    seek: publicMusicState.seek,
    setVolume: publicMusicState.setVolume,
    toggleMute: publicMusicState.toggleMute,
    toggleRepeat: publicMusicState.toggleRepeat,
    toggleShuffle: publicMusicState.toggleShuffle,
    togglePlayer: publicMusicState.togglePlayer,
    loadMusikData: publicMusicState.loadMusikData,
    reset: publicMusicState.reset,
  };
};

export default publicMusicState;
