// @vitest-environment node
// Preferensi mesin Musik Desa: bunyikan kembali dari volume 0 (F8) dan "Baru diputar" lintas tab (F9).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicProvider, useMusic } from '@/app/context/MusicContext';
import { DEFAULT_VOLUME } from '@/app/context/music/useVolume';
import { RECENT_STORAGE_KEY } from '@/app/context/music/recentlyPlayed';
import { fakeStorage, fire, installBrowserStubs, lastAudio, libraryReply, mount, run, song } from './_musik_engine_harness';

vi.mock('react-toastify', () => ({ toast: { info: vi.fn(), error: vi.fn() } }));

let music: ReturnType<typeof useMusic>;
function Probe() {
  music = useMusic();
  return null;
}

const SONGS = [song('a'), song('b'), song('c')];

async function start(storage = fakeStorage()) {
  const stubs = installBrowserStubs([libraryReply(SONGS)], storage);
  await mount(
    <MusicProvider>
      <Probe />
    </MusicProvider>
  );
  return stubs;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('bisu & volume', () => {
  it('slider ke 0 lalu tombol bunyikan → kembali ke volume terdengar terakhir', async () => {
    await start();
    await run(() => music.setVolume(40));
    await run(() => music.setVolume(0));
    expect(music.isMuted).toBe(true);

    await run(() => music.toggleMute());
    const audio = lastAudio();
    expect(music.isMuted).toBe(false);
    expect(music.volume).toBe(40);
    expect(audio.muted).toBe(false);
    expect(audio.volume).toBeCloseTo(0.4);
  });

  it('belum pernah digeser: dari 0 kembali ke bawaan 70', async () => {
    await start();
    await run(() => music.setVolume(0));
    await run(() => music.toggleMute());
    expect(music.volume).toBe(DEFAULT_VOLUME);
    expect(lastAudio().volume).toBeCloseTo(DEFAULT_VOLUME / 100);
  });

  it('bisu lalu bunyikan mempertahankan volume yang ada', async () => {
    await start();
    await run(() => music.setVolume(55));
    await run(() => music.toggleMute());
    expect(music.isMuted).toBe(true);
    expect(lastAudio().muted).toBe(true);
    await run(() => music.toggleMute());
    expect(music.isMuted).toBe(false);
    expect(music.volume).toBe(55);
    expect(lastAudio().muted).toBe(false);
  });
});

describe('Baru diputar lintas tab', () => {
  const stored = (storage: ReturnType<typeof fakeStorage>) =>
    JSON.parse(storage.data.get(RECENT_STORAGE_KEY) ?? '[]') as string[];

  it('menulis di atas isi storage terbaru, bukan menimpa catatan tab lain', async () => {
    const storage = fakeStorage();
    await start(storage);
    // Tab lain mencatat "b" setelah tab ini dimuat (tanpa event yang sampai ke sini).
    storage.data.set(RECENT_STORAGE_KEY, JSON.stringify(['b']));

    await run(() => music.playSong(SONGS[0]));
    await fire(lastAudio(), 'playing');

    expect(stored(storage)).toEqual(['a', 'b']);
    expect(music.recentlyPlayed.map((s) => s.id)).toEqual(['a', 'b']);
  });

  it("event 'storage' dari tab lain memperbarui daftar di tab ini", async () => {
    const storage = fakeStorage();
    const { win } = await start(storage);
    expect(music.recentlyPlayed).toEqual([]);

    storage.data.set(RECENT_STORAGE_KEY, JSON.stringify(['c', 'a']));
    await run(() => {
      win.dispatchEvent(Object.assign(new Event('storage'), { key: RECENT_STORAGE_KEY }));
    });
    expect(music.recentlyPlayed.map((s) => s.id)).toEqual(['c', 'a']);

    // Kunci lain tidak memicu baca ulang.
    storage.data.set(RECENT_STORAGE_KEY, JSON.stringify(['b']));
    await run(() => {
      win.dispatchEvent(Object.assign(new Event('storage'), { key: 'kunci-lain' }));
    });
    expect(music.recentlyPlayed.map((s) => s.id)).toEqual(['c', 'a']);
  });
});
