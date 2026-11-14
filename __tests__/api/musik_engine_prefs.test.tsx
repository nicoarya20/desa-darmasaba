// @vitest-environment node
// Preferensi mesin Musik Desa: bunyikan kembali dari volume 0 (F8).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicProvider, useMusic } from '@/app/context/MusicContext';
import { DEFAULT_VOLUME } from '@/app/context/music/useVolume';
import { fakeStorage, installBrowserStubs, lastAudio, libraryReply, mount, run, song } from './_musik_engine_harness';

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
