// @vitest-environment node
// Waktu pemutaran dipisah dari useMusic(): 'timeupdate' hanya me-render konsumen useMusicTime().
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicProvider, useMusic, useMusicTime } from '@/app/context/MusicContext';
import { createMusicTimeStore } from '@/app/context/music/musicTime';
import { fire, installBrowserStubs, lastAudio, libraryReply, mount, RequestLibrary, run, song } from './_musik_engine_harness';

vi.mock('react-toastify', () => ({ toast: { info: vi.fn(), error: vi.fn() } }));

const renders = { music: 0, time: 0 };
let music: ReturnType<typeof useMusic>;
let time: ReturnType<typeof useMusicTime>;
function MusicProbe() {
  renders.music += 1;
  music = useMusic();
  return null;
}
function TimeProbe() {
  renders.time += 1;
  time = useMusicTime();
  return null;
}

const SONGS = [song('a'), song('b')];

async function start() {
  installBrowserStubs([libraryReply(SONGS)]);
  await mount(
    <MusicProvider>
      <RequestLibrary />
      <MusicProbe />
      <TimeProbe />
    </MusicProvider>
  );
}

beforeEach(() => {
  renders.music = 0;
  renders.time = 0;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('pemisahan waktu', () => {
  it("'timeupdate' tidak me-render konsumen useMusic, hanya konsumen useMusicTime", async () => {
    await start();
    await run(() => music.playSong(SONGS[0]));
    const audio = lastAudio();
    audio.duration = 180;
    await fire(audio, 'loadedmetadata');
    const before = { ...renders };

    for (const t of [1, 2, 3]) {
      audio.currentTime = t;
      await fire(audio, 'timeupdate');
    }

    expect(renders.music).toBe(before.music);
    expect(renders.time).toBe(before.time + 3);
    expect(time).toMatchObject({ currentTime: 3, duration: 180 });
  });

  it("'timeupdate' pada detik yang sama tidak me-render siapa pun", async () => {
    await start();
    await run(() => music.playSong(SONGS[0]));
    const audio = lastAudio();
    audio.currentTime = 4.2;
    await fire(audio, 'timeupdate');
    const before = { ...renders };
    audio.currentTime = 4.7;
    await fire(audio, 'timeupdate');
    expect(renders).toEqual(before);
  });

  it('lagu baru me-reset posisi & durasi ke 0', async () => {
    await start();
    await run(() => music.playSong(SONGS[0]));
    const audio = lastAudio();
    audio.duration = 180;
    audio.currentTime = 50;
    await fire(audio, 'loadedmetadata');
    await fire(audio, 'timeupdate');
    await run(() => music.playSong(SONGS[1]));
    expect(time).toMatchObject({ currentTime: 0, duration: 0 });
  });

  it('Sebelumnya setelah 3 detik mengulang lagu dari posisi audio yang sebenarnya', async () => {
    await start();
    await run(() => music.playSong(SONGS[1]));
    const audio = lastAudio();
    audio.currentTime = 10;
    await fire(audio, 'timeupdate');
    await run(() => music.playPrev());
    expect(music.currentSong?.id).toBe('b');
    expect(audio.currentTime).toBe(0);
    expect(time.currentTime).toBe(0);
  });

  it('useMusicTime di luar MusicProvider melempar error yang jelas', async () => {
    installBrowserStubs([libraryReply([])]);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(mount(<TimeProbe />)).rejects.toThrow('useMusicTime must be used within a MusicProvider');
  });
});

describe('store waktu', () => {
  it('memberi tahu pendengar hanya bila nilai berubah, dan berhenti setelah unsubscribe', () => {
    const store = createMusicTimeStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    const first = store.getSnapshot();

    store.set({ currentTime: 0, duration: 0 });
    expect(listener).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toBe(first);

    store.set({ duration: 90 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toEqual({ currentTime: 0, duration: 90 });

    unsubscribe();
    store.set({ currentTime: 5 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
