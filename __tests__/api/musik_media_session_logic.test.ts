// @vitest-environment node
// Logika murni Media Session (metadata, status, posisi, penangan aksi). Hook-nya diuji di musik_engine_media_session.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyActionHandlers,
  buildActionHandlers,
  buildMetadataInit,
  clearActionHandlers,
  getMediaSession,
  MEDIA_ACTIONS,
  toPlaybackState,
  toPositionState,
  type MediaSessionLike,
} from '@/app/context/music/mediaSession.logic';
import type { Musik } from '@/app/context/music/music.types';

// test-only: lagu fiktif.
const file = (link: string, mimeType = 'image/jpeg') => ({ id: link, name: link, realName: link, path: link, mimeType, link });
const song = (extra: Partial<Musik> = {}): Musik => ({
  id: 'a',
  judul: 'Tari Pendet',
  artis: 'Sekaa Gong Darmasaba',
  deskripsi: null,
  durasi: '03:00',
  genre: null,
  tahunRilis: null,
  audioFile: file('https://example.test/a.mp3', 'audio/mpeg'),
  coverImage: null,
  isActive: true,
  ...extra,
});

function fakeSession(unsupported: string[] = []) {
  const handlers = new Map<string, MediaSessionActionHandler>();
  const session = {
    metadata: null,
    playbackState: 'none' as MediaSessionPlaybackState,
    setActionHandler: vi.fn((action: string, handler: MediaSessionActionHandler | null) => {
      if (unsupported.includes(action)) throw new TypeError(`${action} tidak didukung`);
      if (handler) handlers.set(action, handler);
      else handlers.delete(action);
    }),
  };
  return { session: session as unknown as MediaSessionLike, handlers, setActionHandler: session.setActionHandler };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getMediaSession', () => {
  it('null di server (tanpa navigator) dan di browser tanpa mediaSession', () => {
    vi.stubGlobal('navigator', undefined);
    expect(getMediaSession()).toBeNull();
    vi.stubGlobal('navigator', {});
    expect(getMediaSession()).toBeNull();
  });

  it('mengembalikan navigator.mediaSession bila ada', () => {
    const { session } = fakeSession();
    vi.stubGlobal('navigator', { mediaSession: session });
    expect(getMediaSession()).toBe(session);
  });
});

describe('buildMetadataInit', () => {
  it('judul, artis, dan sampul (dengan tipe gambar) bila lagu punya sampul', () => {
    const init = buildMetadataInit(song({ coverImage: file('https://example.test/a.jpg') }));
    expect(init).toEqual({
      title: 'Tari Pendet',
      artist: 'Sekaa Gong Darmasaba',
      artwork: [{ src: 'https://example.test/a.jpg', type: 'image/jpeg' }],
    });
  });

  it('tanpa sampul: artwork kosong', () => {
    expect(buildMetadataInit(song()).artwork).toEqual([]);
  });

  it('mimeType bukan gambar tidak dikirim sebagai type', () => {
    const init = buildMetadataInit(song({ coverImage: file('https://example.test/a.bin', 'application/octet-stream') }));
    expect(init.artwork).toEqual([{ src: 'https://example.test/a.bin' }]);
  });
});

describe('toPlaybackState', () => {
  it("tanpa lagu 'none'; dengan lagu 'playing'/'paused'", () => {
    expect(toPlaybackState(false, true)).toBe('none');
    expect(toPlaybackState(true, true)).toBe('playing');
    expect(toPlaybackState(true, false)).toBe('paused');
  });
});

describe('toPositionState', () => {
  it('null bila durasi belum diketahui atau tak hingga', () => {
    expect(toPositionState(Number.NaN, 0, 1)).toBeNull();
    expect(toPositionState(0, 0, 1)).toBeNull();
    expect(toPositionState(Number.POSITIVE_INFINITY, 3, 1)).toBeNull();
  });

  it('posisi dijepit ke [0, durasi]; laju tidak valid jadi 1', () => {
    expect(toPositionState(154, 30, 1.5)).toEqual({ duration: 154, position: 30, playbackRate: 1.5 });
    expect(toPositionState(154, 200, 1)).toEqual({ duration: 154, position: 154, playbackRate: 1 });
    expect(toPositionState(154, -2, 0)).toEqual({ duration: 154, position: 0, playbackRate: 1 });
    expect(toPositionState(154, Number.NaN, Number.NaN)).toEqual({ duration: 154, position: 0, playbackRate: 1 });
  });
});

describe('buildActionHandlers', () => {
  const callbacks = () => ({ play: vi.fn(), pause: vi.fn(), previous: vi.fn(), next: vi.fn(), seekTo: vi.fn() });

  it('setiap aksi memanggil callback-nya; seekto meneruskan seekTime', () => {
    const cb = callbacks();
    const handlers = buildActionHandlers(cb, true);
    handlers.play?.({ action: 'play' });
    handlers.pause?.({ action: 'pause' });
    handlers.previoustrack?.({ action: 'previoustrack' });
    handlers.nexttrack?.({ action: 'nexttrack' });
    handlers.seekto?.({ action: 'seekto', seekTime: 42 });
    expect([cb.play, cb.pause, cb.previous, cb.next].map((fn) => fn.mock.calls.length)).toEqual([1, 1, 1, 1]);
    expect(cb.seekTo).toHaveBeenCalledWith(42);
  });

  it('tanpa lagu berikutnya: nexttrack null (tombol Berikutnya sistem hilang)', () => {
    expect(buildActionHandlers(callbacks(), false).nexttrack).toBeNull();
  });

  it('seekto tanpa seekTime (atau NaN) diabaikan', () => {
    const cb = callbacks();
    const handlers = buildActionHandlers(cb, true);
    handlers.seekto?.({ action: 'seekto' });
    handlers.seekto?.({ action: 'seekto', seekTime: Number.NaN });
    expect(cb.seekTo).not.toHaveBeenCalled();
  });
});

describe('applyActionHandlers / clearActionHandlers', () => {
  it('aksi yang tidak didukung (TypeError) dilewati, aksi lain tetap terpasang', () => {
    const { session, handlers } = fakeSession(['seekto']);
    const handler = () => {};
    applyActionHandlers(session, { play: handler, pause: handler, seekto: handler });
    expect([...handlers.keys()].sort()).toEqual(['pause', 'play']);
  });

  it('galat selain TypeError diteruskan', () => {
    const { session, setActionHandler } = fakeSession();
    setActionHandler.mockImplementation(() => {
      throw new Error('rusak');
    });
    expect(() => applyActionHandlers(session, { play: () => {} })).toThrow('rusak');
  });

  it('clearActionHandlers melepas semua aksi mesin', () => {
    const { session, handlers, setActionHandler } = fakeSession();
    applyActionHandlers(session, Object.fromEntries(MEDIA_ACTIONS.map((a) => [a, () => {}])));
    expect(handlers.size).toBe(MEDIA_ACTIONS.length);
    clearActionHandlers(session);
    expect(handlers.size).toBe(0);
    expect(setActionHandler).toHaveBeenLastCalledWith('seekto', null);
  });
});
