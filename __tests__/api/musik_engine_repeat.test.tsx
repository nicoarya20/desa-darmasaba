// @vitest-environment node
// Mode ulang mesin Musik Desa: mati berhenti setelah lagu terakhir, semua melingkar, satu mengulang lagu.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicProvider, useMusic } from '@/app/context/MusicContext';
import { fire, installBrowserStubs, lastAudio, libraryReply, mount, RequestLibrary, run, song } from './_musik_engine_harness';

const toast = vi.hoisted(() => ({ info: vi.fn(), error: vi.fn() }));
vi.mock('react-toastify', () => ({ toast }));

let music: ReturnType<typeof useMusic>;
function Probe() {
  music = useMusic();
  return null;
}

const [A, B, C] = [song('a'), song('b'), song('c')];

async function start() {
  installBrowserStubs([libraryReply([A, B, C])]);
  await mount(
    <MusicProvider>
      <RequestLibrary />
      <Probe />
    </MusicProvider>
  );
}

async function setMode(mode: 'off' | 'all' | 'one') {
  for (let i = 0; i < 3 && music.repeatMode !== mode; i += 1) await run(() => music.cycleRepeat());
  expect(music.repeatMode).toBe(mode);
}

beforeEach(() => {
  toast.info.mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('mode ulang', () => {
  it('bawaan mati; tombol bersiklus mati → semua → satu → mati', async () => {
    await start();
    expect(music.repeatMode).toBe('off');
    const seen: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      await run(() => music.cycleRepeat());
      seen.push(music.repeatMode);
    }
    expect(seen).toEqual(['all', 'one', 'off']);
  });

  it('mati: lagu terakhir selesai → berhenti, tidak kembali ke lagu pertama, tanpa toast', async () => {
    await start();
    await run(() => music.playSong(C));
    const audio = lastAudio();
    const loads = audio.calls.load;
    expect(music.hasNext).toBe(false);
    expect(music.upNext).toEqual([]);

    await fire(audio, 'ended');

    expect(music.currentSong?.id).toBe('c');
    expect(music.isPlaying).toBe(false);
    expect(audio.calls.load).toBe(loads);
    expect(toast.info).not.toHaveBeenCalled();
  });

  it('mati: lagu tengah selesai → lanjut ke lagu berikutnya', async () => {
    await start();
    await run(() => music.playSong(A));
    expect(music.hasNext).toBe(true);
    expect(music.upNext.map((s) => s.id)).toEqual(['b', 'c']);
    await fire(lastAudio(), 'ended');
    expect(music.currentSong?.id).toBe('b');
  });

  it('mati: Sebelumnya di lagu pertama mengulang dari awal, tidak lompat ke lagu terakhir', async () => {
    await start();
    await run(() => music.playSong(A));
    lastAudio().currentTime = 1;
    await run(() => music.playPrev());
    expect(music.currentSong?.id).toBe('a');
    expect(lastAudio().currentTime).toBe(0);
  });

  it('semua: lagu terakhir selesai → melingkar ke lagu pertama; Berikutnya tetap tersedia', async () => {
    await start();
    await setMode('all');
    await run(() => music.playSong(C));
    expect(music.hasNext).toBe(true);
    expect(music.upNext.map((s) => s.id)).toEqual(['a', 'b']);
    await fire(lastAudio(), 'ended');
    expect(music.currentSong?.id).toBe('a');
  });

  it('satu: lagu selesai → lagu yang sama diputar ulang dari awal tanpa memuat ulang', async () => {
    await start();
    await setMode('one');
    await run(() => music.playSong(B));
    const audio = lastAudio();
    const { load, play } = audio.calls;
    audio.currentTime = 180;
    await fire(audio, 'ended');
    expect(music.currentSong?.id).toBe('b');
    expect(audio.currentTime).toBe(0);
    expect(audio.calls.load).toBe(load);
    expect(audio.calls.play).toBe(play + 1);
  });

  it('satu: Berikutnya manual tetap pindah lagu (melingkar)', async () => {
    await start();
    await setMode('one');
    await run(() => music.playSong(C));
    await run(() => music.playNext());
    expect(music.currentSong?.id).toBe('a');
  });
});
