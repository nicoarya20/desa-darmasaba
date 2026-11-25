"use client";

import type { CSSProperties } from "react";
import { useMusic } from "@/app/context/MusicContext";
import { hasAudio } from "@/app/context/music/playable";
import { EqualizerBars } from "./now-playing/EqualizerBars";
import { NowPlayingCard } from "./now-playing/NowPlayingCard";
import { NOW_PLAYING_TEXT } from "./now-playing/now-playing.text";
import m from "./navbar-mobile.module.css";

/** Label tombol equalizer bar ponsel, mis. "Jeda musik" (kata kerja dari teks kartu Now Playing). */
export const musicToggleLabel = (playing: boolean) =>
  `${playing ? NOW_PLAYING_TEXT.pause : NOW_PLAYING_TEXT.play} musik`;

/** Tombol equalizer di bar navbar ponsel saat ada lagu: bergerak saat diputar, ketuk = putar/jeda. */
export function NavbarMusicToggle() {
  const { currentSong, isPlaying, togglePlayPause } = useMusic();
  if (!currentSong) return null;
  const playing = isPlaying && hasAudio(currentSong);
  return (
    <button
      type="button"
      className={m.musicToggle}
      onClick={togglePlayPause}
      aria-label={musicToggleLabel(playing)}
      data-playing={playing}
    >
      <EqualizerBars playing={playing} />
    </button>
  );
}

type MenuPlayerProps = {
  /** Tautan kartu ke aplikasi Musik diklik (menutup panel). */
  onNavigate: () => void;
  /** Sesudah × (kartu hilang): pemanggil memindahkan fokus, mis. ke tombol burger. */
  onStop: () => void;
  /** Urutan animasi masuk (.reveal) setelah butir menu terakhir. */
  revealIndex: number;
};

/** Kartu pemutar di bawah menu utama panel ponsel (hanya saat ada lagu). */
export function NavbarMenuPlayer({ onNavigate, onStop, revealIndex }: MenuPlayerProps) {
  const { currentSong } = useMusic();
  if (!currentSong) return null;
  return (
    <div className={`${m.player} ${m.reveal}`} style={{ "--i": revealIndex } as CSSProperties}>
      <NowPlayingCard variant="menu" onNavigate={onNavigate} onStop={onStop} />
    </div>
  );
}
