// Harness test mesin pemutar Musik Desa (bukan file test; dipakai musik_engine_*.test.tsx).
// MusicProvider dipasang lewat helpers/node-react-root (react-dom/client di environment node, jsdom rusak).
import { act, useEffect } from 'react';
import { vi } from 'vitest';
import { flush, installMinimalDom, mount, run } from '../helpers/node-react-root';
import { useMusic, type Musik } from '@/app/context/MusicContext';

/** Elemen audio tiruan: event dikirim manual oleh test, panggilan dicatat. test-only */
export class FakeAudio extends EventTarget {
  static instances: FakeAudio[] = [];
  preload = '';
  volume = 1;
  muted = false;
  paused = true;
  currentTime = 0;
  duration = Number.NaN;
  error: { code: number } | null = null;
  calls = { play: 0, pause: 0, load: 0 };
  /** Hasil play() berikutnya; bawaan berhasil. */
  playResult: () => Promise<void> = () => Promise.resolve();
  private srcAttr: string | null = null;

  constructor() {
    super();
    FakeAudio.instances.push(this);
  }

  get src() {
    return this.srcAttr ?? '';
  }
  set src(value: string) {
    this.srcAttr = value;
  }
  getAttribute(name: string) {
    return name === 'src' ? this.srcAttr : null;
  }
  removeAttribute(name: string) {
    if (name === 'src') this.srcAttr = null;
  }
  load() {
    this.calls.load += 1;
    this.error = null;
  }
  play() {
    this.calls.play += 1;
    this.paused = false;
    this.emit('play');
    return this.playResult();
  }
  pause() {
    this.calls.pause += 1;
    if (!this.paused) {
      this.paused = true;
      this.emit('pause');
    }
  }
  emit(type: string) {
    this.dispatchEvent(new Event(type));
  }
}

/** localStorage tiruan (Map). test-only */
export function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
}

// test-only: lagu fiktif berbentuk respons /api/desa/musik/find-many.
const file = (link: string) => ({ id: link, name: link, realName: link, path: link, mimeType: 'audio/mpeg', link });
export const song = (id: string, extra: Partial<Musik> = {}): Musik => ({
  id,
  judul: `Lagu ${id}`,
  artis: `Artis ${id}`,
  deskripsi: null,
  durasi: '03:00',
  genre: null,
  tahunRilis: null,
  audioFile: file(`https://example.test/${id}.mp3`),
  coverImage: null,
  isActive: true,
  ...extra,
});

export type FetchReply = { status?: number; body?: unknown } | Error;
const respond = (reply: FetchReply) =>
  reply instanceof Error
    ? Promise.reject(reply)
    : Promise.resolve({
        ok: (reply.status ?? 200) < 400,
        status: reply.status ?? 200,
        json: async () => reply.body,
      });

/** Balasan pustaka sukses. test-only */
export const libraryReply = (songs: Musik[]): FetchReply => ({ body: { success: true, data: songs, total: songs.length } });

/** Pasang global browser minimal (window, document, Audio, fetch, localStorage). */
export function installBrowserStubs(replies: FetchReply[], storage = fakeStorage()) {
  FakeAudio.instances = [];
  const win = installMinimalDom({ localStorage: storage });
  vi.stubGlobal('Audio', FakeAudio);
  const queue = [...replies];
  const fetchMock = vi.fn(() => respond(queue.length > 1 ? queue.shift()! : queue[0]));
  vi.stubGlobal('fetch', fetchMock);
  return { win, storage, fetchMock };
}

export { flush, mount, run };

/**
 * Meniru MusikApp: minta pustaka setelah mount. Mesin sengaja tidak memuat pustaka sendiri (provider ada di root
 * layout, muat saat mount = fetch di setiap halaman), jadi test yang butuh pustaka memasang ini di dalam provider.
 */
export function RequestLibrary() {
  const { ensureMusikData } = useMusic();
  useEffect(() => {
    ensureMusikData();
  }, [ensureMusikData]);
  return null;
}

/** Kirim event audio di dalam act lalu tunggu promise turunan. */
export async function fire(audio: FakeAudio, type: string) {
  await act(async () => audio.emit(type));
  await flush();
}

export const lastAudio = () => FakeAudio.instances[FakeAudio.instances.length - 1];

/** DOMException-like untuk penolakan play(). test-only */
export const playError = (name: string) => Object.assign(new Error(name), { name });
