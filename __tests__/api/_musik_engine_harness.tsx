// Harness test mesin pemutar Musik Desa (bukan file test; dipakai musik_engine_*.test.tsx).
// jsdom rusak di repo ini (cssstyle TLA), jadi MusicProvider dipasang lewat react-dom/client di
// environment node dengan wadah tiruan minimal. Komponen uji hanya me-render `null`, jadi React tidak
// pernah membuat elemen DOM; yang diuji = state & efek mesin yang sebenarnya, bukan markup.
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { vi } from 'vitest';
import type { Musik } from '@/app/context/MusicContext';

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
  const win = Object.assign(new EventTarget(), {
    HTMLIFrameElement: class {},
    localStorage: storage,
  });
  vi.stubGlobal('window', win);
  vi.stubGlobal('HTMLIFrameElement', win.HTMLIFrameElement);
  vi.stubGlobal('document', {
    nodeType: 9,
    activeElement: null,
    addEventListener() {},
    removeEventListener() {},
    defaultView: win,
  });
  vi.stubGlobal('Audio', FakeAudio);
  const queue = [...replies];
  const fetchMock = vi.fn(() => respond(queue.length > 1 ? queue.shift()! : queue[0]));
  vi.stubGlobal('fetch', fetchMock);
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  return { win, storage, fetchMock };
}

/** Wadah tiruan untuk createRoot; tidak pernah diisi elemen karena komponen uji me-render null. */
function fakeContainer() {
  const container: Record<string, unknown> = {
    nodeType: 1,
    nodeName: 'DIV',
    tagName: 'DIV',
    childNodes: [],
    firstChild: null,
    addEventListener() {},
    removeEventListener() {},
    appendChild() {},
    insertBefore() {},
    removeChild() {},
  };
  container.ownerDocument = { ...(globalThis.document as object), documentElement: container };
  return container as unknown as Element;
}

/** Render pohon React di wadah tiruan; `flush` menunggu promise (fetch, play) selesai di dalam act. */
export async function mount(node: ReactNode) {
  const root: Root = createRoot(fakeContainer());
  await act(async () => root.render(node));
  await flush();
  return {
    rerender: (next: ReactNode) => act(async () => root.render(next)),
    unmount: () => act(async () => root.unmount()),
  };
}

export async function flush() {
  for (let i = 0; i < 5; i += 1) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

/** Kirim event audio di dalam act lalu tunggu promise turunan. */
export async function fire(audio: FakeAudio, type: string) {
  await act(async () => audio.emit(type));
  await flush();
}

/** Jalankan aksi mesin (playSong, playNext, ...) di dalam act. */
export async function run(action: () => void) {
  await act(async () => action());
  await flush();
}

export const lastAudio = () => FakeAudio.instances[FakeAudio.instances.length - 1];

/** DOMException-like untuk penolakan play(). test-only */
export const playError = (name: string) => Object.assign(new Error(name), { name });
