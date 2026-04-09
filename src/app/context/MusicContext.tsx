'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

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
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  togglePlayer: () => void;
  loadMusikData: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Musik | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [musikData, setMusikData] = useState<Musik[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const isRepeatRef = useRef(false); // Ref untuk avoid stale closure

  // Sync ref dengan state
  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  // Load musik data
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

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'metadata';

    // Event listeners
    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(Math.floor(audioRef.current!.duration));
    });

    audioRef.current.addEventListener('ended', () => {
      // Gunakan ref untuk avoid stale closure
      if (isRepeatRef.current) {
        audioRef.current!.currentTime = 0;
        audioRef.current!.play();
      } else {
        playNext();
      }
    });

    // Load initial data
    loadMusikData();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- playNext is intentionally not in deps to avoid circular dependency
  }, [loadMusikData]); // Remove isRepeat dari deps karena sudah pakai ref

  // Update time with requestAnimationFrame for smooth progress
  const updateTime = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused && !isSeekingRef.current) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateTime]);

  // Play song
  const playSong = useCallback(
    (song: Musik) => {
      if (!song?.audioFile?.link || !audioRef.current) return;

      const songIndex = musikData.findIndex(m => m.id === song.id);
      setCurrentSongIndex(songIndex);
      setCurrentSong(song);
      setIsPlaying(true);

      audioRef.current.src = song.audioFile.link;
      audioRef.current.load();
      audioRef.current
        .play()
        .catch((err) => console.error('Error playing audio:', err));
    },
    [musikData]
  );

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Error playing audio:', err));
    }
  }, [isPlaying, currentSong]);

  // Play next
  const playNext = useCallback(() => {
    if (musikData.length === 0) return;

    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * musikData.length);
    } else {
      nextIndex = (currentSongIndex + 1) % musikData.length;
    }
    const nextSong = musikData[nextIndex];
    if (nextSong) {
      playSong(nextSong);
    }
  }, [musikData, isShuffle, currentSongIndex, playSong]);

  // Play previous
  const playPrev = useCallback(() => {
    if (musikData.length === 0) return;

    // If more than 3 seconds into song, restart it
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const prevIndex =
      currentSongIndex <= 0 ? musikData.length - 1 : currentSongIndex - 1;
    const prevSong = musikData[prevIndex];
    if (prevSong) {
      playSong(prevSong);
    }
  }, [musikData, currentSongIndex, currentTime, playSong]);

  // Seek
  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Set volume
  const setVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    const normalizedVol = Math.max(0, Math.min(100, vol)) / 100;
    audioRef.current.volume = normalizedVol;
    setVolumeState(Math.max(0, Math.min(100, vol)));
    setIsMuted(normalizedVol === 0);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;

    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);

    if (newMuted && volume > 0) {
      audioRef.current.volume = 0;
    } else if (!newMuted && volume > 0) {
      audioRef.current.volume = volume / 100;
    }
  }, [isMuted, volume]);

  // Toggle repeat
  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => !prev);
  }, []);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  // Toggle player
  const togglePlayer = useCallback(() => {
    setIsPlayerOpen((prev) => !prev);
  }, []);

  const value: MusicContextType = {
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
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    togglePlayer,
    loadMusikData,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
