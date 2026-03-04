import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook untuk smooth audio progress update menggunakan requestAnimationFrame
 * Lebih smooth dan reliable dibanding onTimeUpdate event
 */
export function useAudioProgress(
  audioRef: React.RefObject<HTMLAudioElement>,
  isPlaying: boolean,
  setCurrentTime: (time: number) => void,
  isSeekingRef: React.RefObject<boolean>
) {
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const updateProgress = useCallback(() => {
    if (!audioRef.current || audioRef.current.paused || isSeekingRef.current) {
      rafRef.current = requestAnimationFrame(updateProgress);
      return;
    }

    const audio = audioRef.current;
    const currentTime = Math.floor(audio.currentTime);

    // Hanya update state jika waktu berubah
    if (currentTime !== lastTimeRef.current) {
      lastTimeRef.current = currentTime;
      setCurrentTime(currentTime);
    }

    rafRef.current = requestAnimationFrame(updateProgress);
  }, [audioRef, setCurrentTime, isSeekingRef]);

  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateProgress);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, updateProgress]);

  return rafRef;
}

// 'use client'
// import { useEffect, useRef, useState, useCallback } from 'react';

// export function useAudioEngine() {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const rafRef = useRef<number | null>(null);
//   const isSeekingRef = useRef(false);

//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);

//   const load = useCallback((src: string) => {
//     if (!audioRef.current) return;
//     audioRef.current.src = src;
//     audioRef.current.load();
//     setCurrentTime(0);
//   }, []);

//   const play = async () => {
//     if (!audioRef.current) return;
//     await audioRef.current.play();
//     setIsPlaying(true);
//   };

//   const pause = () => {
//     if (!audioRef.current) return;
//     audioRef.current.pause();
//     setIsPlaying(false);
//   };

//   const toggle = () => {
//     if (!audioRef.current) return;
//     audioRef.current.paused ? play() : pause();
//   };

//   const seek = (time: number) => {
//     if (!audioRef.current) return;
//     isSeekingRef.current = true;
//     audioRef.current.currentTime = time;
//     setCurrentTime(time);
//     requestAnimationFrame(() => {
//       isSeekingRef.current = false;
//     });
//   };

//   useEffect(() => {
//     if (!audioRef.current) return;
//     const audio = audioRef.current;

//     const onLoaded = () => {
//       setDuration(Math.floor(audio.duration));
//     };

//     const onEnded = () => {
//       setIsPlaying(false);
//       setCurrentTime(0);
//     };

//     audio.addEventListener('loadedmetadata', onLoaded);
//     audio.addEventListener('ended', onEnded);

//     return () => {
//       audio.removeEventListener('loadedmetadata', onLoaded);
//       audio.removeEventListener('ended', onEnded);
//     };
//   }, []);

//   useEffect(() => {
//     const loop = () => {
//       if (
//         audioRef.current &&
//         !audioRef.current.paused &&
//         !isSeekingRef.current
//       ) {
//         setCurrentTime(Math.floor(audioRef.current.currentTime));
//       }
//       rafRef.current = requestAnimationFrame(loop);
//     };
//     rafRef.current = requestAnimationFrame(loop);
//     return () => {
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//     };
//   }, []);

//   return {
//     audioRef,
//     isPlaying,
//     currentTime,
//     duration,
//     load,
//     toggle,
//     seek,
//   };
// }
