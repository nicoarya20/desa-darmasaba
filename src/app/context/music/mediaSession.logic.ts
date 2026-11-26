/**
 * Logika murni Media Session API (layar kunci, notifikasi ponsel, tombol media keyboard, Control Center macOS).
 * Dipisah dari useMediaSession supaya bisa diuji di environment node tanpa browser.
 */
import type { Musik } from './music.types';

/** Bagian MediaSession yang dipakai mesin (memudahkan tiruan di test). */
export type MediaSessionLike = Pick<MediaSession, 'metadata' | 'playbackState' | 'setActionHandler'> &
  Partial<Pick<MediaSession, 'setPositionState'>>;

/** Aksi yang dipasang mesin; dibersihkan bersama saat lagu dihentikan atau provider dilepas. */
export const MEDIA_ACTIONS = ['play', 'pause', 'previoustrack', 'nexttrack', 'seekto'] as const;
export type MediaAction = (typeof MEDIA_ACTIONS)[number];

/** `navigator.mediaSession` bila browser mendukung; null di server atau browser lama. */
export function getMediaSession(): MediaSessionLike | null {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return null;
  return navigator.mediaSession;
}

/** Isi MediaMetadata lagu: judul, artis, dan sampul bila ada. */
export function buildMetadataInit(song: Musik): MediaMetadataInit {
  const cover = song.coverImage;
  const artwork: MediaImage[] = cover?.link
    ? [{ src: cover.link, ...(cover.mimeType?.startsWith('image/') ? { type: cover.mimeType } : {}) }]
    : [];
  return { title: song.judul, artist: song.artis, artwork };
}

/** playbackState dari status mesin: tanpa lagu = 'none' (kontrol sistem dilepas). */
export function toPlaybackState(hasSong: boolean, isPlaying: boolean): MediaSessionPlaybackState {
  if (!hasSong) return 'none';
  return isPlaying ? 'playing' : 'paused';
}

/**
 * Posisi untuk `setPositionState`, atau null bila durasi belum diketahui (NaN, 0, Infinity untuk siaran).
 * Posisi dijepit ke [0, durasi] karena browser melempar TypeError bila posisi di luar rentang.
 */
export function toPositionState(duration: number, position: number, playbackRate: number): MediaPositionState | null {
  if (!Number.isFinite(duration) || duration <= 0) return null;
  const safePosition = Number.isFinite(position) ? Math.min(Math.max(position, 0), duration) : 0;
  return { duration, position: safePosition, playbackRate: playbackRate > 0 ? playbackRate : 1 };
}

export type MediaActionCallbacks = {
  play: () => void;
  pause: () => void;
  previous: () => void;
  next: () => void;
  seekTo: (time: number) => void;
};

/**
 * Penangan per aksi. `nexttrack` null bila tidak ada lagu berikutnya (ulang mati di ujung urutan), jadi tombol
 * Berikutnya di layar kunci ikut hilang seperti tombol di pemutar situs. `seekto` tanpa `seekTime` diabaikan.
 */
export function buildActionHandlers(
  callbacks: MediaActionCallbacks,
  hasNext: boolean
): Record<MediaAction, MediaSessionActionHandler | null> {
  return {
    play: () => callbacks.play(),
    pause: () => callbacks.pause(),
    previoustrack: () => callbacks.previous(),
    nexttrack: hasNext ? () => callbacks.next() : null,
    seekto: (details) => {
      if (typeof details.seekTime === 'number' && Number.isFinite(details.seekTime)) callbacks.seekTo(details.seekTime);
    },
  };
}

/**
 * Pasang (atau lepas dengan null) penangan aksi. Browser melempar TypeError untuk aksi yang tidak didukungnya
 * (mis. 'seekto' di Safari lama); aksi itu dilewati supaya aksi lain tetap terpasang. Galat lain diteruskan.
 */
export function applyActionHandlers(
  session: MediaSessionLike,
  handlers: Partial<Record<MediaAction, MediaSessionActionHandler | null>>
): void {
  for (const action of MEDIA_ACTIONS) {
    if (!(action in handlers)) continue;
    try {
      session.setActionHandler(action, handlers[action] ?? null);
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
  }
}

/** Lepas semua penangan aksi mesin. */
export const clearActionHandlers = (session: MediaSessionLike) =>
  applyActionHandlers(session, Object.fromEntries(MEDIA_ACTIONS.map((action) => [action, null])));
