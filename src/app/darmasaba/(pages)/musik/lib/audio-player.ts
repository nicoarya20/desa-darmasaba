import { RefObject } from 'react';

/**
 * Toggle play/pause audio
 */
export const togglePlayPause = (
  audioRef: RefObject<HTMLAudioElement | null>,
  isPlaying: boolean,
  setIsPlaying: (playing: boolean) => void
) => {
  if (!audioRef.current) return;

  if (isPlaying) {
    audioRef.current.pause();
    setIsPlaying(false);
  } else {
    audioRef.current.play().catch((err) => {
      console.error('Error playing audio:', err);
    });
    setIsPlaying(true);
  }
};

/**
 * Skip to previous song in playlist
 * If at beginning and more than 1 song, go to last song
 */
export const skipToPreviousSong = (
  currentSongIndex: number,
  filteredMusikLength: number,
  isShuffle: boolean,
  setCurrentSongIndex: (index: number) => void,
  setIsPlaying: (playing: boolean) => void
) => {
  if (filteredMusikLength === 0) return;
  
  let prevIndex: number;
  if (isShuffle) {
    // Random index different from current
    do {
      prevIndex = Math.floor(Math.random() * filteredMusikLength);
    } while (prevIndex === currentSongIndex && filteredMusikLength > 1);
  } else {
    // Sequential (go to previous or last if at beginning)
    prevIndex = currentSongIndex === 0 ? filteredMusikLength - 1 : currentSongIndex - 1;
  }
  
  setCurrentSongIndex(prevIndex);
  setIsPlaying(true);
};

/**
 * Skip to next song in playlist
 */
export const skipToNextSong = (
  currentSongIndex: number,
  filteredMusikLength: number,
  isShuffle: boolean,
  setCurrentSongIndex: (index: number) => void,
  setIsPlaying: (playing: boolean) => void
) => {
  if (filteredMusikLength === 0) return;
  
  let nextIndex: number;
  if (isShuffle) {
    // Random index different from current
    do {
      nextIndex = Math.floor(Math.random() * filteredMusikLength);
    } while (nextIndex === currentSongIndex && filteredMusikLength > 1);
  } else {
    // Sequential (loop back to first if at end)
    nextIndex = (currentSongIndex + 1) % filteredMusikLength;
  }
  
  setCurrentSongIndex(nextIndex);
  setIsPlaying(true);
};

/**
 * Toggle mute/unmute
 */
export const toggleMute = (
  audioRef: RefObject<HTMLAudioElement | null>,
  isMuted: boolean,
  setIsMuted: (muted: boolean) => void
) => {
  const newMuted = !isMuted;
  setIsMuted(newMuted);
  if (audioRef.current) {
    audioRef.current.muted = newMuted;
  }
};

/**
 * Handle volume change
 */
export const handleVolumeChange = (
  audioRef: RefObject<HTMLAudioElement | null>,
  volume: number,
  setVolume: (vol: number) => void,
  isMuted: boolean,
  setIsMuted: (muted: boolean) => void
) => {
  setVolume(volume);
  if (audioRef.current) {
    audioRef.current.volume = volume / 100;
  }
  // Unmute if volume is increased from 0
  if (volume > 0 && isMuted) {
    setIsMuted(false);
  }
};

/**
 * Handle seek/scrub through audio
 */
export const handleSeek = (
  audioRef: RefObject<HTMLAudioElement | null>,
  value: number,
  setCurrentTime: (time: number) => void
) => {
  setCurrentTime(value);
  if (audioRef.current) {
    audioRef.current.currentTime = value;
  }
};

/**
 * Format seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Parse duration string (MM:SS) to seconds
 */
export const parseDuration = (durationString: string): number => {
  const parts = durationString.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

/**
 * Play a specific song from playlist
 */
export const playSong = (
  index: number,
  filteredMusikLength: number,
  setCurrentSongIndex: (index: number) => void,
  setIsPlaying: (playing: boolean) => void
) => {
  if (index < 0 || index >= filteredMusikLength) return;
  setCurrentSongIndex(index);
  setIsPlaying(true);
};

/**
 * Handle song end - play next song or repeat
 */
export const handleSongEnd = (
  isRepeat: boolean,
  isShuffle: boolean,
  currentSongIndex: number,
  filteredMusikLength: number,
  audioRef: RefObject<HTMLAudioElement | null>,
  setCurrentSongIndex: (index: number) => void,
  setIsPlaying: (playing: boolean) => void,
  setCurrentTime: (time: number) => void
) => {
  if (isRepeat) {
    // Repeat current song
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  } else {
    // Play next song
    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * filteredMusikLength);
    } else {
      nextIndex = (currentSongIndex + 1) % filteredMusikLength;
    }

    if (filteredMusikLength > 1) {
      setCurrentSongIndex(nextIndex);
      setIsPlaying(true);
    } else {
      // Only one song and not repeating
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }
};

/**
 * Toggle repeat mode
 */
export const toggleRepeat = (
  isRepeat: boolean,
  setIsRepeat: (repeat: boolean) => void
) => {
  setIsRepeat(!isRepeat);
};

/**
 * Toggle shuffle mode
 */
export const toggleShuffle = (
  isShuffle: boolean,
  setIsShuffle: (shuffle: boolean) => void
) => {
  setIsShuffle(!isShuffle);
};

/**
 * Get next song index based on shuffle mode
 */
export const getNextSongIndex = (
  currentSongIndex: number,
  filteredMusikLength: number,
  isShuffle: boolean
): number => {
  if (isShuffle) {
    // Random index different from current
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * filteredMusikLength);
    } while (nextIndex === currentSongIndex && filteredMusikLength > 1);
    return nextIndex;
  } else {
    // Sequential
    return (currentSongIndex + 1) % filteredMusikLength;
  }
};

/**
 * Get previous song index
 */
export const getPreviousSongIndex = (
  currentSongIndex: number,
  filteredMusikLength: number,
  isShuffle: boolean
): number => {
  if (isShuffle) {
    // Random index different from current
    let prevIndex;
    do {
      prevIndex = Math.floor(Math.random() * filteredMusikLength);
    } while (prevIndex === currentSongIndex && filteredMusikLength > 1);
    return prevIndex;
  } else {
    // Sequential (go to previous or last if at beginning)
    return currentSongIndex === 0 ? filteredMusikLength - 1 : currentSongIndex - 1;
  }
};
