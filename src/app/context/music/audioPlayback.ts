/**
 * Pembantu elemen audio mesin pemutar: memulai putar tanpa toast palsu, dan melepas sumber.
 */

/**
 * Penolakan `play()` yang bukan kegagalan untuk pengguna:
 * - AbortError: `play()` disela `load()` lagu lain (mis. Berikutnya ditekan cepat). Lagu baru tetap diputar.
 * - NotSupportedError: file rusak / 404. Listener 'error' sudah memberi satu toast dan melompat ke lagu lain.
 */
const HANDLED_ELSEWHERE = new Set(['AbortError', 'NotSupportedError']);

/** Nama error untuk log (DOMException / Error), tanpa isi pesan yang bisa memuat URL. */
export function errorName(error: unknown): string {
  return error instanceof Error || (typeof error === 'object' && error !== null && 'name' in error)
    ? String((error as { name: unknown }).name)
    : typeof error;
}

/** Panggil `play()`; penolakan selain yang ditangani di tempat lain diteruskan ke `onFailure`. */
export function playAudio(audio: HTMLAudioElement, onFailure: (error: unknown) => void): void {
  audio.play().catch((error: unknown) => {
    if (HANDLED_ELSEWHERE.has(errorName(error))) return;
    onFailure(error);
  });
}

/** Hentikan unduhan & lepas sumber. `removeAttribute('src')` saja tidak menghentikan fetch tanpa `load()`. */
export function releaseSource(audio: HTMLAudioElement): void {
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
}
